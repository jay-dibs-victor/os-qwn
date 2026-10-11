#!/usr/bin/env node
/**
 * Full Auth Flow Test — Queens OS
 * Tests: signup → verify-code → login → forgot-password → reset-password
 * Also tests driver signup flow
 */

const BASE = 'http://localhost:12000/api/v1';

const USERS = [
  { email: 'jeremyvictor788@gmail.com', firstName: 'Jeremy', lastName: 'Victor', username: 'jeremyvictor', phone: '+2348012345678' },
  { email: 'lizyqueen2@gmail.com',      firstName: 'Lizy',   lastName: 'Queen',  username: 'lizyqueen2',   phone: '+2348098765432' },
];

const PASSWORD = 'Queens2026';

// ─── helpers ────────────────────────────────────────────────────────────────
async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  let json;
  try { json = await res.json(); } catch { json = {}; }
  return { status: res.status, json };
}

function log(icon, msg) { console.log(`  ${icon}  ${msg}`); }
function ok(msg)  { log('✅', msg); }
function fail(msg){ log('❌', msg); }
function info(msg){ log('ℹ️ ', msg); }
function sep(title){ console.log(`\n${'─'.repeat(60)}\n  ${title}\n${'─'.repeat(60)}`); }

// ─── individual flow steps ───────────────────────────────────────────────────

async function doSignup(user) {
  sep(`SIGNUP — ${user.email}`);
  const { status, json } = await req('POST', '/auth/signup', {
    email:        user.email,
    password:     PASSWORD,
    firstname:    user.firstName,
    lastname:     user.lastName,
    username:     user.username,
    phoneNumber:  user.phone,
    user_type:    'Individual',
    roles:        'user',
    terms_and_cond: 'selected',
  });

  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));

  if (status === 201 || status === 200) {
    ok('Signup succeeded — verification email/OTP should be sent');
    return true;
  } else if (status === 400 && JSON.stringify(json).toLowerCase().includes('exist')) {
    info('User already exists — skipping to login test');
    return 'exists';
  } else {
    fail(`Signup failed: ${json.message || json.error || JSON.stringify(json)}`);
    return false;
  }
}

async function doVerifyCode(email, code) {
  sep(`VERIFY CODE — ${email}`);
  const { status, json } = await req('POST', '/auth/verify-code', { email, code });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 200) { ok('Email verified!'); return true; }
  fail(`Verify failed: ${json.message || json.error}`);
  return false;
}

async function doResendCode(email) {
  sep(`RESEND CODE — ${email}`);
  const { status, json } = await req('POST', '/auth/resend-code', { email });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 200) { ok('Code resent!'); return true; }
  fail(`Resend failed: ${json.message || json.error}`);
  return false;
}

async function doLogin(email, password) {
  sep(`LOGIN — ${email}`);
  const { status, json } = await req('POST', '/auth/login', { email, password });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 200) {
    const token = json.data?.[0]?.token || json.token;
    ok(`Login succeeded — token: ${token ? token.substring(0, 30) + '...' : 'N/A'}`);
    return token;
  }
  fail(`Login failed: ${json.message || json.error || JSON.stringify(json)}`);
  return null;
}

async function doForgotPassword(email) {
  sep(`FORGOT PASSWORD — ${email}`);
  const { status, json } = await req('POST', '/auth/forgot_password', { email });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 200) { ok('Forgot-password OTP sent to email!'); return true; }
  fail(`Forgot-password failed: ${json.message || json.error}`);
  return false;
}

async function doResetPassword(email, code, newPassword) {
  sep(`RESET PASSWORD — ${email}`);
  const { status, json } = await req('POST', '/auth/resetpassword/mobile', {
    email,
    code,
    password: newPassword,
  });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 200) { ok('Password reset successful!'); return true; }
  fail(`Reset failed: ${json.message || json.error}`);
  return false;
}

async function doDriverSignup(user) {
  sep(`DRIVER SIGNUP — ${user.email}`);
  const { status, json } = await req('POST', '/auth/drivers-signup', {
    email:        user.email,
    password:     PASSWORD,
    firstname:    user.firstName,
    lastname:     user.lastName,
    username:     user.username,
    phoneNumber:  user.phone,
    user_type:    'Individual',
    roles:        'Individual Driver',
    terms_and_cond: 'selected',
  });
  console.log('  status:', status);
  console.log('  body  :', JSON.stringify(json, null, 4));
  if (status === 201 || status === 200) { ok('Driver signup succeeded!'); return true; }
  if (status === 400 && JSON.stringify(json).toLowerCase().includes('exist')) {
    info('Driver already exists');
    return 'exists';
  }
  fail(`Driver signup failed: ${json.message || json.error}`);
  return false;
}

// ─── main ────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║         Queens OS — Full Auth Flow Test                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // 1. Health check
  sep('HEALTH CHECK');
  const { status: hs, json: hj } = await req('GET', '/../health', null).catch(() => ({ status: 0, json: {} }));
  // Try gateway health
  try {
    const r = await fetch('http://localhost:12000/health');
    const j = await r.json();
    console.log('  Gateway health:', r.status, JSON.stringify(j));
    ok('Gateway is up');
  } catch (e) {
    fail('Gateway unreachable: ' + e.message);
    process.exit(1);
  }

  for (const user of USERS) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`  TESTING USER: ${user.email}`);
    console.log(`${'═'.repeat(60)}`);

    // Step 1: Signup
    const signupResult = await doSignup(user);

    // Step 2: Resend code (to trigger another email)
    await doResendCode(user.email);

    // Step 3: Login (will fail if not verified, but shows the error message)
    const token = await doLogin(user.email, PASSWORD);

    // Step 4: Forgot password (sends OTP to email)
    await doForgotPassword(user.email);

    // Step 5: Try reset with dummy code (expected to fail — just testing the endpoint)
    await doResetPassword(user.email, '000000', 'NewQueens@2026!');
  }

  // Driver flow test with first user email (different endpoint)
  console.log(`\n${'═'.repeat(60)}`);
  console.log('  TESTING DRIVER FLOW');
  console.log(`${'═'.repeat(60)}`);
  const driverUser = {
    email: `driver_${Date.now()}@test.com`,
    firstName: 'Test',
    lastName: 'Driver',
    username: `testdriver${Date.now()}`.substring(0, 20),
    phone: '+2348011111111',
  };
  await doDriverSignup(driverUser);

  // Check auth service logs for email activity
  console.log('\n\n📋 Checking auth service logs for email activity...\n');
  const { execSync } = require('child_process');
  try {
    const logs = execSync('docker logs taxi-auth --tail 50 2>&1').toString();
    const emailLines = logs.split('\n').filter(l =>
      l.includes('[Mail]') || l.includes('SendGrid') || l.includes('OTP') ||
      l.includes('signup') || l.includes('Verification') || l.includes('reset')
    );
    if (emailLines.length > 0) {
      console.log('Email-related log lines:');
      emailLines.forEach(l => console.log('  ', l));
    } else {
      console.log('  No email log lines found — check docker logs taxi-auth manually');
    }
  } catch (e) {
    console.log('  Could not read docker logs:', e.message);
  }

  console.log('\n✅ Test run complete. Check the emails above for OTP codes.\n');
})();
