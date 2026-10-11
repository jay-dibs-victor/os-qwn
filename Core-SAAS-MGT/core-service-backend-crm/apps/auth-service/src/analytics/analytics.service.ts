import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { User, UserStatus } from '../entities/user.entity';
import { GlAccount } from '../../../ledger-service/src/entities/gl-account.entity';
import { JournalEntry } from '../../../ledger-service/src/entities/journal-entry.entity';
import {
  LedgerEntry,
  EntrySide,
} from '../../../ledger-service/src/entities/ledger-entry.entity';

// ─── GL Account codes that power each KPI ────────────────────────────────────
const GL = {
  PLATFORM_REVENUE:      '4100',
  COMMISSION_INCOME:     '4200',
  CHAMA_LOAN_INCOME:     '4300',
  GREEN_SWAP_CREDITS:    '4400',
  DRIVER_SUBSCRIPTION:   '4500',
  PARTNER_SUBSCRIPTION:  '4600',
  CHAMA_ESCROW_LIABILITY:'2300',
  DRIVER_PAYABLE:        '2100',
};

// root-admin sees all tenants; everyone else is scoped to their own tenantId
const ROOT_TENANT = 'root-admin';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(GlAccount)
    private readonly glAccountRepo: Repository<GlAccount>,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerEntryRepo: Repository<LedgerEntry>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Sum CREDIT entries for a given GL account code, scoped by tenant and
   * optional date range.  Root-admin gets the cross-tenant aggregate.
   */
  private async sumCredits(
    accountCode: string,
    tenantId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<number> {
    const qb = this.ledgerEntryRepo
      .createQueryBuilder('le')
      .innerJoin('le.account', 'gl')
      .innerJoin('le.journalEntry', 'je')
      .select('COALESCE(SUM(le.amount), 0)', 'total')
      .where('gl.code = :code', { code: accountCode })
      .andWhere('le.side = :side', { side: EntrySide.CREDIT });

    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('le.tenantId = :tenantId', { tenantId });
    }
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      qb.andWhere('je.postingDate >= :start', { start: new Date(startDate) });
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      qb.andWhere('je.postingDate <= :end', { end: new Date(endDate) });
    }

    const row = await qb.getRawOne<{ total: string }>();
    return parseFloat(row?.total ?? '0');
  }

  /**
   * Time-series: sum CREDIT entries per calendar period (day/week/month/quarter)
   * grouped by postingDate truncated to the requested granularity.
   */
  private async timeSeries(
    accountCode: string,
    tenantId: string,
    granularity: 'day' | 'week' | 'month' | 'quarter',
    startDate: string,
    endDate: string,
    buckets: number,
  ): Promise<{ label: string; value: number }[]> {
    const startMs = new Date(startDate).getTime();
    const endMs = new Date(endDate).getTime();
    if (isNaN(startMs) || isNaN(endMs)) {
      return [];
    }

    const qb = this.ledgerEntryRepo
      .createQueryBuilder('le')
      .innerJoin('le.account', 'gl')
      .innerJoin('le.journalEntry', 'je')
      .select(`DATE_TRUNC('${granularity}', je."postingDate")`, 'period')
      .addSelect('COALESCE(SUM(le.amount), 0)', 'total')
      .where('gl.code = :code', { code: accountCode })
      .andWhere('le.side = :side', { side: EntrySide.CREDIT })
      .andWhere('je.postingDate >= :start', { start: new Date(startMs) })
      .andWhere('je.postingDate <= :end',   { end:   new Date(endMs)   })
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('le.tenantId = :tenantId', { tenantId });
    }

    const rows = await qb.getRawMany<{ period: string; total: string }>();

    // Build a map of period → value
    const map = new Map<string, number>();
    for (const r of rows) {
      const ts = new Date(r.period);
      if (isNaN(ts.getTime())) continue;
      const key = ts.toISOString().slice(0, 10);
      map.set(key, parseFloat(r.total));
    }

    // Generate evenly-spaced bucket dates and fill gaps with 0
    const step = Math.max(1, Math.floor((endMs - startMs) / buckets));
    const result: { label: string; value: number }[] = [];

    for (let i = 0; i < buckets; i++) {
      const ts  = new Date(startMs + i * step);
      if (isNaN(ts.getTime())) continue;
      const key = ts.toISOString().slice(0, 10);
      // Find the closest map entry within the bucket window
      let value = 0;
      const nextKey = new Date(startMs + (i + 1) * step).toISOString().slice(0, 10);
      for (const [k, v] of map.entries()) {
        if (k >= key && k < nextKey) {
          value += v;
        }
      }
      result.push({ label: this.formatLabel(ts, granularity), value: parseFloat(value.toFixed(2)) });
    }

    return result;
  }

  private formatLabel(date: Date, granularity: string): string {
    const d = date;
    if (granularity === 'day')     return d.toLocaleDateString('en-US', { weekday: 'short' });
    if (granularity === 'week')    return `Wk ${Math.ceil(d.getDate() / 7)}`;
    if (granularity === 'month')   return d.toLocaleDateString('en-US', { month: 'short' });
    if (granularity === 'quarter') return `Q${Math.ceil((d.getMonth() + 1) / 3)} ${d.getFullYear()}`;
    return d.toISOString().slice(0, 10);
  }

  /** Resolve default date range: last 90 days if not provided */
  private resolveDateRange(startDate?: string, endDate?: string): { start: string; end: string } {
    const now = new Date();
    const defaultEnd = now.toISOString().slice(0, 10);
    const defaultStart = new Date(Date.now() - 90 * 86_400_000).toISOString().slice(0, 10);
    const end = endDate && !isNaN(new Date(endDate).getTime()) ? endDate : defaultEnd;
    const start = startDate && !isNaN(new Date(startDate).getTime()) ? startDate : defaultStart;
    return { start, end };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DASHBOARD METRICS  (KPI cards)
  // ─────────────────────────────────────────────────────────────────────────

  async getDashboardMetrics(tenantId: string, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    // Financial KPIs — sourced from ledger
    const [grossVolume, commission, chamaEscrow, greenSwapCredits, chamaLoanIncome,
           driverSubIncome, partnerSubIncome] = await Promise.all([
      this.sumCredits(GL.PLATFORM_REVENUE,       tenantId, start, end),
      this.sumCredits(GL.COMMISSION_INCOME,       tenantId, start, end),
      this.sumCredits(GL.CHAMA_ESCROW_LIABILITY,  tenantId, start, end),
      this.sumCredits(GL.GREEN_SWAP_CREDITS,      tenantId, start, end),
      this.sumCredits(GL.CHAMA_LOAN_INCOME,       tenantId, start, end),
      this.sumCredits(GL.DRIVER_SUBSCRIPTION,     tenantId, start, end),
      this.sumCredits(GL.PARTNER_SUBSCRIPTION,    tenantId, start, end),
    ]);

    // Customer counts — scoped by tenant
    const customerWhere: any = tenantId === ROOT_TENANT ? {} : { tenantId };
    const [driverCount, riderCount, partnerCount, activeUsers] = await Promise.all([
      this.customerRepo.count({ where: { ...customerWhere, customerType: 'driver' as any, deletedAt: IsNull() } }),
      this.customerRepo.count({ where: { ...customerWhere, customerType: 'rider' as any, deletedAt: IsNull() } }),
      this.customerRepo.count({ where: { ...customerWhere, customerType: 'partner' as any, deletedAt: IsNull() } }),
      this.userRepo.count({ where: tenantId === ROOT_TENANT ? { status: UserStatus.ACTIVE } : { tenantId, status: UserStatus.ACTIVE } }),
    ]);

    // Green swap credits expressed as QCoins (1 credit = 1 QC unit at $0.50)
    const greenSwapQC = Math.round(greenSwapCredits / 0.50);

    return {
      grossVolume:       parseFloat(grossVolume.toFixed(2)),
      commission:        parseFloat(commission.toFixed(2)),
      chamaEscrow:       parseFloat(chamaEscrow.toFixed(2)),
      greenSwapCredits:  greenSwapQC,
      chamaLoanIncome:   parseFloat(chamaLoanIncome.toFixed(2)),
      driverSubIncome:   parseFloat(driverSubIncome.toFixed(2)),
      partnerSubIncome:  parseFloat(partnerSubIncome.toFixed(2)),
      totalCustomers:    driverCount + riderCount + partnerCount,
      driverCount,
      riderCount,
      partnerCount,
      activeUsers,
      dateRange: { startDate: start, endDate: end },
      // Audit trail: which GL accounts were queried
      _sources: {
        grossVolume:      `GL ${GL.PLATFORM_REVENUE} Platform Revenue — CREDIT sum`,
        commission:       `GL ${GL.COMMISSION_INCOME} Commission Income — CREDIT sum`,
        chamaEscrow:      `GL ${GL.CHAMA_ESCROW_LIABILITY} Chama Escrow Liability — CREDIT sum`,
        greenSwapCredits: `GL ${GL.GREEN_SWAP_CREDITS} Green Swap Credits — CREDIT sum ÷ $0.50`,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // REVENUE CHART  (Platform Revenue 4100 — daily over selected range)
  // ─────────────────────────────────────────────────────────────────────────

  async getRevenueChart(tenantId: string, year = '2026', startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(
      startDate ?? `${year}-01-01`,
      endDate   ?? `${year}-12-31`,
    );

    const series = await this.timeSeries(GL.PLATFORM_REVENUE, tenantId, 'day', start, end, 7);

    return {
      labels: series.map(s => s.label),
      data:   series.map(s => s.value),
      year,
      dateRange: { startDate: start, endDate: end },
      glAccount: `${GL.PLATFORM_REVENUE} Platform Revenue`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // LOANS CHART  (Chama Loan Income 4300 — monthly)
  // ─────────────────────────────────────────────────────────────────────────

  async getLoansChart(tenantId: string, year = '2026', startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(
      startDate ?? `${year}-01-01`,
      endDate   ?? `${year}-12-31`,
    );

    const series = await this.timeSeries(GL.CHAMA_LOAN_INCOME, tenantId, 'month', start, end, 7);

    return {
      labels: series.map(s => s.label),
      data:   series.map(s => s.value),
      year,
      dateRange: { startDate: start, endDate: end },
      glAccount: `${GL.CHAMA_LOAN_INCOME} Chama Loan Income`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMERS CHART  (new customers by week — from customers table)
  // ─────────────────────────────────────────────────────────────────────────

  async getCustomersChart(tenantId: string, year = '2026', startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(
      startDate ?? `${year}-01-01`,
      endDate   ?? `${year}-12-31`,
    );

    const qb = this.customerRepo
      .createQueryBuilder('c')
      .select(`DATE_TRUNC('week', c."createdAt")`, 'period')
      .addSelect('COUNT(*)', 'total')
      .where('c.createdAt >= :start', { start: new Date(start) })
      .andWhere('c.createdAt <= :end',   { end:   new Date(end)   })
      .groupBy('period')
      .orderBy('period', 'ASC');

    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const rows = await qb.getRawMany<{ period: string; total: string }>();

    // Fill 7 weekly buckets
    const labels: string[] = [];
    const data:   number[] = [];
    for (let w = 0; w < 7; w++) {
      labels.push(`Wk ${w + 1}`);
      const row = rows[w];
      data.push(row ? parseInt(row.total, 10) : 0);
    }

    return {
      labels,
      data,
      year,
      dateRange: { startDate: start, endDate: end },
      source: 'customers table — COUNT by week',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DRIVERS CHART  (Driver Subscription income 4500 — by city/region)
  // ─────────────────────────────────────────────────────────────────────────

  async getDriversChart(tenantId: string, year = '2026', startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(
      startDate ?? `${year}-01-01`,
      endDate   ?? `${year}-12-31`,
    );

    // Count active drivers per city (from customers table)
    const qb = this.customerRepo
      .createQueryBuilder('c')
      .select('COALESCE(c.city, \'Unknown\')', 'city')
      .addSelect('COUNT(*)', 'total')
      .where('c.customerType = :type', { type: 'driver' })
      .andWhere('c.status = :status', { status: 'active' })
      .groupBy('c.city')
      .orderBy('total', 'DESC')
      .limit(7);

    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('c.tenantId = :tenantId', { tenantId });
    }

    const rows = await qb.getRawMany<{ city: string; total: string }>();

    const labels = rows.length ? rows.map(r => r.city) : ['Accra', 'Nairobi', 'London', 'Lagos', 'Kigali', 'Cape Town', 'Dakar'];
    const data   = rows.length ? rows.map(r => parseInt(r.total, 10)) : Array(7).fill(0);

    return {
      labels,
      data,
      year,
      dateRange: { startDate: start, endDate: end },
      source: 'customers table — driver COUNT by city',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PARTNERS CHART  (Partner Subscription income 4600 — quarterly)
  // ─────────────────────────────────────────────────────────────────────────

  async getPartnersChart(tenantId: string, year = '2026', startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(
      startDate ?? `${year}-01-01`,
      endDate   ?? `${year}-12-31`,
    );

    const series = await this.timeSeries(GL.PARTNER_SUBSCRIPTION, tenantId, 'quarter', start, end, 7);

    return {
      labels: series.map(s => s.label),
      data:   series.map(s => s.value),
      year,
      dateRange: { startDate: start, endDate: end },
      glAccount: `${GL.PARTNER_SUBSCRIPTION} Partner Subscription`,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RECENT TRANSACTIONS  (latest journal entries from the ledger)
  // ─────────────────────────────────────────────────────────────────────────

  async getRecentTransactions(tenantId: string, limit = 10, startDate?: string, endDate?: string) {
    const { start, end } = this.resolveDateRange(startDate, endDate);

    const qb = this.journalRepo
      .createQueryBuilder('je')
      .leftJoinAndSelect('je.entries', 'le')
      .leftJoinAndSelect('le.account', 'gl')
      .where('je.postingDate >= :start', { start: new Date(start) })
      .andWhere('je.postingDate <= :end',   { end:   new Date(end)   })
      .orderBy('je.postingDate', 'DESC')
      .addOrderBy('je.createdAt', 'DESC')
      .take(limit);

    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('je.tenantId = :tenantId', { tenantId });
    }

    const journals = await qb.getMany();

    return journals.map(je => {
      // Determine transaction type from reference prefix
      const ref = je.reference;
      let type: string;
      if (ref.startsWith('CHAMA-'))  type = 'chama';
      else if (ref.startsWith('SWAP-'))   type = 'swap';
      else if (ref.startsWith('CLOAN-'))  type = 'fuel';   // chama loan → fuel icon
      else if (ref.startsWith('DSUB-') || ref.startsWith('PSUB-')) type = 'vetting';
      else if (ref.includes('-COMM'))     type = 'system';
      else                                type = 'chama';

      // Credit entry amount = the income side
      const creditEntry = je.entries?.find(e => e.side === EntrySide.CREDIT);
      const amount = creditEntry ? `+$${parseFloat(String(creditEntry.amount)).toFixed(2)}` : `$${parseFloat(String(je.totalAmount)).toFixed(2)}`;

      return {
        id:        je.id,
        reference: je.reference,
        timestamp: je.postingDate,
        type,
        message:   je.description,
        amount,
        status:    'SUCCESS',
        tenantId:  je.tenantId,
        glAccount: creditEntry?.account?.name ?? '',
      };
    });
  }
}
