#!/usr/bin/env node

const BASE = process.env.GATEWAY_URL || 'http://localhost:3000';
const TENANT_ID = 'tenant-001';
const TS = Date.now();

let passed = 0, failed = 0;

function ok(msg)  { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); passed++; }
function nok(msg) { console.log(`  \x1b[31m✕\x1b[0m ${msg}`); failed++; }

async function step(name, fn) {
  process.stdout.write(`\n── ${name}\n`);
  try {
    await fn();
    ok(name);
  } catch (e) {
    const detail = e.response ? `${e.response.status} ${JSON.stringify(e.response.data)}` : e.message;
    nok(`${name}\n    ${detail}`);
  }
}

async function api(method, path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = {
    'content-type': 'application/json',
    'x-tenant-id': TENANT_ID,
    ...opts.headers
  };
  const body = opts.body ? JSON.stringify(opts.body) : undefined;
  const res = await fetch(url, { method, headers, body });
  const data = res.headers.get('content-type')?.includes('json')
    ? await res.json() : await res.text();
  return { status: res.status, data };
}

// ─── Helper: GL Account IDs ────────────────────────────────────

const glCodes = {};

async function ensureGlAccounts() {
  const required = [
    { code: '1101', name: 'Cash at Bank', type: 'ASSET' },
    { code: '1201', name: 'Paystack Clearing Account', type: 'ASSET' },
    { code: '2101', name: 'Customer NGN Wallet', type: 'LIABILITY' },
    { code: '2202', name: 'Partner Commission Payable', type: 'LIABILITY' },
    { code: '2301', name: 'Driver Wallet Balance', type: 'LIABILITY' },
    { code: '2302', name: 'Driver Earnings Payable', type: 'LIABILITY' },
    { code: '2402', name: 'Unsettled Collections', type: 'LIABILITY' },
    { code: '4201', name: 'Trip Commission Revenue', type: 'INCOME' },
    { code: '4202', name: 'Partner Commission Revenue', type: 'INCOME' },
  ];
  for (const acc of required) {
    let r = await api('POST', '/ledger/accounts', {
      body: acc, headers: { 'x-tenant-id': TENANT_ID },
    });
    if (r.status === 201) {
      glCodes[acc.code] = r.data.id;
    } else {
      r = await api('GET', `/ledger/accounts?tenantId=${TENANT_ID}`);
      const found = r.data.find(a => a.code === acc.code);
      if (found) glCodes[acc.code] = found.id;
    }
  }
}

async function createAccount(customerId) {
  const r = await api('POST', '/accounts', {
    body: { name: `Wallet ${customerId}`, type: 'SAVINGS', currency: 'NGN', customerId, tenantId: TENANT_ID, glAccountId: glCodes['2101'] },
  });
  return r.data;
}

// ────────────────────────────────────────────────────────────────
//  1. Trip Commission Calculation
// ────────────────────────────────────────────────────────────────

await step('Calculate individual driver commissions', async () => {
  const r = await api('GET', '/payments/trip/calculate-commission?totalFare=10000&platformRate=0.10&partnerRate=0.05&isCorporate=false');
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.totalFare) !== 10000) throw new Error(`totalFare mismatch: ${r.data.totalFare}`);
  if (Number(r.data.platformCommissionAmount) !== 1000) throw new Error(`platformCommission mismatch: ${r.data.platformCommissionAmount}`);
  if (Number(r.data.driverPayout) !== 8850) throw new Error(`driverPayout mismatch: ${r.data.driverPayout}`);
});

await step('Calculate corporate driver commissions with partner split', async () => {
  const r = await api('GET', '/payments/trip/calculate-commission?totalFare=20000&platformRate=0.10&partnerRate=0.05&isCorporate=true');
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.platformCommissionAmount) !== 2000) throw new Error(`platformCommission mismatch: ${r.data.platformCommissionAmount}`);
  if (Number(r.data.partnerCommissionAmount) !== 1000) throw new Error(`partnerCommission mismatch: ${r.data.partnerCommissionAmount}`);
  if (Number(r.data.driverPayout) !== 16700) throw new Error(`driverPayout mismatch: ${r.data.driverPayout}`);
});

// ────────────────────────────────────────────────────────────────
//  2. Full Corporate Driver Payment Flow
// ────────────────────────────────────────────────────────────────

const tripId = `e2e-trip-${TS}`;
const riderId = `rider-${TS}`;
const driverId = `driver-${TS}`;
const partnerId = `partner-${TS}`;

let riderAccount, driverAccount;

await step('Ensure GL accounts exist', async () => {
  await ensureGlAccounts();
  if (!glCodes['1101']) throw new Error('GL account 1101 not found');
});

await step('Create rider and driver accounts', async () => {
  riderAccount = await createAccount(riderId);
  driverAccount = await createAccount(driverId);
  if (!riderAccount.accountNumber) throw new Error('No rider accountNumber');
  if (!driverAccount.accountNumber) throw new Error('No driver accountNumber');
});

await step('Fund rider wallet for trip payment', async () => {
  const r = await api('POST', '/wallet/funding', {
    body: { accountNumber: riderAccount.accountNumber, amount: 50000, currency: 'NGN', description: 'E2E test funding', tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

await step('Post Paystack payment clearing journal', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `PAYSTACK-E2E-${tripId}`, description: `Paystack payment for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['1201'], amount: 10000, side: 'DEBIT' },
        { glAccountId: glCodes['2402'], amount: 10000, side: 'CREDIT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (!r.data.id) throw new Error('No journal id');
});

await step('Post revenue allocation with commission splits', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `TRIP-ALLOC-E2E-${tripId}`, description: `Revenue allocation for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['2402'], amount: 10000, side: 'DEBIT' },
        { glAccountId: glCodes['4201'], amount: 1000, side: 'CREDIT' },
        { glAccountId: glCodes['2202'], amount: 500, side: 'CREDIT', subLedgerId: partnerId, subLedgerType: 'PARTNER_ACCOUNT' },
        { glAccountId: glCodes['2302'], amount: 8500, side: 'CREDIT', subLedgerId: driverId, subLedgerType: 'DRIVER_ACCOUNT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

await step('Credit driver wallet from earnings payable', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `DRV-CREDIT-E2E-${tripId}`, description: `Driver wallet credit for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['2302'], amount: 8500, side: 'DEBIT', subLedgerId: driverId, subLedgerType: 'DRIVER_ACCOUNT' },
        { glAccountId: glCodes['2301'], amount: 8500, side: 'CREDIT', subLedgerId: driverAccount.accountNumber, subLedgerType: 'CUSTOMER_ACCOUNT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

await step('Post Paystack settlement to bank', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `PAYSTACK-SETTLE-E2E-${tripId}`, description: `Paystack settlement to bank for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['1101'], amount: 10000, side: 'DEBIT' },
        { glAccountId: glCodes['1201'], amount: 10000, side: 'CREDIT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

await step('Settle partner commission payable', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `PARTNER-SETTLE-E2E-${tripId}`, description: `Partner remittance for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['2202'], amount: 500, side: 'DEBIT', subLedgerId: partnerId, subLedgerType: 'PARTNER_ACCOUNT' },
        { glAccountId: glCodes['1101'], amount: 500, side: 'CREDIT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

// ────────────────────────────────────────────────────────────────
//  3. Financial Audit & Reporting
// ────────────────────────────────────────────────────────────────

await step('Return audit trail', async () => {
  const r = await api('GET', `/ledger/audit/trail/PAYSTACK-E2E-${tripId}?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Return trial balance that is balanced', async () => {
  const r = await api('GET', `/ledger/audit/trial-balance?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.balanced !== true) throw new Error('Trial balance not balanced');
  if (Math.abs(Number(r.data.totalDebit) - Number(r.data.totalCredit)) > 0.01) throw new Error('Debits != Credits');
});

await step('Return profit and loss statement', async () => {
  const r = await api('GET', `/ledger/audit/profit-loss?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.totalIncome) < 0) throw new Error('totalIncome should be >= 0');
});

await step('Return balance sheet', async () => {
  const r = await api('GET', `/ledger/audit/balance-sheet?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

// ────────────────────────────────────────────────────────────────
//  4. GL Account Verification
// ────────────────────────────────────────────────────────────────

await step('Verify all journal entries are balanced', async () => {
  const r = await api('GET', `/ledger/transactions?tenantId=${TENANT_ID}&pageSize=50`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  for (const journal of r.data.data || []) {
    let debit = 0, credit = 0;
    for (const entry of journal.entries || []) {
      const a = Number(entry.amount);
      if (entry.side === 'DEBIT') debit += a; else credit += a;
    }
    if (Math.abs(debit - credit) > 0.001) throw new Error(`Journal ${journal.id} unbalanced: ${debit} vs ${credit}`);
  }
});

await step('Show correct GL account balances', async () => {
  const r = await api('GET', `/ledger/accounts?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  const paystack = r.data.find(a => a.code === '1201');
  const unsettled = r.data.find(a => a.code === '2402');
  if (!paystack) throw new Error('Paystack Clearing (1201) not found');
  if (!unsettled) throw new Error('Unsettled Collections (2402) not found');
});

// ────────────────────────────────────────────────────────────────
//  5. Revenue Recording via Service
// ────────────────────────────────────────────────────────────────

await step('Record trip revenue through revenue service', async () => {
  const r = await api('POST', '/ledger/revenue/trip', {
    body: {
      tripId: `e2e-rev-${TS}`, driverCustomerId: `e2e-driver-${TS}`,
      riderCustomerId: `e2e-rider-${TS}`, totalFare: 15000,
      platformCommissionRate: 0.10, tenantId: TENANT_ID,
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (r.data.success !== true) throw new Error('Revenue recording not successful');
  if (Number(r.data.financialSummary?.totalFare) !== 15000) throw new Error('totalFare mismatch');
});

await step('List trip financial records', async () => {
  const r = await api('GET', `/ledger/revenue/trips?tenantId=${TENANT_ID}&pageSize=10`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.data?.length) throw new Error('No trip records found');
});

await step('Return revenue summary', async () => {
  const r = await api('GET', `/ledger/revenue/summary?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.grossRevenue) <= 0) throw new Error('grossRevenue should be > 0');
});

// ────────────────────────────────────────────────────────────────
//  6. Commission Rules Management
// ────────────────────────────────────────────────────────────────

let ruleId;

await step('Create a commission rule', async () => {
  const r = await api('POST', '/ledger/commissions/rules', {
    body: { tenantId: TENANT_ID, ruleType: 'PLATFORM', calculationMethod: 'PERCENTAGE', rate: 0.15, priority: 1, description: '15% premium platform commission' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  ruleId = r.data.id;
});

await step('List commission rules', async () => {
  const r = await api('GET', `/ledger/commissions/rules?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.length) throw new Error('No commission rules found');
});

await step('Calculate commissions using rules', async () => {
  const r = await api('POST', '/ledger/commissions/calculate', {
    body: { amount: 10000, tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (!r.data.breakdown?.length) throw new Error('No breakdown in commission calculation');
});

// ────────────────────────────────────────────────────────────────
//  7. Partner Settlement Flow
// ────────────────────────────────────────────────────────────────

const partnerId2 = `e2e-partner-${TS}`;
let partnerAccount2;

await step('Create a partner settlement', async () => {
  const r = await api('POST', '/partner-settlements', {
    body: { tenantId: TENANT_ID, partnerId: partnerId2, settlementType: 'COMMISSION', amount: 5000, description: 'E2E partner commission settlement' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (r.data.status !== 'PENDING') throw new Error(`Expected PENDING, got ${r.data.status}`);
});

await step('Create partner account for settlement payout', async () => {
  partnerAccount2 = await createAccount(partnerId2);
  if (!partnerAccount2.accountNumber) throw new Error('No accountNumber');
});

await step('Settle partner (pay out)', async () => {
  const settlements = await api('GET', `/partner-settlements?tenantId=${TENANT_ID}&partnerId=${partnerId2}`);
  if (settlements.data.data?.length) {
    const sid = settlements.data.data[0].id;
    const r = await api('POST', '/partner-settlements/settle', {
      body: { settlementId: sid, partnerAccountNumber: partnerAccount2.accountNumber, tenantId: TENANT_ID },
    });
    if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
    if (r.data.success !== true) throw new Error('Settlement not successful');
  }
});

await step('Get partner balance', async () => {
  const r = await api('GET', `/partner-settlements/partner/${partnerId2}/balance?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.partnerId !== partnerId2) throw new Error('partnerId mismatch');
});

// ────────────────────────────────────────────────────────────────
//  8. Driver Earnings Flow
// ────────────────────────────────────────────────────────────────

const driverEarnId = `e2e-driver-earn-${TS}`;
const tripEarnId = `e2e-trip-earn-${TS}`;
let driverEarningId;

await step('Record driver earning', async () => {
  const r = await api('POST', '/driver-earnings/record', {
    body: { tenantId: TENANT_ID, driverCustomerId: driverEarnId, tripId: tripEarnId, tripFare: 12000, platformCommission: 1200, partnerCommission: 0, netEarnings: 10800, currency: 'NGN' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  driverEarningId = r.data.id;
});

await step('Get driver earnings summary', async () => {
  const r = await api('GET', `/driver-earnings/driver/${driverEarnId}?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.earnings?.length) throw new Error('No earnings found');
});

await step('List all driver earnings with pagination', async () => {
  const r = await api('GET', `/driver-earnings?tenantId=${TENANT_ID}&pageSize=10`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Payout driver earnings', async () => {
  const da = await createAccount(driverEarnId);
  const r = await api('POST', `/driver-earnings/${driverEarningId}/payout`, {
    body: { driverAccountNumber: da.accountNumber, tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

// ────────────────────────────────────────────────────────────────
//  9. End-to-End Balance Verification
// ────────────────────────────────────────────────────────────────

await step('Verify accounting equation: Assets = Liabilities + Equity', async () => {
  const r = await api('GET', `/ledger/audit/balance-sheet?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.accountingEquation?.balanced !== true) throw new Error('Accounting equation not balanced');
});

await step('Verify trial balance is zero (debits = credits)', async () => {
  const r = await api('GET', `/ledger/audit/trial-balance?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.balanced !== true) throw new Error('Trial balance not balanced');
  if (Math.abs(Number(r.data.totalDebit) - Number(r.data.totalCredit)) > 0.01) throw new Error(`Debit/credit off`);
});

console.log(`\n\x1b[1mResults:\x1b[0m ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
