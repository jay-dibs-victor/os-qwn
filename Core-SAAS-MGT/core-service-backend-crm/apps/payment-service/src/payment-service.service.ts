import {
  Injectable,
  Logger,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import axios from 'axios';
import { PaymentInstruction } from './entities/payment-instruction.entity';
import { PaymentRail, PaymentStatus } from './constants/enums';
import { PaymentStatusLog } from './entities/payment-status-log.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { SmartRoutingService } from './smart-routing.service';
import { PaymentEventsPublisher } from './payment-events.publisher';

@Injectable()
export class PaymentServiceService {
  private readonly logger = new Logger(PaymentServiceService.name);
  private readonly redisClient: Redis;

  constructor(
    @InjectRepository(PaymentInstruction)
    private readonly paymentInstructionRepo: Repository<PaymentInstruction>,
    @InjectRepository(PaymentStatusLog)
    private readonly paymentStatusLogRepo: Repository<PaymentStatusLog>,
    private readonly configService: ConfigService,
    private readonly smartRoutingService: SmartRoutingService,
    private readonly paymentEventsPublisher: PaymentEventsPublisher,
  ) {
    this.redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });
  }

  async processPayment(dto: CreatePaymentDto, idempotencyKey: string) {
    this.logger.log(`Processing payment ${idempotencyKey}`);

    // 1. Idempotency Check using Redis
    const lockKey = `payment:lock:${idempotencyKey}`;
    const acquired = await this.redisClient.set(
      lockKey,
      'locked',
      'EX',
      60,
      'NX',
    );

    if (!acquired) {
      this.logger.warn(
        `Idempotency key ${idempotencyKey} is currently locked by another process.`,
      );
      throw new ConflictException(
        'Payment request is already being processed.',
      );
    }

    let instruction: PaymentInstruction | null = null;

    try {
      // 2. Check if it exists in DB
      instruction = await this.paymentInstructionRepo.findOne({
        where: { idempotencyKey },
      });

      if (instruction) {
        return instruction; // Idempotent response
      }

      // 3. PND/PNC & KYC Checks via Accounts Service
      const accountsHost = this.configService.get<string>(
        'ACCOUNTS_SERVICE_HOST',
      );
      const accountsPort = this.configService.get<number>(
        'ACCOUNTS_SERVICE_PORT',
      );
      const accountsUrl = `http://${accountsHost}:${accountsPort}/accounts`;

      try {
        // Check source account restriction (DEBIT)
        await axios.get(
          `${accountsUrl}/${dto.sourceAccountId}/check-restriction`,
          {
            params: { type: 'DEBIT' },
          },
        );

        // Check source account KYC Limit
        await axios.get(
          `${accountsUrl}/${dto.sourceAccountId}/check-kyc-limits`,
          {
            params: { amount: dto.amount },
          },
        );

        // For internal transfers, check target account restriction (CREDIT)
        if (dto.rail === PaymentRail.INTERNAL) {
          await axios.get(
            `${accountsUrl}/${dto.targetAccountId}/check-restriction`,
            {
              params: { type: 'CREDIT' },
            },
          );
        }
      } catch (error: any) {
        this.logger.error(`Account check failed: ${error.message}`);
        throw new BadRequestException('Account restriction or limit exceeded.');
      }

      // 3.5 Approval Check (Amounts > ₦100,000)
      if (dto.amount > 100000 && !dto.approvalId) {
        throw new BadRequestException(
          'Transactions above ₦100,000 require multi-level approval.',
        );
      }

      // 4. Save Instruction (PENDING)
      instruction = this.paymentInstructionRepo.create({
        ...dto,
        idempotencyKey,
        status: PaymentStatus.PENDING,
      });
      await this.paymentInstructionRepo.save(instruction);

      // Emit initiated event
      this.paymentEventsPublisher.publishInitiated(instruction);

      // 5. Route based on rail
      if (dto.rail === PaymentRail.INTERNAL) {
        return this.processInternalTransfer(instruction);
      } else {
        const result =
          await this.smartRoutingService.executeExternalTransfer(instruction);

        instruction.status = result.success
          ? PaymentStatus.COMPLETED
          : PaymentStatus.FAILED;
        instruction.reference = result.reference;
        await this.paymentInstructionRepo.save(instruction);

        await this.paymentStatusLogRepo.save({
          paymentInstruction: instruction,
          status: instruction.status,
          providerResponse: result.rawResponse,
        });

        // Emit final status events
        if (result.success) {
          this.paymentEventsPublisher.publishCompleted(instruction);
        } else {
          this.paymentEventsPublisher.publishFailed(
            instruction,
            result.rawResponse?.message || 'External rail execution failed',
          );
        }

        return instruction;
      }
    } catch (error: any) {
      if (instruction && instruction.status !== PaymentStatus.COMPLETED) {
        this.paymentEventsPublisher.publishFailed(
          instruction,
          error.message || 'Payment processing failed',
        );
      }
      throw error;
    } finally {
      // Release idempotency lock
      await this.redisClient.del(lockKey);
    }
  }

  private async processInternalTransfer(instruction: PaymentInstruction) {
    this.logger.log(
      `Processing internal transfer for instruction ${instruction.id}`,
    );

    instruction.status = PaymentStatus.PROCESSING;
    await this.paymentInstructionRepo.save(instruction);

    const ledgerHost = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const ledgerPort = this.configService.get<number>('LEDGER_SERVICE_PORT');
    const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/posting/transaction`;
    const accountsHost = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const accountsPort = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    const accountsUrl = `http://${accountsHost}:${accountsPort}/accounts`;

    try {
      const [sourceAccount, targetAccount] = await Promise.all([
        axios.get(`${accountsUrl}/${instruction.sourceAccountId}`),
        axios.get(`${accountsUrl}/${instruction.targetAccountId}`),
      ]);

      const sourceGlAccountId = sourceAccount.data?.glAccountId as string | undefined;
      const targetGlAccountId = targetAccount.data?.glAccountId as string | undefined;

      if (!sourceGlAccountId) {
        throw new BadRequestException(
          `Source account ${instruction.sourceAccountId} has no linked glAccountId`,
        );
      }
      if (!targetGlAccountId) {
        throw new BadRequestException(
          `Target account ${instruction.targetAccountId} has no linked glAccountId`,
        );
      }

      const response = await axios.post(ledgerUrl, {
        reference: instruction.id,
        description: `Internal transfer ${instruction.sourceAccountId} -> ${instruction.targetAccountId}`,
        postingDate: new Date(),
        currency: instruction.currency,
        tenantId: instruction.tenantId,
        entries: [
          {
            glAccountId: sourceGlAccountId,
            amount: instruction.amount,
            side: 'DEBIT',
            subLedgerId: instruction.sourceAccountId,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
          {
            glAccountId: targetGlAccountId,
            amount: instruction.amount,
            side: 'CREDIT',
            subLedgerId: instruction.targetAccountId,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
        ],
      });

      instruction.status = PaymentStatus.COMPLETED;
      instruction.reference = response.data.id;
      await this.paymentInstructionRepo.save(instruction);

      await this.paymentStatusLogRepo.save({
        paymentInstruction: instruction,
        status: PaymentStatus.COMPLETED,
        providerResponse: response.data,
      });

      // Emit completed event
      this.paymentEventsPublisher.publishCompleted(instruction);

      return instruction;
    } catch (error: any) {
      this.logger.error(`Internal transfer failed: ${error.message}`);

      instruction.status = PaymentStatus.FAILED;
      await this.paymentInstructionRepo.save(instruction);

      await this.paymentStatusLogRepo.save({
        paymentInstruction: instruction,
        status: PaymentStatus.FAILED,
        providerResponse: error.response?.data || { message: error.message },
      });

      // Emit failed event
      this.paymentEventsPublisher.publishFailed(
        instruction,
        error.response?.data?.message || error.message,
      );

      throw new BadRequestException(
        'Internal transfer failed at ledger level.',
      );
    }
  }

  async findById(id: string): Promise<PaymentInstruction> {
    const instruction = await this.paymentInstructionRepo.findOne({
      where: { id },
      relations: ['statusLogs'],
    });
    if (!instruction) {
      throw new NotFoundException(`Payment instruction ${id} not found`);
    }
    return instruction;
  }

  async list(query: QueryPaymentDto): Promise<PaymentInstruction[]> {
    const where: Partial<PaymentInstruction> = {};
    if (query.status) where.status = query.status;
    if (query.rail) where.rail = query.rail;
    if (query.tenantId) where.tenantId = query.tenantId;
    if (query.sourceAccountId) where.sourceAccountId = query.sourceAccountId;

    return this.paymentInstructionRepo.find({
      where,
      order: { createdAt: 'DESC' },
      take: 100,
      relations: ['statusLogs'],
    });
  }

  async listHistory(query: QueryPaymentDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;

    const qb = this.paymentInstructionRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.statusLogs', 'statusLog')
      .orderBy('payment.createdAt', 'DESC')
      .addOrderBy('statusLog.createdAt', 'DESC');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }
    if (query.rail) {
      qb.andWhere('payment.rail = :rail', { rail: query.rail });
    }
    if (query.tenantId) {
      qb.andWhere('payment.tenantId = :tenantId', { tenantId: query.tenantId });
    }
    if (query.sourceAccountId) {
      qb.andWhere('payment.sourceAccountId = :sourceAccountId', {
        sourceAccountId: query.sourceAccountId,
      });
    }
    if (query.fromDate) {
      qb.andWhere('payment.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('payment.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

    return {
      data,
      page,
      pageSize,
      totalPages,
      totalItems,
      hasMore: page < totalPages,
    };
  }
}
