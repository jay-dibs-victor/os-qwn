#!/usr/bin/env node

/**
 * Banking Service Comprehensive Flow
 * Covers: Auth/JWT, RBAC, Approval, Reversal (full + partial)
 */

const BASE = process.env.GATEWAY_URL || 'http://localhost:3000';
const TENANT_ID = 'SYSTEM';
const TS = Date.now();
const password = 'StrongPassword123!';

const makerEmail  = `maker-${TS}@test.com`;
const checkerEmail = `checker-${TS}@test.com`;
const officerEmail = `officer-${TS}@test.com`;

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

function randPhone() {
  return `+234${Math.floor(100000000 + Math.random() * 900000000)}`;
}

// ─── Auth: Register 3 users ────────────────────────────────────

let makerId, checkerId, officerId;
let makerToken, checkerToken, officerToken;

await step('Register Maker user', async () => {
  const r = await api('POST', '/auth/register', {
    body: { email: makerEmail, password, firstName: 'Maker', lastName: 'User', phone: randPhone(), tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  makerId = r.data.id;
});

await step('Verify Maker account', async () => {
  const r = await api('POST', '/auth/verify-account', { body: { userId: makerId } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Register Checker user', async () => {
  const r = await api('POST', '/auth/register', {
    body: { email: checkerEmail, password, firstName: 'Checker', lastName: 'User', phone: randPhone(), tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  checkerId = r.data.id;
});

await step('Verify Checker account', async () => {
  const r = await api('POST', '/auth/verify-account', { body: { userId: checkerId } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Register Reversal Officer user', async () => {
  const r = await api('POST', '/auth/register', {
    body: { email: officerEmail, password, firstName: 'Reversal', lastName: 'Officer', phone: randPhone(), tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  officerId = r.data.id;
});

await step('Verify Officer account', async () => {
  const r = await api('POST', '/auth/verify-account', { body: { userId: officerId } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

// ─── Logins ────────────────────────────────────────────────────

await step('Login Maker', async () => {
  const r = await api('POST', '/auth/login', { body: { email: makerEmail, password, tenantId: TENANT_ID } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200, got ${r.status}`);
  makerToken = r.data.access_token;
  if (!makerToken) throw new Error('No access_token');
});

await step('Login Checker', async () => {
  const r = await api('POST', '/auth/login', { body: { email: checkerEmail, password, tenantId: TENANT_ID } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200, got ${r.status}`);
  checkerToken = r.data.access_token;
});

await step('Login Officer', async () => {
  const r = await api('POST', '/auth/login', { body: { email: officerEmail, password, tenantId: TENANT_ID } });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200, got ${r.status}`);
  officerToken = r.data.access_token;
});

// ─── RBAC: Permission check + role assignment ──────────────────

let adminRoleId, officerRoleId;

await step('Maker initially has no permission — reversal should 403', async () => {
  const r = await api('POST', '/reversal', {
    body: { transactionId: 'some-id', reason: 'DUPLICATE_PAYMENT', requestedBy: 'test', tenantId: TENANT_ID },
    headers: { authorization: `Bearer ${makerToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 403) throw new Error(`Expected 403, got ${r.status}`);
});

await step('Get available roles', async () => {
  const r = await api('GET', `/rbac/roles?tenantId=${TENANT_ID}`);
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  const admin = r.data.find(rr => rr.name === 'ADMIN');
  const officer = r.data.find(rr => rr.name === 'REVERSAL_OFFICER');
  if (!admin) throw new Error('ADMIN role not found');
  if (!officer) throw new Error('REVERSAL_OFFICER role not found');
  adminRoleId = admin.id;
  officerRoleId = officer.id;
});

await step('Assign ADMIN role to Maker', async () => {
  const r = await api('POST', `/rbac/users/${makerId}/roles`, {
    body: { roleIds: [adminRoleId], tenantId: TENANT_ID },
    headers: { authorization: `Bearer ${makerToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Assign ADMIN role to Checker', async () => {
  const r = await api('POST', `/rbac/users/${checkerId}/roles`, {
    body: { roleIds: [adminRoleId], tenantId: TENANT_ID },
    headers: { authorization: `Bearer ${checkerToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Assign REVERSAL_OFFICER role to Officer', async () => {
  const r = await api('POST', `/rbac/users/${officerId}/roles`, {
    body: { roleIds: [officerRoleId], tenantId: TENANT_ID },
    headers: { authorization: `Bearer ${officerToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (![200, 201].includes(r.status)) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Re-login Maker for updated JWT', async () => {
  const r = await api('POST', '/auth/login', { body: { email: makerEmail, password, tenantId: TENANT_ID } });
  makerToken = r.data.access_token;
  if (!makerToken) throw new Error('No access_token');
});

await step('Re-login Checker for updated JWT', async () => {
  const r = await api('POST', '/auth/login', { body: { email: checkerEmail, password, tenantId: TENANT_ID } });
  checkerToken = r.data.access_token;
});

await step('Re-login Officer for updated JWT', async () => {
  const r = await api('POST', '/auth/login', { body: { email: officerEmail, password, tenantId: TENANT_ID } });
  officerToken = r.data.access_token;
});

// ─── Ledger Setup & Transaction Posting ────────────────────────

let glAssetId, glLiabilityId;
let realTxId, partialTxId;

const authHeaders = (token) => ({ authorization: `Bearer ${token}`, 'x-tenant-id': TENANT_ID });

await step('Create or find GL asset account (1100-TEST)', async () => {
  const r = await api('POST', '/ledger/accounts', {
    body: { code: '1100-TEST', name: 'CASH', type: 'ASSET', tenantId: TENANT_ID },
    headers: authHeaders(makerToken),
  });
  if (r.status === 201) { glAssetId = r.data.id; return; }
  const list = await api('GET', `/ledger/accounts?tenantId=${TENANT_ID}`, { headers: authHeaders(makerToken) });
  const found = list.data.find(a => a.code === '1100-TEST');
  if (!found) throw new Error('Could not create or find GL asset account');
  glAssetId = found.id;
});

await step('Create or find GL liability account (2100-TEST)', async () => {
  const r = await api('POST', '/ledger/accounts', {
    body: { code: '2100-TEST', name: 'DEPOSITS', type: 'LIABILITY', tenantId: TENANT_ID },
    headers: authHeaders(makerToken),
  });
  if (r.status === 201) { glLiabilityId = r.data.id; return; }
  const list = await api('GET', `/ledger/accounts?tenantId=${TENANT_ID}`, { headers: authHeaders(makerToken) });
  const found = list.data.find(a => a.code === '2100-TEST');
  if (!found) throw new Error('Could not create or find GL liability account');
  glLiabilityId = found.id;
});

await step('Post a real balanced transaction (150k deposit)', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `TX-${TS}`, description: 'Initial customer deposit',
      postingDate: new Date(), tenantId: TENANT_ID,
      entries: [
        { glAccountId: glAssetId, amount: 150000, side: 'DEBIT' },
        { glAccountId: glLiabilityId, amount: 150000, side: 'CREDIT' },
      ],
    },
    headers: authHeaders(makerToken),
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (!r.data.id) throw new Error('No transaction id');
  realTxId = r.data.id;
});

await step('Post another transaction for partial reversals (200k)', async () => {
  const r = await api('POST', '/ledger/posting/transaction', {
    body: {
      reference: `TX-PARTIAL-${TS}`, description: 'Partial test deposit',
      postingDate: new Date(), tenantId: TENANT_ID,
      entries: [
        { glAccountId: glAssetId, amount: 200000, side: 'DEBIT' },
        { glAccountId: glLiabilityId, amount: 200000, side: 'CREDIT' },
      ],
    },
    headers: authHeaders(makerToken),
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  partialTxId = r.data.id;
});

// ─── Approval Workflow & Reversal ──────────────────────────────

let requestId;

await step('Reversal Officer initiates reversal >100k — returns 202 (intercepted)', async () => {
  const r = await api('POST', '/reversal', {
    body: { transactionId: realTxId, reason: 'DUPLICATE_PAYMENT', requestedBy: officerId, tenantId: TENANT_ID },
    headers: authHeaders(officerToken),
  });
  if (r.status !== 202) throw new Error(`Expected 202, got ${r.status}`);
  if (!r.data.requestId) throw new Error('No requestId in intercepted response');
  requestId = r.data.requestId;
});

await step('Pending request visible in approval-service', async () => {
  const r = await api('GET', '/approval/requests', { headers: authHeaders(checkerToken) });
  const req = r.data.find(rr => rr.id === requestId);
  if (!req) throw new Error('Request not found');
  if (req.status !== 'PENDING') throw new Error(`Expected PENDING, got ${req.status}`);
  if (req.initiatorId !== officerId) throw new Error(`initiatorId mismatch: ${req.initiatorId}`);
});

await step('Checker approves the request', async () => {
  const r = await api('POST', `/approval/requests/${requestId}/approve`, {
    body: { approverId: checkerId, comment: 'Looks valid' },
    headers: authHeaders(checkerToken),
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (r.data.status !== 'APPROVED') throw new Error(`Expected APPROVED, got ${r.data.status}`);
});

await step('Verify reversal executed after approval', async () => {
  await new Promise(r => setTimeout(r, 2000));
  const r = await api('GET', `/reversal/${realTxId}`, { headers: authHeaders(officerToken) });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  if (r.data.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${r.data.status}`);
});

// ─── Partial Reversals ─────────────────────────────────────────

await step('Partial reversal 50k under 100k — immediate (201)', async () => {
  const r = await api('POST', '/reversal', {
    body: { transactionId: partialTxId, reason: 'CUSTOMER_REQUEST', type: 'PARTIAL_REVERSAL', amount: 50000, requestedBy: officerId, tenantId: TENANT_ID },
    headers: { ...authHeaders(officerToken), 'x-bypass-approval': 'true' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (r.data.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${r.data.status}`);
  if (Number(r.data.amount) !== 50000) throw new Error(`amount mismatch: ${r.data.amount}`);
  if (r.data.type !== 'PARTIAL_REVERSAL') throw new Error(`type mismatch: ${r.data.type}`);
});

await step('Second partial reversal 100k', async () => {
  const r = await api('POST', '/reversal', {
    body: { transactionId: partialTxId, reason: 'CUSTOMER_REQUEST', type: 'PARTIAL_REVERSAL', amount: 100000, requestedBy: officerId, tenantId: TENANT_ID },
    headers: { ...authHeaders(officerToken), 'x-bypass-approval': 'true' },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (r.data.status !== 'COMPLETED') throw new Error(`Expected COMPLETED, got ${r.data.status}`);
  if (Number(r.data.amount) !== 100000) throw new Error(`amount mismatch: ${r.data.amount}`);
});

await step('Prevent reversing more than original amount (60k would exceed 200k original)', async () => {
  const r = await api('POST', '/reversal', {
    body: { transactionId: partialTxId, reason: 'CUSTOMER_REQUEST', type: 'PARTIAL_REVERSAL', amount: 60000, requestedBy: officerId, tenantId: TENANT_ID },
    headers: { ...authHeaders(officerToken), 'x-bypass-approval': 'true' },
  });
  if (r.status !== 400) throw new Error(`Expected 400, got ${r.status}`);
  const msg = (typeof r.data.message === 'string' ? r.data.message : JSON.stringify(r.data.message)).toLowerCase();
  if (!msg.includes('exceed')) throw new Error(`Expected exceed error, got: ${r.data.message}`);
});

console.log(`\n\x1b[1mResults:\x1b[0m ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
