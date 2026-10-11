#!/usr/bin/env node

const BASE = process.env.GATEWAY_URL || 'http://localhost:3000';
const TENANT_ID = 'SYSTEM';

let passed = 0, failed = 0;

function ok(msg)  { console.log(`  \x1b[32m✓\x1b[0m ${msg}`); passed++; }
function nok(msg) { console.log(`  \x1b[31m✕\x1b[0m ${msg}`); failed++; }

async function step(name, fn) {
  process.stdout.write(`\n${name}\n`);
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
  return { status: res.status, data, headers: res.headers };
}

// ─── Auth & RBAC Flow ──────────────────────────────────────────

const email = `test-${Date.now()}@example.com`;
const phone = `+23480${String(Date.now()).slice(-8)}`;
const password = 'Password123!';

let userId, accessToken;

await step('Register a new user', async () => {
  const r = await api('POST', '/auth/register', {
    body: { email, password, firstName: 'Test', lastName: 'User', phone, tenantId: TENANT_ID },
  });
  if (r.status !== 201) throw new Error(`Expected 201, got ${r.status}`);
  if (!r.data.id) throw new Error('No id in response');
  userId = r.data.id;
});

await step('Verify user account', async () => {
  const r = await api('POST', '/auth/verify-account', { body: { userId } });
  if (r.status !== 201 && r.status !== 200) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Login and get access token', async () => {
  const r = await api('POST', '/auth/login', {
    body: { email, password, tenantId: TENANT_ID },
  });
  if (r.status !== 200 && r.status !== 201) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.access_token) throw new Error('No access_token in response');
  accessToken = r.data.access_token;
});

let roleId;

await step('Get available roles', async () => {
  const r = await api('GET', `/rbac/roles?tenantId=${TENANT_ID}`, {
    headers: { authorization: `Bearer ${accessToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200) throw new Error(`Expected 200, got ${r.status}`);
  const admin = r.data.find(rr => rr.name === 'ADMIN');
  if (!admin) throw new Error('ADMIN role not found');
  roleId = admin.id;
});

await step('Assign ADMIN role to user', async () => {
  const r = await api('POST', `/rbac/users/${userId}/roles`, {
    body: { roleIds: [roleId], tenantId: TENANT_ID },
    headers: { authorization: `Bearer ${accessToken}`, 'x-tenant-id': TENANT_ID },
  });
  if (r.status !== 200 && r.status !== 201) throw new Error(`Expected 200/201, got ${r.status}`);
});

await step('Re-login to get updated JWT with permissions', async () => {
  const r = await api('POST', '/auth/login', {
    body: { email, password, tenantId: TENANT_ID },
  });
  if (r.status !== 200 && r.status !== 201) throw new Error(`Expected 200, got ${r.status}`);
  if (!r.data.access_token) throw new Error('No access_token');
  accessToken = r.data.access_token;
});

console.log(`\n\x1b[1mResults:\x1b[0m ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
