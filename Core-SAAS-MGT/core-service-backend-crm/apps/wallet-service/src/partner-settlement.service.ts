import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  PartnerSettlement,
  PartnerSettlementStatus,
} from './entities/partner-settlement.entity';
import {
  CreatePartnerSettlementDto,
  SettlePartnerDto,
  QueryPartnerSettlementDto,
} from './dto/partner-settlement.dto';

@Injectable()
export class PartnerSettlementService {
  private readonly logger = new Logger(PartnerSettlementService.name);

  constructor(
    @InjectRepository(PartnerSettlement)
    private readonly settlementRepo: Repository<PartnerSettlement>,
    private readonly configService: ConfigService,
  ) {}

  private get ledgerBaseUrl() {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT');
    return `http://${host}:${port}/ledger`;
  }

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  async createSettlement(
    dto: CreatePartnerSettlementDto,
  ): Promise<PartnerSettlement> {
    const reference = dto.reference || `PARTNER-SET-${uuidv4().slice(0, 12)}`;

    const existing = await this.settlementRepo.findOne({
      where: { reference, tenantId: dto.tenantId },
    });
    if (existing) {
      return existing;
    }

    const settlement = this.settlementRepo.create({
      tenantId: dto.tenantId,
      partnerId: dto.partnerId,
      settlementType: dto.settlementType || 'COMMISSION' as any,
      status: PartnerSettlementStatus.PENDING,
      amount: dto.amount,
      currency: dto.currency || 'NGN',
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      description: dto.description,
      reference,
      auditTrail: [
        {
          event: 'SETTLEMENT_CREATED',
          timestamp: new Date().toISOString(),
          actor: 'PartnerSettlementService',
          details: { dto },
        },
      ],
      metadata: dto.metadata,
    });

    const saved = await this.settlementRepo.save(settlement);

    try {
      const { data: glAccountsResp } = await axios.get(
        `${this.ledgerBaseUrl}/accounts`,
        { params: { tenantId: dto.tenantId } },
      );

      const glAccountList: Array<{ code: string; id: string }> = glAccountsResp.data || glAccountsResp;
      const partnerPayableGl = glAccountList.find(
        (a) => a.code === '2202',
      );
      const revenueGl = glAccountList.find(
        (a) => a.code === '4202',
      );

      if (partnerPayableGl && revenueGl) {
        const { data: journal } = await axios.post(
          `${this.ledgerBaseUrl}/posting/transaction`,
          {
            reference: `SETTLE-ACCRUE-${reference}`,
            description: `Settlement accrual for partner ${dto.partnerId}`,
            postingDate: new Date(),
            currency: dto.currency || 'NGN',
            tenantId: dto.tenantId,
            entries: [
              {
                glAccountId: revenueGl.id,
                amount: dto.amount,
                side: 'DEBIT',
                subLedgerId: dto.partnerId,
                subLedgerType: 'PARTNER_ACCOUNT',
              },
              {
                glAccountId: partnerPayableGl.id,
                amount: dto.amount,
                side: 'CREDIT',
                subLedgerId: dto.partnerId,
                subLedgerType: 'PARTNER_ACCOUNT',
              },
            ],
          },
        );

        saved.journalEntryId = journal.id;
        saved.auditTrail = [
          ...(saved.auditTrail || []),
          {
            event: 'ACCRUAL_POSTED',
            timestamp: new Date().toISOString(),
            actor: 'PartnerSettlementService',
            details: { journalId: journal.id },
          },
        ];
        await this.settlementRepo.save(saved);
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Settlement accrual posting failed (non-fatal): ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return saved;
  }

  async settlePartner(dto: SettlePartnerDto) {
    const settlement = await this.settlementRepo.findOne({
      where: { id: dto.settlementId, tenantId: dto.tenantId },
    });
    if (!settlement) {
      throw new BadRequestException('Partner settlement not found');
    }

    if (settlement.status === PartnerSettlementStatus.SETTLED) {
      throw new BadRequestException('Partner settlement already completed');
    }

    const settleAmount = dto.amount || Number(settlement.amount);
    const reference = `PARTNER-REMITTANCE-${uuidv4().slice(0, 12)}`;

    const { data: account } = await axios.get(
      `${this.accountsBaseUrl}/${dto.partnerAccountNumber}`,
    );
    if (!account?.glAccountId) {
      throw new BadRequestException(
        'Partner account not linked to a GL account',
      );
    }

    const { data: glAccountsResp } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId: dto.tenantId } },
    );

    const glAccountList: Array<{ code: string; id: string }> = glAccountsResp.data || glAccountsResp;
    const partnerPayableGl = glAccountList.find(
      (a) => a.code === '2202',
    );
    const cashGl = glAccountList.find(
      (a) => a.code === '1101',
    );

    if (!partnerPayableGl || !cashGl) {
      throw new BadRequestException('Required GL accounts not found');
    }

    const { data: journal } = await axios.post(
      `${this.ledgerBaseUrl}/posting/transaction`,
      {
        reference,
        description:
          dto.description || `Partner remittance to ${dto.partnerAccountNumber}`,
        postingDate: new Date(),
        currency: settlement.currency,
        tenantId: dto.tenantId,
        entries: [
          {
            glAccountId: partnerPayableGl.id,
            amount: settleAmount,
            side: 'DEBIT',
            subLedgerId: settlement.partnerId,
            subLedgerType: 'PARTNER_ACCOUNT',
          },
          {
            glAccountId: cashGl.id,
            amount: settleAmount,
            side: 'CREDIT',
          },
        ],
      },
    );

    settlement.status = PartnerSettlementStatus.SETTLED;
    settlement.paidAmount = Number(settlement.paidAmount) + settleAmount;
    settlement.settledAt = new Date();
    settlement.journalEntryId = journal.id;
    settlement.auditTrail = [
      ...(settlement.auditTrail || []),
      {
        event: 'SETTLEMENT_EXECUTED',
        timestamp: new Date().toISOString(),
        actor: 'PartnerSettlementService',
        details: {
          reference,
          amount: settleAmount,
          partnerAccount: dto.partnerAccountNumber,
          journalId: journal.id,
        },
      },
    ];
    await this.settlementRepo.save(settlement);

    return {
      success: true,
      message: 'Partner settlement completed',
      settlementId: settlement.id,
      amount: settleAmount,
      reference,
      journalEntryId: journal.id,
    };
  }

  async getPartnerBalance(
    partnerId: string,
    tenantId: string,
  ) {
    const settlements = await this.settlementRepo.find({
      where: { partnerId, tenantId },
    });

    const totalDue = settlements
      .filter((s) => s.status !== PartnerSettlementStatus.SETTLED)
      .reduce((sum, s) => sum + Number(s.amount), 0);

    const totalSettled = settlements
      .filter((s) => s.status === PartnerSettlementStatus.SETTLED)
      .reduce((sum, s) => sum + Number(s.paidAmount), 0);

    return {
      partnerId,
      tenantId,
      totalDue,
      totalSettled,
      outstandingBalance: totalDue - totalSettled,
      pendingCount: settlements.filter(
        (s) => s.status === PartnerSettlementStatus.PENDING,
      ).length,
    };
  }

  async listSettlements(query: QueryPartnerSettlementDto) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;

    const qb = this.settlementRepo
      .createQueryBuilder('ps')
      .where('ps.tenantId = :tenantId', { tenantId: query.tenantId });

    if (query.partnerId) {
      qb.andWhere('ps.partnerId = :partnerId', {
        partnerId: query.partnerId,
      });
    }
    if (query.status) {
      qb.andWhere('ps.status = :status', { status: query.status });
    }
    if (query.fromDate) {
      qb.andWhere('ps.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('ps.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.orderBy('ps.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

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
