import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  PaymentDispute,
  DisputeStatus,
  DisputeType,
  DisputeRaisedBy,
} from '../entities/payment-dispute.entity';
import { BankTransfer, BankTransferStatus } from '../entities/bank-transfer.entity';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { DriverDebt } from '../entities/driver-debt.entity';
import { CreateDisputeDto, ResolveDisputeDto, QueryDisputeDto } from '../dto/dispute.dto';

@Injectable()
export class DisputeService {
  constructor(
    @InjectRepository(PaymentDispute)
    private readonly disputeRepository: Repository<PaymentDispute>,
    @InjectRepository(BankTransfer)
    private readonly bankTransferRepository: Repository<BankTransfer>,
    @InjectRepository(DriverLedger)
    private readonly driverLedgerRepository: Repository<DriverLedger>,
    @InjectRepository(DriverDebt)
    private readonly driverDebtRepository: Repository<DriverDebt>,
  ) {}

  async createDispute(dto: CreateDisputeDto): Promise<PaymentDispute> {
    const dispute = this.disputeRepository.create({
      tenantId: dto.tenantId,
      tripId: dto.tripId,
      driverCustomerId: dto.driverCustomerId,
      riderCustomerId: dto.riderCustomerId,
      disputeType: dto.disputeType,
      raisedBy: dto.raisedBy,
      disputedAmount: Number(dto.disputedAmount),
      reason: dto.reason,
      bankTransferId: dto.bankTransferId,
      evidence: dto.evidence || {},
      status: DisputeStatus.OPEN,
    });

    const saved = await this.disputeRepository.save(dispute);

    if (dto.bankTransferId) {
      await this.bankTransferRepository.update(dto.bankTransferId, {
        status: BankTransferStatus.DISPUTED,
        disputeId: saved.id,
      });
    }

    return saved;
  }

  async resolveDispute(id: string, tenantId: string, dto: ResolveDisputeDto): Promise<PaymentDispute> {
    const where: any = { id };
    if (tenantId !== 'root-admin') where.tenantId = tenantId;
    const dispute = await this.disputeRepository.findOne({ where });
    if (!dispute) throw new NotFoundException('Dispute not found');
    if (dispute.status === DisputeStatus.DISMISSED) {
      throw new BadRequestException('Dispute is already dismissed');
    }
    if (dispute.status.toString().startsWith('RESOLVED_')) {
      throw new BadRequestException('Dispute is already resolved');
    }

    dispute.status = dto.status;
    dispute.resolutionNote = dto.resolutionNote;
    dispute.resolvedAmount = dto.resolvedAmount ?? Number(dispute.disputedAmount);
    dispute.resolvedById = dto.resolvedById;
    dispute.resolvedAt = new Date();

    await this.disputeRepository.save(dispute);

    if (dto.resolvedAmount && dto.resolvedAmount > 0) {
      await this.driverLedgerRepository.save(
        this.driverLedgerRepository.create({
          tenantId: dispute.tenantId,
          driverCustomerId: dispute.driverCustomerId,
          entryType: DriverLedgerEntryType.DISPUTE_RESOLUTION,
          direction: DriverLedgerDirection.CREDIT,
          amount: Number(dto.resolvedAmount),
          runningBalance: 0,
          currency: 'NGN',
          reference: `DISP-RES-${uuidv4().slice(0, 8)}`,
          disputeId: dispute.id,
          tripId: dispute.tripId,
          description: `Dispute resolved: ${dto.resolutionNote || dto.status}`,
        }),
      );
    }

    return dispute;
  }

  async listDisputes(tenantId: string, query: QueryDisputeDto) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 25);

    const qb = this.disputeRepository.createQueryBuilder('pd');
    if (tenantId !== 'root-admin') {
      qb.andWhere('pd.tenantId = :tenantId', { tenantId });
    }

    if (query.status) {
      qb.andWhere('pd.status = :status', { status: query.status });
    }
    if (query.disputeType) {
      qb.andWhere('pd.disputeType = :disputeType', { disputeType: query.disputeType });
    }

    qb.orderBy('pd.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    return { data, page, pageSize, totalPages, totalItems, hasMore: page < totalPages };
  }

  async getDispute(id: string, tenantId: string): Promise<PaymentDispute> {
    const where: any = { id };
    if (tenantId !== 'root-admin') where.tenantId = tenantId;
    const dispute = await this.disputeRepository.findOne({ where });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }
}
