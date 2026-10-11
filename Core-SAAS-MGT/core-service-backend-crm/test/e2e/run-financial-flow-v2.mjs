#!/usr/bin/env node

const BASE = process.env.GATEWAY_URL || 'http://localhost:3000';
const TENANT_ID = `E2E-V2-TENANT`;
const TS = Date.now();
const riderId = `rider-${TS}`;
const driverId = `driver-${TS}`;
const partnerId = `partner-${TS}`;
const tripId = `e2e-v2-trip-${TS}`;

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
  const headers = { 'content-type': 'application/json', ...opts.headers };
  const body = opts.body ? JSON.stringify(opts.body) : undefined;
  const res = await fetch(url, { method, headers, body });
  const data = res.headers.get('content-type')?.includes('json')
    ? await res.json() : await res.text();
  return { status: res.status, data };
}

// ─── Helpers ──────────────────────────────────────────────────

const glCodes = {};

async function ensureGlAccounts() {
  const required = [
    { code: '1101', name: 'Cash at Bank', type: 'ASSET' },
    { code: '1201', name: 'Paystack Clearing', type: 'ASSET' },
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

// ════════════════════════════════════════════════════════════════
//  1. Site-Wide Fare Config (includes coin reward)
// ════════════════════════════════════════════════════════════════

await step('Seed default fare configs', async () => {
  const r = await api('POST', '/ledger/site-wide-fare-config/seed', {
    body: {}, headers: { 'x-tenant-id': TENANT_ID },
  });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Create/update coin reward configs', async () => {
  for (const { key, value } of [
    { key: 'COIN_REWARD_ENABLED', value: 'true' },
    { key: 'RIDER_COIN_REWARD_PER_TRIP', value: '10' },
    { key: 'DRIVER_COIN_REWARD_PER_TRIP', value: '25' },
    { key: 'TENANT_COIN_REWARD_PER_TRIP', value: '5' },
  ]) {
    const r = await api('POST', '/ledger/site-wide-fare-config', {
      body: { key, value, description: `${key} config`, tenantId: TENANT_ID },
      headers: { 'x-tenant-id': TENANT_ID },
    });
    if (![200, 201].includes(r.status)) throw new Error(`Failed for ${key}: got ${r.status}`);
  }
});

await step('Read coin reward config values', async () => {
  const r = await api('GET', `/ledger/site-wide-fare-config/COIN_REWARD_ENABLED?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.value !== 'true') throw new Error(`Expected true, got ${r.data.value}`);
});

await step('List all fare configs', async () => {
  const r = await api('GET', `/ledger/site-wide-fare-config?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length < 4) throw new Error(`Expected >=4 configs, got ${r.data.length}`);
});

// ════════════════════════════════════════════════════════════════
//  2. Queens Coin Rewards
// ════════════════════════════════════════════════════════════════

await step('Award trip coins to rider, driver, and tenant', async () => {
  const r = await api('POST', '/ledger/coin-reward/award-trip', {
    body: { tripId, tenantId: TENANT_ID, riderCustomerId: riderId, driverCustomerId: driverId },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (Number(r.data.riderCoins) !== 10) throw new Error(`riderCoins mismatch: ${r.data.riderCoins}`);
  if (Number(r.data.driverCoins) !== 25) throw new Error(`driverCoins mismatch: ${r.data.driverCoins}`);
  if (Number(r.data.tenantCoins) !== 5) throw new Error(`tenantCoins mismatch: ${r.data.tenantCoins}`);
});

await step('Show coin balance for each entity', async () => {
  const [rider, driver, tenant] = await Promise.all([
    api('GET', `/ledger/coin-reward/balance/RIDER/${riderId}`, { headers: { 'x-tenant-id': TENANT_ID } }),
    api('GET', `/ledger/coin-reward/balance/DRIVER/${driverId}`, { headers: { 'x-tenant-id': TENANT_ID } }),
    api('GET', `/ledger/coin-reward/balance/TENANT/${TENANT_ID}`, { headers: { 'x-tenant-id': TENANT_ID } }),
  ]);
  if (Number(rider.data.balance) !== 10) throw new Error(`rider balance mismatch: ${rider.data.balance}`);
  if (Number(driver.data.balance) !== 25) throw new Error(`driver balance mismatch: ${driver.data.balance}`);
  if (Number(tenant.data.balance) !== 5) throw new Error(`tenant balance mismatch: ${tenant.data.balance}`);
});

await step('Return wallet for rider entity', async () => {
  const r = await api('GET', `/ledger/coin-reward/wallet/RIDER/${riderId}`, {
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.entityId !== riderId) throw new Error(`entityId mismatch: ${r.data.entityId}`);
});

await step('Return wallets list for tenant', async () => {
  const r = await api('GET', '/ledger/coin-reward/wallets', { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length !== 3) throw new Error(`Expected 3 wallets, got ${r.data.length}`);
});

await step('Return transactions for a wallet', async () => {
  const wallets = await api('GET', '/ledger/coin-reward/wallets', { headers: { 'x-tenant-id': TENANT_ID } });
  const riderWallet = wallets.data.find(w => w.entityType === 'RIDER');
  if (!riderWallet) throw new Error('Rider wallet not found');
  const r = await api('GET', `/ledger/coin-reward/transactions/${riderWallet.id}?page=0&pageSize=10`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.data?.length) throw new Error('No transactions');
  if (Number(r.data.data[0].amount) !== 10) throw new Error(`amount mismatch: ${r.data.data[0].amount}`);
  if (r.data.data[0].type !== 'CREDIT') throw new Error(`type mismatch: ${r.data.data[0].type}`);
});

await step('Idempotent awarding — same trip adds coins again', async () => {
  await api('POST', '/ledger/coin-reward/award-trip', {
    body: { tripId, tenantId: TENANT_ID, riderCustomerId: riderId, driverCustomerId: driverId },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  const r = await api('GET', `/ledger/coin-reward/balance/RIDER/${riderId}`, {
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (Number(r.data.balance) !== 20) throw new Error(`Expected 20, got ${r.data.balance}`);
});

await step('Reject invalid entity type', async () => {
  const r = await api('GET', `/ledger/coin-reward/balance/INVALID/${riderId}`, {
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 400) throw new Error(`Expected 400, got ${r.status}`);
});

await step('Return non-existent wallet gracefully', async () => {
  const r = await api('GET', '/ledger/coin-reward/wallet/RIDER/non-existent-id', {
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.exists !== false) throw new Error('expected exists=false');
  if (Number(r.data.balance) !== 0) throw new Error('expected balance=0');
});

// ════════════════════════════════════════════════════════════════
//  3. Trip Payment Flow (simulated via ledger posting)
// ════════════════════════════════════════════════════════════════

await step('Ensure GL accounts exist', async () => {
  await ensureGlAccounts();
  if (!glCodes['1201']) throw new Error('GL account 1201 not found');
});

await step('Post payment clearing journal', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `PAYSTACK-E2E-V2-${tripId}`, description: `Paystack payment for trip ${tripId}`,
      postingDate: new Date(), currency: 'NGN', tenantId: TENANT_ID,
      entries: [
        { glAccountId: glCodes['1201'], amount: 10000, side: 'DEBIT' },
        { glAccountId: glCodes['2402'], amount: 10000, side: 'CREDIT' },
      ],
    },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
});

await step('Post revenue allocation with commission splits', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `TRIP-ALLOC-V2-${tripId}`, description: `Revenue allocation for trip ${tripId}`,
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

// ════════════════════════════════════════════════════════════════
//  4. Driver Earnings
// ════════════════════════════════════════════════════════════════

let earningId;

await step('Record driver earning', async () => {
  const r = await api('POST', '/driver-earnings/record', {
    body: { tenantId: TENANT_ID, driverCustomerId: driverId, tripId, tripFare: 10000, platformCommission: 1000, partnerCommission: 500, netEarnings: 8500, bonusAmount: 500, currency: 'NGN' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  earningId = r.data.id;
  if (Number(r.data.finalPayout) !== 9000) throw new Error(`finalPayout mismatch: ${r.data.finalPayout}`);
});

await step('Get earnings summary', async () => {
  const r = await api('GET', `/driver-earnings/summary?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.totalEarnings) <= 0) throw new Error('totalEarnings should be > 0');
});

await step('Get driver-specific earnings', async () => {
  const r = await api('GET', `/driver-earnings/driver/${driverId}?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.earnings?.length) throw new Error('No earnings found');
  if (Number(r.data.totals?.totalFare) !== 10000) throw new Error('totalFare mismatch');
});

await step('List all earnings with pagination', async () => {
  const r = await api('GET', `/driver-earnings?tenantId=${TENANT_ID}&pageSize=10`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.data?.length) throw new Error('No earnings data');
});

// ════════════════════════════════════════════════════════════════
//  5. Commission Rules
// ════════════════════════════════════════════════════════════════

await step('Create commission rules', async () => {
  for (const rule of [
    { ruleType: 'PLATFORM', calculationMethod: 'PERCENTAGE', rate: 0.10, priority: 1, description: '10% platform fee', tenantId: TENANT_ID },
    { ruleType: 'PARTNER', calculationMethod: 'PERCENTAGE', rate: 0.05, priority: 2, description: '5% partner fee', tenantId: TENANT_ID },
  ]) {
    const r = await api('POST', '/ledger/commissions/rules', { body: rule });
    if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  }
});

await step('List commission rules', async () => {
  const r = await api('GET', `/ledger/commissions/rules?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length < 2) throw new Error(`Expected >=2 rules, got ${r.data.length}`);
});

// ════════════════════════════════════════════════════════════════
//  6. Driver Savings Plans
// ════════════════════════════════════════════════════════════════

let planId;

await step('Create a savings plan', async () => {
  const r = await api('POST', '/driver-savings/plan', {
    body: { driverCustomerId: driverId, targetAmount: 100000, contributionPerTrip: 5000, earlyWithdrawalPenaltyPercent: 10, maxEarlyWithdrawalPenalty: 5000 },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  planId = r.data.id;
  if (r.data.status !== 'ACTIVE') throw new Error(`Expected ACTIVE, got ${r.data.status}`);
});

await step('Record a contribution', async () => {
  const r = await api('POST', '/driver-savings/contribute', {
    body: { planId, tripId: `${tripId}-savings`, amount: 5000 },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.currentAmount) !== 5000) throw new Error(`currentAmount mismatch: ${r.data.currentAmount}`);
});

await step('List plans for driver', async () => {
  const r = await api('GET', `/driver-savings/plans?driverCustomerId=${driverId}`, {
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length !== 1) throw new Error(`Expected 1 plan, got ${r.data.length}`);
});

await step('Get plan summary', async () => {
  const r = await api('GET', '/driver-savings/summary', { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.totalPlans < 1) throw new Error('totalPlans should be >= 1');
  if (Number(r.data.totalSaved) < 5000) throw new Error('totalSaved should be >= 5000');
});

await step('Get savings plan by id', async () => {
  const r = await api('GET', `/driver-savings/plan/${planId}`, { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.id !== planId) throw new Error('plan id mismatch');
});

// ════════════════════════════════════════════════════════════════
//  7. Remittance Schedules
// ════════════════════════════════════════════════════════════════

let scheduleId;

await step('Create a remittance schedule', async () => {
  const r = await api('POST', '/remittance/schedule', {
    body: { partnerId, cycle: 'DAILY', amount: 50000, dueDate: new Date(Date.now() + 7 * 86400000).toISOString() },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  scheduleId = r.data.id;
  if (r.data.status !== 'PENDING') throw new Error(`Expected PENDING, got ${r.data.status}`);
});

await step('Get pending schedules', async () => {
  const r = await api('GET', '/remittance/pending', { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length < 1) throw new Error('Expected >=1 pending schedules');
});

await step('Get all schedules', async () => {
  const r = await api('GET', '/remittance/all', { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.length < 1) throw new Error('Expected >=1 schedules');
});

await step('Get remittance summary', async () => {
  const r = await api('GET', '/remittance/summary', { headers: { 'x-tenant-id': TENANT_ID } });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.totalSchedules < 1) throw new Error('totalSchedules >= 1');
  if (Number(r.data.totalAmount) < 50000) throw new Error('totalAmount >= 50000');
});

await step('Process the schedule', async () => {
  const r = await api('POST', `/remittance/${scheduleId}/process`, {
    body: { actor: 'e2e-test' },
    headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${r.data.status}`);
});

// ════════════════════════════════════════════════════════════════
//  8. Audit Trail & GL Impact
// ════════════════════════════════════════════════════════════════

await step('List audit trail with pagination', async () => {
  const r = await api('GET', `/ledger/audit/trail?tenantId=${TENANT_ID}&page=0&pageSize=10`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.data?.length) throw new Error('No audit trail entries');
});

await step('Get audit trail by reference', async () => {
  const r = await api('GET', `/ledger/audit/trail/PAYSTACK-E2E-V2-${tripId}?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Get GL impact for a journal entry', async () => {
  const trail = await api('GET', `/ledger/audit/trail?tenantId=${TENANT_ID}&page=0&pageSize=1`);
  if (trail.data.data?.length) {
    const jid = trail.data.data[0].id;
    const r = await api('GET', `/ledger/audit/gl-impact/${jid}?tenantId=${TENANT_ID}`);
    if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
    if (!r.data.glImpact || r.data.glImpact.length < 2) throw new Error('Expected >=2 GL impacts');
  }
});

// ════════════════════════════════════════════════════════════════
//  9. Financial Reports
// ════════════════════════════════════════════════════════════════

await step('Return trial balance that is balanced', async () => {
  const r = await api('GET', `/ledger/audit/trial-balance?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.balanced !== true) throw new Error('Not balanced');
});

await step('Return profit and loss', async () => {
  const r = await api('GET', `/ledger/audit/profit-loss?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (Number(r.data.totalIncome) < 0) throw new Error('totalIncome should be >= 0');
});

await step('Return balance sheet', async () => {
  const r = await api('GET', `/ledger/audit/balance-sheet?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Verify accounting equation: Assets = Liabilities + Equity', async () => {
  const r = await api('GET', `/ledger/audit/balance-sheet?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.accountingEquation?.balanced !== true) throw new Error('Accounting equation not balanced');
});

// ════════════════════════════════════════════════════════════════
//  10. Scheduler Workers
// ════════════════════════════════════════════════════════════════

await step('Process overdue remittances', async () => {
  const r = await api('POST', '/scheduler/remittance/process-overdue', {
    body: {}, headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Disburse mature savings', async () => {
  const r = await api('POST', '/scheduler/savings/disburse-mature', {
    body: {}, headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Process weekly savings disbursements', async () => {
  const r = await api('POST', '/scheduler/savings/disburse-weekly', {
    body: {}, headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

await step('Process monthly savings disbursements', async () => {
  const r = await api('POST', '/scheduler/savings/disburse-monthly', {
    body: {}, headers: { 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
});

// ════════════════════════════════════════════════════════════════
//  11. GL Account Verification
// ════════════════════════════════════════════════════════════════

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

console.log(`\n\x1b[1mResults:\x1b[0m ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
