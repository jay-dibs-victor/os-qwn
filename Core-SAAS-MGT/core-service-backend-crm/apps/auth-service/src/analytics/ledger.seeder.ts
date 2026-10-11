import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  GlAccount,
  GlAccountType,
  GlAccountStatus,
} from '../../../ledger-service/src/entities/gl-account.entity';
import { JournalEntry } from '../../../ledger-service/src/entities/journal-entry.entity';
import {
  LedgerEntry,
  EntrySide,
} from '../../../ledger-service/src/entities/ledger-entry.entity';
import { Customer } from '../entities/customer.entity';

// ─────────────────────────────────────────────────────────────────────────────
// CHART OF ACCOUNTS
// Every income GL (4xxx) has a matching asset debit (1xxx).
// Every liability GL (2xxx) has a matching asset debit (1xxx).
// Every expense GL (5xxx) has a matching liability credit (2xxx).
//
// Code   Name                        Type        Normal balance
// ─────────────────────────────────────────────────────────────
// ASSETS (debit-normal)
// 1000   Assets                      ASSET       DR
// 1100   Platform Cash Pool          ASSET       DR  ← cash received
// 1200   Rider Receivables           ASSET       DR  ← fare owed by rider
// 1300   Chama Escrow Receivable     ASSET       DR  ← escrow held
//
// LIABILITIES (credit-normal)
// 2000   Liabilities                 LIABILITY   CR
// 2100   Driver Payable              LIABILITY   CR  ← net owed to driver
// 2200   Partner Payable             LIABILITY   CR  ← owed to partner
// 2300   Chama Escrow Liability      LIABILITY   CR  ← escrow obligation
//
// INCOME (credit-normal)
// 4000   Income                      INCOME      CR
// 4100   Platform Revenue            INCOME      CR  ← gross fare income
// 4200   Commission Income           INCOME      CR  ← 10% commission
// 4300   Chama Loan Income           INCOME      CR  ← 2% origination fee
// 4400   Green Swap Credits          INCOME      CR  ← carbon credit income
// 4500   Driver Subscription         INCOME      CR  ← $29/month driver sub
// 4600   Partner Subscription        INCOME      CR  ← $149/month partner sub
//
// EXPENSES (debit-normal)
// 5000   Expenses                    EXPENSE     DR
// 5100   Driver Payout Expense       EXPENSE     DR  ← net payout cost
// 5200   Solar Swap Expense          EXPENSE     DR  ← swap hardware cost
// ─────────────────────────────────────────────────────────────────────────────

interface GlDef {
  code: string;
  name: string;
  type: GlAccountType;
  parentCode?: string;
}

const CHART_OF_ACCOUNTS: GlDef[] = [
  // ASSETS
  { code: '1000', name: 'Assets',                 type: GlAccountType.ASSET },
  { code: '1100', name: 'Platform Cash Pool',      type: GlAccountType.ASSET,     parentCode: '1000' },
  { code: '1200', name: 'Rider Receivables',       type: GlAccountType.ASSET,     parentCode: '1000' },
  { code: '1300', name: 'Chama Escrow Receivable', type: GlAccountType.ASSET,     parentCode: '1000' },
  // LIABILITIES
  { code: '2000', name: 'Liabilities',             type: GlAccountType.LIABILITY },
  { code: '2100', name: 'Driver Payable',          type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2200', name: 'Partner Payable',         type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2300', name: 'Chama Escrow Liability',  type: GlAccountType.LIABILITY, parentCode: '2000' },
  // INCOME
  { code: '4000', name: 'Income',                  type: GlAccountType.INCOME },
  { code: '4100', name: 'Platform Revenue',        type: GlAccountType.INCOME,    parentCode: '4000' },
  { code: '4200', name: 'Commission Income',       type: GlAccountType.INCOME,    parentCode: '4000' },
  { code: '4300', name: 'Chama Loan Income',       type: GlAccountType.INCOME,    parentCode: '4000' },
  { code: '4400', name: 'Green Swap Credits',      type: GlAccountType.INCOME,    parentCode: '4000' },
  { code: '4500', name: 'Driver Subscription',     type: GlAccountType.INCOME,    parentCode: '4000' },
  { code: '4600', name: 'Partner Subscription',    type: GlAccountType.INCOME,    parentCode: '4000' },
  // EXPENSES
  { code: '5000', name: 'Expenses',                type: GlAccountType.EXPENSE },
  { code: '5100', name: 'Driver Payout Expense',   type: GlAccountType.EXPENSE,   parentCode: '5000' },
  { code: '5200', name: 'Solar Swap Expense',      type: GlAccountType.EXPENSE,   parentCode: '5000' },
];

// ─── Entry-code prefixes (used in reference field for audit trail) ────────────
// FARE-   Trip fare collection
// COMM-   Commission split
// DSUB-   Driver subscription
// PSUB-   Partner subscription
// CHMD-   Chama deposit (member contribution into escrow)
// CHMP-   Chama payout (rotation disbursement out of escrow)
// CLOAN-  Chama micro-loan origination fee
// SWAP-   Solar battery swap credit
// ─────────────────────────────────────────────────────────────────────────────

type EntryLine = {
  account: GlAccount;
  side: EntrySide;
  amount: number;
  entryCode: string;          // audit code for this specific line
  subLedgerId?: string;
  subLedgerType?: string;
};

@Injectable()
export class LedgerSeeder {
  private readonly logger = new Logger(LedgerSeeder.name);

  constructor(
    @InjectRepository(GlAccount)
    private readonly glRepo: Repository<GlAccount>,
    @InjectRepository(JournalEntry)
    private readonly journalRepo: Repository<JournalEntry>,
    @InjectRepository(LedgerEntry)
    private readonly entryRepo: Repository<LedgerEntry>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────

  async seed(): Promise<void> {
    this.logger.log('📒 Starting ledger seeding...');

    // Always truncate and reseed on every launch for a clean consistent state.
    // The database.seeder.ts already truncated customers/users tables, so
    // we truncate the ledger tables here in FK-safe order.
    this.logger.log('→ Truncating ledger tables for fresh reseed...');
    await this.entryRepo.query('TRUNCATE TABLE ledger_entries CASCADE');
    await this.journalRepo.query('TRUNCATE TABLE journal_entries CASCADE');
    await this.glRepo.query('TRUNCATE TABLE gl_accounts CASCADE');
    this.logger.log('→ Ledger tables cleared. Starting fresh ledger seed...');

    const tenants = ['root-admin', 'tenant-001', 'tenant-002', 'acme-corp'];

    // Seed GL accounts once — unique constraint is on code only (not per-tenant)
    // Pass root-admin as the owning tenantId for the shared GL rows
    const gl = await this.seedChartOfAccounts('root-admin');

    // Seed fixed-UUID GL accounts needed by wallet-service and other services
    // (migrated from scripts/seed-ledger-gl.sh)
    await this.seedFixedUuidAccounts();

    // Seed transactions per tenant, reusing the same GL account rows
    for (const tenantId of tenants) {
      await this.seedTransactions(tenantId, gl);
      this.logger.log(`  ✅ Ledger transactions complete for ${tenantId}`);
    }

    this.logger.log('✅ Ledger seeding completed successfully!');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1 — Chart of Accounts (idempotent upsert)
  // ─────────────────────────────────────────────────────────────────────────

  private async seedChartOfAccounts(
    tenantId: string,
  ): Promise<Record<string, GlAccount>> {
    const map: Record<string, GlAccount> = {};

    for (const def of CHART_OF_ACCOUNTS) {
      const parentId = def.parentCode && map[def.parentCode]
        ? map[def.parentCode].id
        : null;

      await this.glRepo.query(
        `INSERT INTO gl_accounts
           (code, name, type, status, "tenantId", balance, currency, mpath, "parentId")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (code) DO NOTHING`,
        [
          def.code,
          def.name,
          def.type,
          GlAccountStatus.ACTIVE,
          tenantId,
          0,
          'USD',
          def.code + '.', // materialized path seed
          parentId,
        ],
      );

      const acct = await this.glRepo.findOne({ where: { code: def.code } });
      if (!acct) {
        throw new Error(`GL account ${def.code} not found after upsert`);
      }
      this.logger.log(`    ✓ GL ${def.code} — ${def.name}`);
      map[def.code] = acct;
    }

    return map;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1b — Seed fixed-UUID GL accounts (from seed-ledger-gl.sh)
  // ─────────────────────────────────────────────────────────────────────────
  // These accounts have known UUIDs required by wallet-service env vars:
  //   CASH_GL_ACCOUNT_ID    → 11111111-1111-1111-1111-111111111111
  //   QCOIN_DEPOSITS_GL_ACCOUNT_ID → 22222222-2222-2222-2222-222222222222
  //   ESCROW_GL_ACCOUNT_ID → 33333333-3333-3333-3333-333333333333

  private async seedFixedUuidAccounts(): Promise<void> {
    this.logger.log('→ Seeding fixed-UUID GL accounts...');
    await this.glRepo.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '11111111-1111-1111-1111-111111111111',
        'CASH-1100',
        'Platform Cash Pool',
        GlAccountType.ASSET,
        GlAccountStatus.ACTIVE,
        'root-admin',
        0.00,
        'USD',
      ],
    );
    await this.glRepo.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '22222222-2222-2222-2222-222222222222',
        'QCOIN-2100',
        'QCoin Deposits',
        GlAccountType.LIABILITY,
        GlAccountStatus.ACTIVE,
        'root-admin',
        0.00,
        'QCN',
      ],
    );
    await this.glRepo.query(
      `INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
       VALUES ($1, NOW(), NOW(), $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        '33333333-3333-3333-3333-333333333333',
        'ESCROW-1300',
        'Chama Escrow',
        GlAccountType.ASSET,
        GlAccountStatus.ACTIVE,
        'root-admin',
        0.00,
        'USD',
      ],
    );
    this.logger.log('    ✓ Fixed-UUID GL accounts seeded');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2 — Seed all transaction types
  // ─────────────────────────────────────────────────────────────────────────

  private async seedTransactions(
    tenantId: string,
    gl: Record<string, GlAccount>,
  ): Promise<void> {
    const drivers  = await this.customerRepo.find({ where: { tenantId, customerType: 'driver'  as any } });
    const riders   = await this.customerRepo.find({ where: { tenantId, customerType: 'rider'   as any } });
    const partners = await this.customerRepo.find({ where: { tenantId, customerType: 'partner' as any } });

    const now = Date.now();
    const DAY = 86_400_000;

    // ── 1. TRIP FARES + COMMISSION ─────────────────────────────────────────
    //
    // Each trip produces TWO balanced journal entries:
    //
    // Journal A  FARE-{ref}  "Trip fare collected from rider"
    //   DR 1200 Rider Receivables          fareAmount   [FARE-DR-1200]
    //   CR 4100 Platform Revenue           fareAmount   [FARE-CR-4100]
    //
    // Journal B  COMM-{ref}  "Commission split & driver payout accrual"
    //   DR 4100 Platform Revenue           commission   [COMM-DR-4100]  ← revenue reduced by commission cost
    //   CR 4200 Commission Income          commission   [COMM-CR-4200]  ← net commission earned
    //   DR 5100 Driver Payout Expense      driverPayout [COMM-DR-5100]  ← cost of driver payout
    //   CR 2100 Driver Payable             driverPayout [COMM-CR-2100]  ← liability to driver
    //
    // Proof: Journal A: DR 1200 = CR 4100 ✓
    //        Journal B: DR 4100 + DR 5100 = CR 4200 + CR 2100 ✓
    //        Net income = 4100 credits - 4100 debits = commission only ✓

    const COMMISSION_RATE = 0.10;
    let tripSeq = 1;

    for (const driver of drivers) {
      const tripCount = 18 + Math.floor(Math.random() * 10);
      for (let t = 0; t < tripCount; t++) {
        const daysAgo     = Math.floor(Math.random() * 90);
        const postingDate = new Date(now - daysAgo * DAY);
        const fare        = round2(15 + Math.random() * 85);
        const commission  = round2(fare * COMMISSION_RATE);
        const payout      = round2(fare - commission);
        const rider       = riders[Math.floor(Math.random() * Math.max(riders.length, 1))];
        const seq         = String(tripSeq++).padStart(6, '0');
        const tripRef     = `TRIP-${slug(tenantId)}-${seq}`;

        // Journal A — fare collection
        await this.post({
          tenantId,
          reference: `FARE-${tripRef}`,
          description: `Trip fare: ${driver.firstName} ${driver.lastName} → ${rider?.firstName ?? 'Rider'} ${rider?.lastName ?? ''}`,
          postingDate,
          lines: [
            {
              account: gl['1200'], side: EntrySide.DEBIT,  amount: fare,
              entryCode: 'FARE-DR-1200',
              subLedgerId: rider?.id, subLedgerType: 'RIDER',
            },
            {
              account: gl['4100'], side: EntrySide.CREDIT, amount: fare,
              entryCode: 'FARE-CR-4100',
            },
          ],
        });

        // Journal B — commission split
        await this.post({
          tenantId,
          reference: `COMM-${tripRef}`,
          description: `Commission 10% + driver payout accrual: ${tripRef}`,
          postingDate,
          lines: [
            {
              account: gl['4100'], side: EntrySide.DEBIT,  amount: commission,
              entryCode: 'COMM-DR-4100',
            },
            {
              account: gl['4200'], side: EntrySide.CREDIT, amount: commission,
              entryCode: 'COMM-CR-4200',
            },
            {
              account: gl['5100'], side: EntrySide.DEBIT,  amount: payout,
              entryCode: 'COMM-DR-5100',
              subLedgerId: driver.id, subLedgerType: 'DRIVER',
            },
            {
              account: gl['2100'], side: EntrySide.CREDIT, amount: payout,
              entryCode: 'COMM-CR-2100',
              subLedgerId: driver.id, subLedgerType: 'DRIVER',
            },
          ],
        });
      }
    }
    this.logger.log(`    ✓ Trip journals done [${tenantId}]`);

    // ── 2. DRIVER SUBSCRIPTIONS ($29/month) ───────────────────────────────
    //
    // Journal  DSUB-{ref}  "Driver monthly subscription payment"
    //   DR 1100 Platform Cash Pool     29.00  [DSUB-DR-1100]
    //   CR 4500 Driver Subscription    29.00  [DSUB-CR-4500]
    //
    // Proof: DR 1100 = CR 4500 ✓

    const DRIVER_SUB = 29.00;
    let dsubSeq = 1;

    for (const driver of drivers) {
      for (let m = 0; m < 3; m++) {
        const postingDate = new Date(now - (m * 30 + Math.floor(Math.random() * 5)) * DAY);
        await this.post({
          tenantId,
          reference: `DSUB-${slug(tenantId)}-${String(dsubSeq++).padStart(5, '0')}`,
          description: `Driver monthly subscription: ${driver.firstName} ${driver.lastName}`,
          postingDate,
          lines: [
            {
              account: gl['1100'], side: EntrySide.DEBIT,  amount: DRIVER_SUB,
              entryCode: 'DSUB-DR-1100',
              subLedgerId: driver.id, subLedgerType: 'DRIVER',
            },
            {
              account: gl['4500'], side: EntrySide.CREDIT, amount: DRIVER_SUB,
              entryCode: 'DSUB-CR-4500',
            },
          ],
        });
      }
    }
    this.logger.log(`    ✓ Driver subscription journals done [${tenantId}]`);

    // ── 3. PARTNER SUBSCRIPTIONS ($149/month) ─────────────────────────────
    //
    // Journal  PSUB-{ref}  "Partner monthly subscription payment"
    //   DR 1100 Platform Cash Pool      149.00  [PSUB-DR-1100]
    //   CR 4600 Partner Subscription    149.00  [PSUB-CR-4600]
    //
    // Proof: DR 1100 = CR 4600 ✓

    const PARTNER_SUB = 149.00;
    let psubSeq = 1;

    for (const partner of partners) {
      for (let m = 0; m < 3; m++) {
        const postingDate = new Date(now - (m * 30 + Math.floor(Math.random() * 5)) * DAY);
        await this.post({
          tenantId,
          reference: `PSUB-${slug(tenantId)}-${String(psubSeq++).padStart(5, '0')}`,
          description: `Partner monthly subscription: ${partner.companyName ?? partner.firstName} ${partner.lastName}`,
          postingDate,
          lines: [
            {
              account: gl['1100'], side: EntrySide.DEBIT,  amount: PARTNER_SUB,
              entryCode: 'PSUB-DR-1100',
              subLedgerId: partner.id, subLedgerType: 'PARTNER',
            },
            {
              account: gl['4600'], side: EntrySide.CREDIT, amount: PARTNER_SUB,
              entryCode: 'PSUB-CR-4600',
            },
          ],
        });
      }
    }
    this.logger.log(`    ✓ Partner subscription journals done [${tenantId}]`);

    // ── 4. CHAMA ESCROW — DEPOSIT + PAYOUT ────────────────────────────────
    //
    // Groups of 5 drivers each contribute $250 → $1,250 pool per rotation.
    //
    // Journal A  CHMD-{ref}  "Chama member deposit into escrow"
    //   DR 1300 Chama Escrow Receivable   1250.00  [CHMD-DR-1300]
    //   CR 2300 Chama Escrow Liability    1250.00  [CHMD-CR-2300]
    //
    // Journal B  CHMP-{ref}  "Chama rotation payout to winning member"
    //   DR 2300 Chama Escrow Liability    1250.00  [CHMP-DR-2300]
    //   CR 1300 Chama Escrow Receivable   1250.00  [CHMP-CR-1300]
    //
    // Proof: Each pair nets to zero on both accounts ✓
    // Outstanding balance on 2300 = deposits not yet paid out = "Active Chama Escrows" KPI

    const GROUP_SIZE = 5;
    const CHAMA_POOL = GROUP_SIZE * 250.00; // $1,250
    const groups = Math.floor(drivers.length / GROUP_SIZE);
    let chamaSeq = 1;

    for (let g = 0; g < groups; g++) {
      for (let w = 0; w < 4; w++) {
        const depositDate = new Date(now - (w * 7 + g * 2 + 1) * DAY);
        const payoutDate  = new Date(now - (w * 7 + g * 2)     * DAY);
        const ref = `CHAMA-${slug(tenantId)}-G${g + 1}-W${w + 1}-${String(chamaSeq++).padStart(4, '0')}`;

        // Deposit
        await this.post({
          tenantId,
          reference: `CHMD-${ref}`,
          description: `Chama Group ${g + 1} member deposits — rotation ${w + 1}`,
          postingDate: depositDate,
          lines: [
            {
              account: gl['1300'], side: EntrySide.DEBIT,  amount: CHAMA_POOL,
              entryCode: 'CHMD-DR-1300',
            },
            {
              account: gl['2300'], side: EntrySide.CREDIT, amount: CHAMA_POOL,
              entryCode: 'CHMD-CR-2300',
            },
          ],
        });

        // Payout (only for completed rotations — leave last rotation open as outstanding escrow)
        if (w < 3) {
          await this.post({
            tenantId,
            reference: `CHMP-${ref}`,
            description: `Chama Group ${g + 1} rotation payout — winner disbursed`,
            postingDate: payoutDate,
            lines: [
              {
                account: gl['2300'], side: EntrySide.DEBIT,  amount: CHAMA_POOL,
                entryCode: 'CHMP-DR-2300',
              },
              {
                account: gl['1300'], side: EntrySide.CREDIT, amount: CHAMA_POOL,
                entryCode: 'CHMP-CR-1300',
              },
            ],
          });
        }
        // w === 3 left open → outstanding liability = "Active Chama Escrows" KPI
      }
    }
    this.logger.log(`    ✓ Chama escrow journals done [${tenantId}]`);

    // ── 5. CHAMA MICRO-LOAN ORIGINATION FEE (2%) ──────────────────────────
    //
    // Journal  CLOAN-{ref}  "Chama micro-loan origination fee"
    //   DR 1100 Platform Cash Pool    fee  [CLOAN-DR-1100]
    //   CR 4300 Chama Loan Income     fee  [CLOAN-CR-4300]
    //
    // Proof: DR 1100 = CR 4300 ✓

    let loanSeq = 1;
    for (const driver of drivers.slice(0, Math.ceil(drivers.length * 0.6))) {
      const loanAmt     = round2(500 + Math.random() * 1500);
      const fee         = round2(loanAmt * 0.02);
      const postingDate = new Date(now - Math.floor(Math.random() * 60) * DAY);

      await this.post({
        tenantId,
        reference: `CLOAN-${slug(tenantId)}-${String(loanSeq++).padStart(5, '0')}`,
        description: `Chama micro-loan origination fee: ${driver.firstName} ${driver.lastName} (principal $${loanAmt})`,
        postingDate,
        lines: [
          {
            account: gl['1100'], side: EntrySide.DEBIT,  amount: fee,
            entryCode: 'CLOAN-DR-1100',
            subLedgerId: driver.id, subLedgerType: 'DRIVER',
          },
          {
            account: gl['4300'], side: EntrySide.CREDIT, amount: fee,
            entryCode: 'CLOAN-CR-4300',
          },
        ],
      });
    }
    this.logger.log(`    ✓ Chama loan income journals done [${tenantId}]`);

    // ── 6. SOLAR BATTERY SWAP CREDITS ─────────────────────────────────────
    //
    // Each swap earns a carbon credit worth $0.50.
    // The swap also incurs a hardware cost of $0.30 (net platform gain $0.20).
    //
    // Journal  SWAP-{ref}  "Solar battery swap — credit income + hardware cost"
    //   DR 1100 Platform Cash Pool    0.50  [SWAP-DR-1100]  ← credit income received
    //   CR 4400 Green Swap Credits    0.50  [SWAP-CR-4400]  ← carbon credit income
    //   DR 5200 Solar Swap Expense    0.30  [SWAP-DR-5200]  ← hardware cost
    //   CR 1100 Platform Cash Pool    0.30  [SWAP-CR-1100]  ← cash paid for hardware
    //
    // Proof: DR 1100 + DR 5200 = CR 4400 + CR 1100
    //        0.50 + 0.30 = 0.50 + 0.30 ✓
    // Net cash impact: +0.50 - 0.30 = +0.20 per swap ✓

    const CREDIT_INCOME = 0.50;
    const SWAP_COST     = 0.30;
    let swapSeq = 1;

    for (const driver of drivers) {
      const swaps = 6 + Math.floor(Math.random() * 6);
      for (let s = 0; s < swaps; s++) {
        const postingDate = new Date(now - Math.floor(Math.random() * 90) * DAY);
        await this.post({
          tenantId,
          reference: `SWAP-${slug(tenantId)}-${String(swapSeq++).padStart(6, '0')}`,
          description: `Solar battery swap: ${driver.firstName} ${driver.lastName} — credit $${CREDIT_INCOME}, cost $${SWAP_COST}`,
          postingDate,
          lines: [
            {
              account: gl['1100'], side: EntrySide.DEBIT,  amount: CREDIT_INCOME,
              entryCode: 'SWAP-DR-1100',
              subLedgerId: driver.id, subLedgerType: 'DRIVER',
            },
            {
              account: gl['4400'], side: EntrySide.CREDIT, amount: CREDIT_INCOME,
              entryCode: 'SWAP-CR-4400',
            },
            {
              account: gl['5200'], side: EntrySide.DEBIT,  amount: SWAP_COST,
              entryCode: 'SWAP-DR-5200',
            },
            {
              account: gl['1100'], side: EntrySide.CREDIT, amount: SWAP_COST,
              entryCode: 'SWAP-CR-1100',
            },
          ],
        });
      }
    }
    this.logger.log(`    ✓ Solar swap journals done [${tenantId}]`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER — write one balanced journal entry directly to the shared DB
  // ─────────────────────────────────────────────────────────────────────────

  private async post(params: {
    tenantId: string;
    reference: string;
    description: string;
    postingDate: Date;
    lines: EntryLine[];
  }): Promise<void> {
    const dr = params.lines
      .filter(l => l.side === EntrySide.DEBIT)
      .reduce((s, l) => s + l.amount, 0);
    const cr = params.lines
      .filter(l => l.side === EntrySide.CREDIT)
      .reduce((s, l) => s + l.amount, 0);

    if (Math.abs(dr - cr) > 0.005) {
      this.logger.warn(
        `⚠  Unbalanced — skipped ${params.reference}  DR ${dr.toFixed(2)} ≠ CR ${cr.toFixed(2)}`,
      );
      return;
    }

    const journal = await this.journalRepo.save(
      this.journalRepo.create({
        reference:   params.reference,
        description: params.description,
        postingDate: params.postingDate,
        currency:    'USD',
        totalAmount: dr,
        tenantId:    params.tenantId,
      }),
    );

    // Build ledger entry rows — store entryCode in subLedgerType when no
    // explicit subLedgerType is provided, so every line is traceable.
    const rows = params.lines.map(l =>
      this.entryRepo.create({
        amount:        l.amount,
        side:          l.side,
        account:       l.account,
        // subLedgerId carries the customer UUID when present
        subLedgerId:   l.subLedgerId ?? l.entryCode,
        // subLedgerType carries the entry code for full audit trail
        subLedgerType: l.subLedgerType
          ? `${l.subLedgerType}|${l.entryCode}`
          : l.entryCode,
        tenantId:      params.tenantId,
        journalEntry:  journal,
      }),
    );

    await this.entryRepo.save(rows);

    // Update running GL balances
    for (const l of params.lines) {
      const delta = l.side === EntrySide.DEBIT ? l.amount : -l.amount;
      l.account.balance = round2(parseFloat(String(l.account.balance)) + delta);
      await this.glRepo.save(l.account);
    }
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Short uppercase slug from tenantId for reference codes */
function slug(tenantId: string): string {
  return tenantId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
}
