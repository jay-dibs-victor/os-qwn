import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PostingEngineService } from './posting-engine.service';
import { EntrySide } from './entities/ledger-entry.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { GlAccount } from './entities/gl-account.entity';
import {
  TripFinancialRecord,
  TripFinancialStatus,
} from './entities/trip-financial-record.entity';
import { CommissionEngineService } from './commission-engine.service';
import { RecordTripRevenueDto, TripRevenueResponse } from './dto/revenue.dto';

@Injectable()
export class RevenueRecognitionService {
  private readonly logger = new Logger(RevenueRecognitionService.name);

  constructor(
    private readonly postingEngineService: PostingEngineService,
    private readonly commissionEngineService: CommissionEngineService,
    private readonly configService: ConfigService,
    private readonly connection: Connection,
    @InjectRepository(TripFinancialRecord)
    private readonly tripFinancialRepo: Repository<TripFinancialRecord>,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
  ) {}

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  async recordTripRevenue(
    dto: RecordTripRevenueDto,
  ): Promise<TripRevenueResponse> {
    const existingRecord = await this.tripFinancialRepo.findOne({
      where: { tripId: dto.tripId, tenantId: dto.tenantId },
    });
    if (existingRecord) {
      return this.buildResponseFromExisting(existingRecord);
    }

    const isCorporate = dto.isCorporateDriver ?? !!dto.partnerTenantId;
    const platformRate = dto.platformCommissionRate ?? 0.10;
    const partnerRate = dto.partnerCommissionRate ?? 0.05;

    const commission = await this.commissionEngineService.calculateCommissions({
      amount: dto.totalFare,
      platformRate,
      partnerRate,
      isCorporate,
      partnerId: dto.partnerTenantId,
      driverId: dto.driverCustomerId,
      tenantId: dto.tenantId,
    });

    const glAccounts = await this.resolveGlAccounts(dto.tenantId);
    const journalEntries: Array<{ reference: string; id: string; description: string }> = [];

    const paymentRef = `PAYSTACK-${dto.paystackReference || uuidv4().slice(0, 12)}`;
    const allocationRef = `TRIP-ALLOC-${dto.tripId.slice(0, 8)}-${uuidv4().slice(0, 6)}`;
    const driverPayRef = `DRV-CREDIT-${dto.tripId.slice(0, 8)}-${uuidv4().slice(0, 6)}`;

    const financialRecord = this.tripFinancialRepo.create({
      tripId: dto.tripId,
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      riderCustomerId: dto.riderCustomerId,
      partnerTenantId: dto.partnerTenantId,
      totalFare: dto.totalFare,
      platformCommissionAmount: commission.platformCommission,
      platformCommissionRate: platformRate,
      partnerCommissionAmount: commission.partnerCommission,
      partnerCommissionRate: partnerRate,
      gatewayFee: commission.gatewayFee,
      driverPayout: commission.driverPayout,
      currency: dto.currency || 'NGN',
      status: TripFinancialStatus.PAYMENT_RECEIVED,
      paystackReference: dto.paystackReference,
      isCorporateDriver: isCorporate,
      auditTrail: [
        {
          event: 'REVENUE_RECORD_CREATED',
          timestamp: new Date().toISOString(),
          actor: 'RevenueRecognitionService',
          details: { dto },
        },
      ],
    });

    const savedRecord = await this.tripFinancialRepo.save(financialRecord);

    try {
      const paymentJournal = await this.postingEngineService.postTransaction({
        reference: paymentRef,
        description: `Payment received for trip ${dto.tripId}`,
        postingDate: new Date(),
        currency: dto.currency || 'NGN',
        tenantId: dto.tenantId,
        entries: [
          {
            glAccountId: glAccounts.paystackClearing.id,
            amount: dto.totalFare,
            side: EntrySide.DEBIT,
          },
          {
            glAccountId: glAccounts.unsettledCollections.id,
            amount: dto.totalFare,
            side: EntrySide.CREDIT,
          },
        ],
      });
      journalEntries.push({
        reference: paymentRef,
        id: paymentJournal.id,
        description: 'Paystack payment clearing entry',
      });
      savedRecord.paymentJournalId = paymentJournal.id;
      savedRecord.status = TripFinancialStatus.PAYMENT_RECEIVED;
      await this.tripFinancialRepo.save(savedRecord);
    } catch (error: unknown) {
      this.logger.error(
        `Payment journal posting failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      savedRecord.status = TripFinancialStatus.PENDING_PAYMENT;
      await this.tripFinancialRepo.save(savedRecord);
      throw new BadRequestException(
        `Failed to post payment journal: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const allocationEntries: Array<{
        glAccountId: string;
        amount: number;
        side: EntrySide;
        subLedgerId?: string;
        subLedgerType?: string;
      }> = [
        {
          glAccountId: glAccounts.unsettledCollections.id,
          amount: dto.totalFare,
          side: EntrySide.DEBIT,
        },
        {
          glAccountId: glAccounts.tripCommissionRevenue.id,
          amount: commission.platformCommission,
          side: EntrySide.CREDIT,
        },
      ];

      if (isCorporate && commission.partnerCommission > 0) {
        allocationEntries.push({
          glAccountId: glAccounts.partnerCommissionPayable.id,
          amount: commission.partnerCommission,
          side: EntrySide.CREDIT,
          subLedgerId: dto.partnerTenantId || '',
          subLedgerType: 'PARTNER_ACCOUNT',
        });
      }

      allocationEntries.push({
        glAccountId: glAccounts.driverEarningsPayable.id,
        amount: commission.driverPayout,
        side: EntrySide.CREDIT,
        subLedgerId: dto.driverCustomerId,
        subLedgerType: 'DRIVER_ACCOUNT',
      });

      if (commission.gatewayFee > 0) {
        allocationEntries.push({
          glAccountId: glAccounts.paystackClearing.id,
          amount: commission.gatewayFee,
          side: EntrySide.CREDIT,
        });
      }

      const allocationJournal = await this.postingEngineService.postTransaction({
        reference: allocationRef,
        description: `Revenue allocation for trip ${dto.tripId}`,
        postingDate: new Date(),
        currency: dto.currency || 'NGN',
        tenantId: dto.tenantId,
        entries: allocationEntries,
      });

      journalEntries.push({
        reference: allocationRef,
        id: allocationJournal.id,
        description: 'Trip revenue allocation entry',
      });
      savedRecord.revenueJournalId = allocationJournal.id;
      savedRecord.status = TripFinancialStatus.REVENUE_POSTED;
      savedRecord.auditTrail = [
        ...(savedRecord.auditTrail || []),
        {
          event: 'REVENUE_POSTED',
          timestamp: new Date().toISOString(),
          actor: 'RevenueRecognitionService',
          details: {
            allocationRef,
            platformCommission: commission.platformCommission,
            partnerCommission: commission.partnerCommission,
            driverPayout: commission.driverPayout,
          },
        },
      ];
      await this.tripFinancialRepo.save(savedRecord);
    } catch (error: unknown) {
      this.logger.error(
        `Revenue allocation journal posting failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(
        `Failed to post revenue allocation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    try {
      const { data: driverAccounts } = await axios.get(
        `${this.accountsBaseUrl}/customer/${dto.driverCustomerId}`,
        { params: { tenantId: dto.tenantId } },
      );

      const driverWalletAccount = (
        driverAccounts as Array<{
          accountNumber: string;
          glAccountId: string | null;
          currency: string;
        }>
      ).find((a) => a.currency === (dto.currency || 'NGN'));

      if (driverWalletAccount?.glAccountId) {
        const driverCreditJournal =
          await this.postingEngineService.postTransaction({
            reference: driverPayRef,
            description: `Driver wallet credit for trip ${dto.tripId}`,
            postingDate: new Date(),
            currency: dto.currency || 'NGN',
            tenantId: dto.tenantId,
            entries: [
              {
                glAccountId: glAccounts.driverEarningsPayable.id,
                amount: commission.driverPayout,
                side: EntrySide.DEBIT,
                subLedgerId: dto.driverCustomerId,
                subLedgerType: 'DRIVER_ACCOUNT',
              },
              {
                glAccountId: driverWalletAccount.glAccountId,
                amount: commission.driverPayout,
                side: EntrySide.CREDIT,
                subLedgerId: driverWalletAccount.accountNumber,
                subLedgerType: 'CUSTOMER_ACCOUNT',
              },
            ],
          });

        journalEntries.push({
          reference: driverPayRef,
          id: driverCreditJournal.id,
          description: 'Driver wallet credit entry',
        });
        savedRecord.driverCreditJournalId = driverCreditJournal.id;
        savedRecord.status = TripFinancialStatus.DRIVER_CREDITED;
        savedRecord.auditTrail = [
          ...(savedRecord.auditTrail || []),
          {
            event: 'DRIVER_CREDITED',
            timestamp: new Date().toISOString(),
            actor: 'RevenueRecognitionService',
            details: {
              driverPayRef,
              driverPayout: commission.driverPayout,
              walletAccount: driverWalletAccount.accountNumber,
            },
          },
        ];
        await this.tripFinancialRepo.save(savedRecord);
      }
    } catch (error: unknown) {
      this.logger.warn(
        `Driver wallet credit failed (non-fatal): ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    savedRecord.status = TripFinancialStatus.COMPLETED;
    savedRecord.auditTrail = [
      ...(savedRecord.auditTrail || []),
      {
        event: 'TRIP_FINANCIAL_COMPLETED',
        timestamp: new Date().toISOString(),
        actor: 'RevenueRecognitionService',
        details: { journalEntries: journalEntries.length },
      },
    ];
    await this.tripFinancialRepo.save(savedRecord);

    return {
      success: true,
      message: 'Trip revenue recorded successfully',
      tripId: dto.tripId,
      status: 'COMPLETED',
      journalEntries,
      financialSummary: {
        totalFare: dto.totalFare,
        platformCommission: commission.platformCommission,
        partnerCommission: commission.partnerCommission,
        driverPayout: commission.driverPayout,
        gatewayFee: commission.gatewayFee,
      },
    };
  }

  async getTripFinancialRecord(tripId: string, tenantId: string) {
    const record = await this.tripFinancialRepo.findOne({
      where: { tripId, tenantId },
    });
    if (!record) {
      throw new BadRequestException(
        `Trip financial record not found for trip ${tripId}`,
      );
    }
    return record;
  }

  async listTripFinancialRecords(
    tenantId: string,
    query: {
      driverId?: string;
      riderId?: string;
      status?: TripFinancialStatus;
      fromDate?: string;
      toDate?: string;
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = query.page || 1;
    const pageSize = query.pageSize || 25;

    const qb = this.tripFinancialRepo
      .createQueryBuilder('tfr')
      .where('tfr.tenantId = :tenantId', { tenantId });

    if (query.driverId) {
      qb.andWhere('tfr.driverCustomerId = :driverId', {
        driverId: query.driverId,
      });
    }
    if (query.riderId) {
      qb.andWhere('tfr.riderCustomerId = :riderId', {
        riderId: query.riderId,
      });
    }
    if (query.status) {
      qb.andWhere('tfr.status = :status', { status: query.status });
    }
    if (query.fromDate) {
      qb.andWhere('tfr.createdAt >= :fromDate', {
        fromDate: new Date(query.fromDate),
      });
    }
    if (query.toDate) {
      qb.andWhere('tfr.createdAt <= :toDate', {
        toDate: new Date(query.toDate),
      });
    }

    qb.orderBy('tfr.createdAt', 'DESC')
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

  async getRevenueSummary(
    tenantId: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const qb = this.tripFinancialRepo
      .createQueryBuilder('tfr')
      .select([
        'COUNT(tfr.id) as "totalTrips"',
        'SUM(tfr.totalFare) as "grossRevenue"',
        'SUM(tfr.platformCommissionAmount) as "totalPlatformCommission"',
        'SUM(tfr.partnerCommissionAmount) as "totalPartnerCommission"',
        'SUM(tfr.driverPayout) as "totalDriverPayout"',
        'SUM(tfr.gatewayFee) as "totalGatewayFees"',
      ])
      .where('tfr.tenantId = :tenantId', { tenantId });

    if (fromDate) {
      qb.andWhere('tfr.createdAt >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    }
    if (toDate) {
      qb.andWhere('tfr.createdAt <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    const result = await qb.getRawOne();

    return {
      tenantId,
      totalTrips: Number(result?.totalTrips || 0),
      grossRevenue: Number(result?.grossRevenue || 0),
      totalPlatformCommission: Number(result?.totalPlatformCommission || 0),
      totalPartnerCommission: Number(result?.totalPartnerCommission || 0),
      totalDriverPayout: Number(result?.totalDriverPayout || 0),
      totalGatewayFees: Number(result?.totalGatewayFees || 0),
      netRevenue:
        Number(result?.totalPlatformCommission || 0) -
        Number(result?.totalGatewayFees || 0),
    };
  }

  private async resolveGlAccounts(tenantId: string) {
    const { data: { data: accounts } } = await axios.get(
      `http://${this.configService.get<string>('LEDGER_SERVICE_HOST')}:${this.configService.get<number>('LEDGER_SERVICE_PORT')}/ledger/accounts`,
      { params: { tenantId } },
    );
    const findByCode = (code: string) => {

      const acc = (accounts as Array<GlAccount>).find(
        (a: GlAccount) => a.code === code,
      );
      if (!acc)
        throw new BadRequestException(
          `GL Account ${code} not found for tenant ${tenantId}`,
        );
      return acc;
    };

    return {
      paystackClearing: findByCode('1201'),
      unsettledCollections: findByCode('2402'),
      tripCommissionRevenue: findByCode('4201'),
      partnerCommissionPayable: findByCode('2202'),
      driverEarningsPayable: findByCode('2302'),
      driverWalletLiability: findByCode('2301'),
      cashAtBank: findByCode('1101'),
      gatewayCharge: findByCode('5101'),
    };
  }

  private buildResponseFromExisting(
    record: TripFinancialRecord,
  ): TripRevenueResponse {
    return {
      success: true,
      message: 'Trip revenue already recorded',
      tripId: record.tripId,
      status: record.status,
      journalEntries: [
        ...(record.paymentJournalId
          ? [
              {
                reference: `PAYMENT-${record.tripId}`,
                id: record.paymentJournalId,
                description: 'Payment journal entry',
              },
            ]
          : []),
        ...(record.revenueJournalId
          ? [
              {
                reference: `ALLOC-${record.tripId}`,
                id: record.revenueJournalId,
                description: 'Revenue allocation entry',
              },
            ]
          : []),
        ...(record.driverCreditJournalId
          ? [
              {
                reference: `DRV-${record.tripId}`,
                id: record.driverCreditJournalId,
                description: 'Driver credit entry',
              },
            ]
          : []),
      ],
      financialSummary: {
        totalFare: Number(record.totalFare),
        platformCommission: Number(record.platformCommissionAmount),
        partnerCommission: Number(record.partnerCommissionAmount),
        driverPayout: Number(record.driverPayout),
        gatewayFee: Number(record.gatewayFee),
      },
    };
  }
}
