import { NestFactory } from '@nestjs/core';
import { LedgerServiceModule } from '../ledger-service.module';
import { GlAccountsService } from '../gl-accounts.service';
import { GlAccountType, GlAccount } from '../entities/gl-account.entity';

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE GL CHART OF ACCOUNTS — Full Ecosystem Seed
// ─────────────────────────────────────────────────────────────────────────────
// Covers: Banking, Wallet, Payments, Driver Earnings, Partner Subscriptions,
//         Leasing, Treasury, Escrow, Revenue, Expenses, Equity
// ─────────────────────────────────────────────────────────────────────────────

type AccountDef = {
  code: string;
  name: string;
  type: GlAccountType;
  parentCode?: string;
};

const ACCOUNTS: AccountDef[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // ASSETS — 1000 series
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '1000', name: 'ASSETS',                        type: GlAccountType.ASSET },

  // Cash & Bank
  { code: '1100', name: 'Cash and Bank',                 type: GlAccountType.ASSET, parentCode: '1000' },
  { code: '1101', name: 'Cash at Bank',                  type: GlAccountType.ASSET, parentCode: '1100' },
  { code: '1102', name: 'Treasury Wallet Balance',       type: GlAccountType.ASSET, parentCode: '1100' },
  { code: '1103', name: 'Petty Cash',                    type: GlAccountType.ASSET, parentCode: '1100' },

  // Provider Clearing
  { code: '1200', name: 'Provider Clearing Accounts',    type: GlAccountType.ASSET, parentCode: '1000' },
  { code: '1201', name: 'Paystack Clearing Account',     type: GlAccountType.ASSET, parentCode: '1200' },
  { code: '1202', name: 'Stripe Clearing Account',       type: GlAccountType.ASSET, parentCode: '1200' },
  { code: '1203', name: 'Bank Transfer Clearing',        type: GlAccountType.ASSET, parentCode: '1200' },
  { code: '1204', name: 'Card Payment Clearing',         type: GlAccountType.ASSET, parentCode: '1200' },
  { code: '1205', name: 'Remittance Clearing Account',   type: GlAccountType.ASSET, parentCode: '1200' },

  // Settlement Accounts
  { code: '1300', name: 'Settlement Accounts',           type: GlAccountType.ASSET, parentCode: '1000' },
  { code: '1301', name: 'Pending Settlement Receivable', type: GlAccountType.ASSET, parentCode: '1300' },
  { code: '1302', name: 'Provider Settlement Account',   type: GlAccountType.ASSET, parentCode: '1300' },
  { code: '1303', name: 'Internal Settlement Account',   type: GlAccountType.ASSET, parentCode: '1300' },
  { code: '1304', name: 'Partner Split Settlement',      type: GlAccountType.ASSET, parentCode: '1300' },
  { code: '1305', name: 'Driver Payout Settlement',      type: GlAccountType.ASSET, parentCode: '1300' },

  // Paystack Specific
  { code: '1206', name: 'Paystack Subaccount Clearing',   type: GlAccountType.ASSET, parentCode: '1200' },
  { code: '1207', name: 'Paystack Split Payment Clearing', type: GlAccountType.ASSET, parentCode: '1200' },

  // Receivables
  { code: '1400', name: 'Receivables',                   type: GlAccountType.ASSET, parentCode: '1000' },
  { code: '1401', name: 'Customer Receivables',          type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1402', name: 'Partner Receivables',           type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1403', name: 'Driver Receivables',            type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1404', name: 'Subscription Receivables',      type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1405', name: 'Lease Receivables',             type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1406', name: 'Loan Principal Receivable',     type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1407', name: 'Loan Interest Receivable',      type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1408', name: 'Overdue Lease Receivable',      type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1409', name: 'Driver Subscription Receivable',type: GlAccountType.ASSET, parentCode: '1400' },
  { code: '1410', name: 'Lease Deduction Receivable',    type: GlAccountType.ASSET, parentCode: '1400' },

  // Escrow
  { code: '1500', name: 'Escrow Balances',               type: GlAccountType.ASSET, parentCode: '1000' },
  { code: '1501', name: 'Trip Escrow',                   type: GlAccountType.ASSET, parentCode: '1500' },
  { code: '1502', name: 'Dispute Escrow',                type: GlAccountType.ASSET, parentCode: '1500' },
  { code: '1503', name: 'Lease Down Payment Escrow',     type: GlAccountType.ASSET, parentCode: '1500' },

  // ═══════════════════════════════════════════════════════════════════════════
  // LIABILITIES — 2000 series
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '2000', name: 'LIABILITIES',                   type: GlAccountType.LIABILITY },

  // Customer Wallet Liabilities
  { code: '2100', name: 'Customer Wallet Liabilities',   type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2101', name: 'Customer NGN Wallet',           type: GlAccountType.LIABILITY, parentCode: '2100' },
  { code: '2102', name: 'Customer QCoin Wallet',         type: GlAccountType.LIABILITY, parentCode: '2100' },
  { code: '2103', name: 'Customer Bonus Wallet',         type: GlAccountType.LIABILITY, parentCode: '2100' },

  // Partner Liabilities
  { code: '2200', name: 'Partner Liabilities',           type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2201', name: 'Partner Wallet Balance',        type: GlAccountType.LIABILITY, parentCode: '2200' },
  { code: '2202', name: 'Partner Commission Payable',    type: GlAccountType.LIABILITY, parentCode: '2200' },

  // Driver Payables
  { code: '2300', name: 'Driver Payables',               type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2301', name: 'Driver Wallet Balance',         type: GlAccountType.LIABILITY, parentCode: '2300' },
  { code: '2302', name: 'Driver Earnings Payable',       type: GlAccountType.LIABILITY, parentCode: '2300' },
  { code: '2303', name: 'Driver Bonus Payable',          type: GlAccountType.LIABILITY, parentCode: '2300' },
  { code: '2304', name: 'Driver Subscription Deduction', type: GlAccountType.LIABILITY, parentCode: '2300' },
  { code: '2305', name: 'Driver Lease Deduction Payable',type: GlAccountType.LIABILITY, parentCode: '2300' },

  // Settlement Liabilities
  { code: '2400', name: 'Settlement Liabilities',        type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2401', name: 'Pending Settlement',            type: GlAccountType.LIABILITY, parentCode: '2400' },
  { code: '2402', name: 'Unsettled Collections',         type: GlAccountType.LIABILITY, parentCode: '2400' },
  { code: '2403', name: 'Failed Settlement Reserve',     type: GlAccountType.LIABILITY, parentCode: '2400' },

  // Tax & Deferred
  { code: '2500', name: 'Tax and Deferred Liabilities',  type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2501', name: 'VAT Payable',                   type: GlAccountType.LIABILITY, parentCode: '2500' },
  { code: '2502', name: 'WHT Payable',                   type: GlAccountType.LIABILITY, parentCode: '2500' },
  { code: '2503', name: 'Deferred Revenue',              type: GlAccountType.LIABILITY, parentCode: '2500' },
  { code: '2504', name: 'Deferred Subscription Revenue', type: GlAccountType.LIABILITY, parentCode: '2500' },

  // Reversal Reserves
  { code: '2600', name: 'Reversal and Chargeback',       type: GlAccountType.LIABILITY, parentCode: '2000' },
  { code: '2601', name: 'Chargeback Reserve',            type: GlAccountType.LIABILITY, parentCode: '2600' },
  { code: '2602', name: 'Reversal Suspense Account',     type: GlAccountType.LIABILITY, parentCode: '2600' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EQUITY — 3000 series
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '3000', name: 'EQUITY',                        type: GlAccountType.EQUITY },
  { code: '3001', name: 'Retained Earnings',             type: GlAccountType.EQUITY, parentCode: '3000' },
  { code: '3002', name: 'Share Capital',                 type: GlAccountType.EQUITY, parentCode: '3000' },
  { code: '3003', name: 'Platform Reserve Fund',         type: GlAccountType.EQUITY, parentCode: '3000' },

  // ═══════════════════════════════════════════════════════════════════════════
  // REVENUE / INCOME — 4000 series
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '4000', name: 'REVENUE',                       type: GlAccountType.INCOME },

  // Transaction Fees
  { code: '4100', name: 'Transaction Fee Revenue',       type: GlAccountType.INCOME, parentCode: '4000' },
  { code: '4101', name: 'Convenience Fees',              type: GlAccountType.INCOME, parentCode: '4100' },
  { code: '4102', name: 'Processing Fees',               type: GlAccountType.INCOME, parentCode: '4100' },
  { code: '4103', name: 'Withdrawal Fees',               type: GlAccountType.INCOME, parentCode: '4100' },
  { code: '4104', name: 'Transfer Fees',                 type: GlAccountType.INCOME, parentCode: '4100' },

  // Commission Revenue
  { code: '4200', name: 'Commission Revenue',            type: GlAccountType.INCOME, parentCode: '4000' },
  { code: '4201', name: 'Trip Commission Revenue',       type: GlAccountType.INCOME, parentCode: '4200' },
  { code: '4202', name: 'Partner Commission Revenue',    type: GlAccountType.INCOME, parentCode: '4200' },
  { code: '4203', name: 'Platform Commission Revenue',   type: GlAccountType.INCOME, parentCode: '4200' },

  // Subscription Revenue
  { code: '4300', name: 'Subscription Revenue',          type: GlAccountType.INCOME, parentCode: '4000' },
  { code: '4301', name: 'Partner Subscription Revenue',  type: GlAccountType.INCOME, parentCode: '4300' },
  { code: '4302', name: 'Driver Subscription Revenue',   type: GlAccountType.INCOME, parentCode: '4300' },

  // Lease & Interest Revenue
  { code: '4400', name: 'Lease and Interest Revenue',    type: GlAccountType.INCOME, parentCode: '4000' },
  { code: '4401', name: 'Lease Interest Revenue',        type: GlAccountType.INCOME, parentCode: '4400' },
  { code: '4402', name: 'Loan Interest Revenue',         type: GlAccountType.INCOME, parentCode: '4400' },
  { code: '4403', name: 'Penalty & Default Fees',        type: GlAccountType.INCOME, parentCode: '4400' },

  // Platform Revenue
  { code: '4500', name: 'Platform Revenue',              type: GlAccountType.INCOME, parentCode: '4000' },
  { code: '4501', name: 'QCoin Exchange Revenue',        type: GlAccountType.INCOME, parentCode: '4500' },
  { code: '4502', name: 'API Revenue',                   type: GlAccountType.INCOME, parentCode: '4500' },
  { code: '4503', name: 'Remittance Fee Revenue',        type: GlAccountType.INCOME, parentCode: '4500' },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXPENSES — 5000 series
  // ═══════════════════════════════════════════════════════════════════════════
  { code: '5000', name: 'EXPENSES',                      type: GlAccountType.EXPENSE },

  // Gateway & Provider Charges
  { code: '5100', name: 'Payment Provider Charges',      type: GlAccountType.EXPENSE, parentCode: '5000' },
  { code: '5101', name: 'Paystack Gateway Charges',      type: GlAccountType.EXPENSE, parentCode: '5100' },
  { code: '5102', name: 'Stripe Gateway Charges',        type: GlAccountType.EXPENSE, parentCode: '5100' },
  { code: '5103', name: 'Bank Transfer Charges',         type: GlAccountType.EXPENSE, parentCode: '5100' },

  // Operational
  { code: '5200', name: 'Operational Expenses',          type: GlAccountType.EXPENSE, parentCode: '5000' },
  { code: '5201', name: 'Driver Bonus Expense',          type: GlAccountType.EXPENSE, parentCode: '5200' },
  { code: '5202', name: 'Customer Cashback Expense',     type: GlAccountType.EXPENSE, parentCode: '5200' },
  { code: '5203', name: 'Referral Bonus Expense',        type: GlAccountType.EXPENSE, parentCode: '5200' },
  { code: '5204', name: 'Driver Payout Expense',         type: GlAccountType.EXPENSE, parentCode: '5200' },

  // Losses
  { code: '5300', name: 'Settlement and Reversal Losses', type: GlAccountType.EXPENSE, parentCode: '5000' },
  { code: '5301', name: 'Settlement Losses',             type: GlAccountType.EXPENSE, parentCode: '5300' },
  { code: '5302', name: 'Reversal Losses',               type: GlAccountType.EXPENSE, parentCode: '5300' },
  { code: '5303', name: 'Write-Off Expense',             type: GlAccountType.EXPENSE, parentCode: '5300' },
  { code: '5304', name: 'Bad Debt Expense',              type: GlAccountType.EXPENSE, parentCode: '5300' },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(LedgerServiceModule);
  const service = app.get(GlAccountsService);

  const tenantId = process.env.SEED_TENANT_ID || 'tenant-1';
  console.log(`\n🌱 Seeding GL Accounts for tenant: ${tenantId}\n`);

  const createdAccounts: Record<string, GlAccount> = {};
  let created = 0;
  let skipped = 0;

  for (const acc of ACCOUNTS) {
    try {
      const existing = await service.getGlAccounts(tenantId).then(
        (res) => res.data.find((a: { code: string }) => a.code === acc.code) ?? null
      );

      if (existing) {
        createdAccounts[acc.code] = existing;
        skipped++;
        console.log(`  ⏭  SKIP  ${acc.code} — ${acc.name}`);
        continue;
      }

      const parentId = acc.parentCode
        ? createdAccounts[acc.parentCode]?.id
        : undefined;

      const result = await service.createGlAccount({
        code: acc.code,
        name: acc.name,
        type: acc.type,
        tenantId,
        parentId,
      });

      createdAccounts[acc.code] = result;
      created++;
      console.log(`  ✅ CREATE ${acc.code} — ${acc.name}`);
    } catch (err: any) {
      console.error(`  ❌ ERROR  ${acc.code} — ${acc.name}: ${err?.message ?? err}`);
    }
  }

  console.log(`\n📊 Summary: ${created} created, ${skipped} skipped out of ${ACCOUNTS.length} accounts.\n`);

  await app.close();
}

void bootstrap();
