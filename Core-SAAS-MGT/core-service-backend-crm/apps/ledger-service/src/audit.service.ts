import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { GlAccount } from './entities/gl-account.entity';
import { LedgerEvent } from './entities/ledger-event.entity';
import { TripFinancialRecord } from './entities/trip-financial-record.entity';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerEntryRepo: Repository<LedgerEntry>,
    @InjectRepository(GlAccount)
    private readonly glAccountRepo: Repository<GlAccount>,
    @InjectRepository(LedgerEvent)
    private readonly ledgerEventRepo: Repository<LedgerEvent>,
    @InjectRepository(TripFinancialRecord)
    private readonly tripFinancialRepo: Repository<TripFinancialRecord>,
  ) {}

  async listAuditTrail(tenantId: string, page = 0, pageSize = 20) {
    const [entries, totalItems] = await this.journalRepo.findAndCount({
      where: { tenantId },
      relations: ['entries', 'entries.account'],
      order: { createdAt: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    });
    return {
      data: entries,
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    };
  }

  async getFullAuditTrail(reference: string, tenantId: string) {
    const journal = await this.journalRepo.findOne({
      where: { reference, tenantId },
      relations: ['entries', 'entries.account'],
    });

    if (!journal) {
      const tripRecord = await this.tripFinancialRepo.findOne({
        where: { paystackReference: reference, tenantId },
      });
      if (tripRecord) {
        return this.buildTripAuditTrail(tripRecord);
      }
      return null;
    }

    const events = await this.ledgerEventRepo.find({
      where: { streamId: journal.id, tenantId },
      order: { version: 'ASC' },
    });

    const relatedJournals = await this.findRelatedJournals(
      reference,
      tenantId,
    );

    return {
      transaction: {
        id: journal.id,
        reference: journal.reference,
        description: journal.description,
        postingDate: journal.postingDate,
        currency: journal.currency,
        totalAmount: journal.totalAmount,
        tenantId: journal.tenantId,
        createdAt: journal.createdAt,
        updatedAt: journal.updatedAt,
      },
      entries: journal.entries.map((entry) => ({
        id: entry.id,
        amount: Number(entry.amount),
        side: entry.side,
        glAccount: entry.account
          ? {
              code: entry.account.code,
              name: entry.account.name,
              type: entry.account.type,
            }
          : null,
        subLedgerId: entry.subLedgerId,
        subLedgerType: entry.subLedgerType,
        tenantId: entry.tenantId,
      })),
      events: events.map((event) => ({
        version: event.version,
        type: event.type,
        data: event.data,
        metadata: event.metadata,
        timestamp: event.createdAt,
      })),
      relatedTransactions: relatedJournals,
    };
  }

  async getTransactionGlImpact(
    journalId: string,
    tenantId: string,
  ) {
    const journal = await this.journalRepo.findOne({
      where: { id: journalId, tenantId },
      relations: ['entries', 'entries.account'],
    });

    if (!journal) return null;

    const glImpact: Record<
      string,
      {
        accountCode: string;
        accountName: string;
        accountType: string;
        totalDebit: number;
        totalCredit: number;
        netChange: number;
      }
    > = {};

    for (const entry of journal.entries) {
      const account = entry.account;
      if (!account) continue;

      const key = account.id;
      if (!glImpact[key]) {
        glImpact[key] = {
          accountCode: account.code,
          accountName: account.name,
          accountType: account.type,
          totalDebit: 0,
          totalCredit: 0,
          netChange: 0,
        };
      }

      const amount = Number(entry.amount);
      if (entry.side === 'DEBIT') {
        glImpact[key].totalDebit += amount;
        glImpact[key].netChange += amount;
      } else {
        glImpact[key].totalCredit += amount;
        glImpact[key].netChange -= amount;
      }
    }

    return {
      journalId: journal.id,
      reference: journal.reference,
      description: journal.description,
      glImpact: Object.values(glImpact),
      totalDebit: Object.values(glImpact).reduce(
        (sum, acc) => sum + acc.totalDebit,
        0,
      ),
      totalCredit: Object.values(glImpact).reduce(
        (sum, acc) => sum + acc.totalCredit,
        0,
      ),
    };
  }

  async getBalanceSheet(tenantId: string, asOfDate?: Date) {
    const accounts = await this.glAccountRepo.find({ where: { tenantId } });

    const dateFilter = asOfDate || new Date();

    const signForType = (type: string) => {
      if (type === 'asset' || type === 'expense') return 1;
      return -1;
    };

    const assets = accounts
      .filter((a) => a.type === 'asset')
      .map((a) => ({
        code: a.code,
        name: a.name,
        balance: signForType(a.type) * Number(a.balance),
      }));

    const liabilities = accounts
      .filter((a) => a.type === 'liability')
      .map((a) => ({
        code: a.code,
        name: a.name,
        balance: signForType(a.type) * Number(a.balance),
      }));

    const incomeTotal = accounts
      .filter((a) => a.type === 'income')
      .reduce((sum, a) => sum + signForType(a.type) * Number(a.balance), 0);

    const expenseTotal = accounts
      .filter((a) => a.type === 'expense')
      .reduce((sum, a) => sum + signForType(a.type) * Number(a.balance), 0);

    const retainedEarnings = incomeTotal - expenseTotal;

    const equityAccounts = accounts
      .filter((a) => a.type === 'equity')
      .map((a) => ({
        code: a.code,
        name: a.name,
        balance: signForType(a.type) * Number(a.balance),
      }));

    if (retainedEarnings !== 0) {
      equityAccounts.push({
        code: 'retained-earnings',
        name: 'Retained Earnings',
        balance: retainedEarnings,
      });
    }

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
    const totalEquity = equityAccounts.reduce((sum, e) => sum + e.balance, 0);

    return {
      asOfDate: dateFilter,
      tenantId,
      assets: { accounts: assets, total: totalAssets },
      liabilities: { accounts: liabilities, total: totalLiabilities },
      equity: { accounts: equityAccounts, total: totalEquity },
      accountingEquation: {
        assets: totalAssets,
        liabilitiesPlusEquity: totalLiabilities + totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      },
    };
  }

  async getProfitAndLoss(
    tenantId: string,
    fromDate?: string,
    toDate?: string,
  ) {
    const qb = this.journalRepo
      .createQueryBuilder('journal')
      .leftJoinAndSelect('journal.entries', 'entry')
      .leftJoinAndSelect('entry.account', 'account')
      .where('journal.tenantId = :tenantId', { tenantId });

    if (fromDate) {
      qb.andWhere('journal.postingDate >= :fromDate', {
        fromDate: new Date(fromDate),
      });
    }
    if (toDate) {
      qb.andWhere('journal.postingDate <= :toDate', {
        toDate: new Date(toDate),
      });
    }

    const journals = await qb.getMany();

    const income: Record<string, number> = {};
    const expenses: Record<string, number> = {};
    let totalIncome = 0;
    let totalExpenses = 0;

    for (const journal of journals) {
      for (const entry of journal.entries) {
        const account = entry.account;
        if (!account) continue;

        const amount = Number(entry.amount);
        if (account.type === 'income') {
          if (entry.side === 'CREDIT') {
            income[account.name] = (income[account.name] || 0) + amount;
            totalIncome += amount;
          }
        } else if (account.type === 'expense') {
          if (entry.side === 'DEBIT') {
            expenses[account.name] = (expenses[account.name] || 0) + amount;
            totalExpenses += amount;
          }
        }
      }
    }

    return {
      tenantId,
      period: { from: fromDate, to: toDate },
      income: Object.entries(income).map(([name, amount]) => ({
        name,
        amount,
      })),
      totalIncome,
      expenses: Object.entries(expenses).map(([name, amount]) => ({
        name,
        amount,
      })),
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
    };
  }

  async getTrialBalance(tenantId: string) {
    const accounts = await this.glAccountRepo.find({ where: { tenantId } });

    const rows = accounts
      .filter((a) => a.code.length >= 4)
      .map((a) => {
        const balance = Number(a.balance);
        return {
          code: a.code,
          name: a.name,
          type: a.type,
          debit: balance > 0 ? balance : 0,
          credit: balance < 0 ? Math.abs(balance) : 0,
        };
      });

    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

    return {
      tenantId,
      asOfDate: new Date(),
      accounts: rows,
      totalDebit,
      totalCredit,
      balanced: Math.abs(totalDebit - totalCredit) < 0.01,
    };
  }

  private async findRelatedJournals(
    reference: string,
    tenantId: string,
  ) {
    const baseRef = reference.replace(/^(PAYSTACK-|TRIP-ALLOC-|DRV-CREDIT-)/, '');
    const patterns = [
      `PAYSTACK-${baseRef}`,
      `TRIP-ALLOC-%${baseRef.slice(0, 8)}%`,
      `DRV-CREDIT-%${baseRef.slice(0, 8)}%`,
    ];

    const journals: Array<{
      id: string;
      reference: string;
      description: string;
      totalAmount: number;
    }> = [];

    for (const pattern of patterns) {
      const results = await this.journalRepo.find({
        where: { reference: pattern as any, tenantId },
      });
      for (const j of results) {
        journals.push({
          id: j.id,
          reference: j.reference,
          description: j.description,
          totalAmount: Number(j.totalAmount),
        });
      }
    }

    return journals;
  }

  private async buildTripAuditTrail(record: TripFinancialRecord) {
    const journalIds = [
      record.paymentJournalId,
      record.revenueJournalId,
      record.driverCreditJournalId,
      record.partnerSettlementJournalId,
    ].filter(Boolean) as string[];

    const journals = journalIds.length
      ? await this.journalRepo.find({
          where: journalIds.map((id) => ({ id, tenantId: record.tenantId })),
          relations: ['entries', 'entries.account'],
        })
      : [];

    return {
      tripId: record.tripId,
      tenantId: record.tenantId,
      financialSummary: {
        totalFare: Number(record.totalFare),
        platformCommission: Number(record.platformCommissionAmount),
        partnerCommission: Number(record.partnerCommissionAmount),
        driverPayout: Number(record.driverPayout),
        gatewayFee: Number(record.gatewayFee),
      },
      status: record.status,
      isCorporateDriver: record.isCorporateDriver,
      auditTrail: record.auditTrail || [],
      journals: journals.map((j) => ({
        id: j.id,
        reference: j.reference,
        description: j.description,
        totalAmount: Number(j.totalAmount),
        entries: j.entries.map((e) => ({
          amount: Number(e.amount),
          side: e.side,
          glAccount: e.account
            ? {
                code: e.account.code,
                name: e.account.name,
                type: e.account.type,
              }
            : null,
          subLedgerId: e.subLedgerId,
          subLedgerType: e.subLedgerType,
        })),
      })),
      settlementStatus: {
        paymentReceived: !!record.paymentJournalId,
        revenuePosted: !!record.revenueJournalId,
        driverCredited: !!record.driverCreditJournalId,
        partnerSettled: !!record.partnerSettlementJournalId,
      },
    };
  }
}
