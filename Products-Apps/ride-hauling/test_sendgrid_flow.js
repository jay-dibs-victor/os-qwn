#!/usr/bin/env node
/**
 * SendGrid Email Delivery Test
 * Tests if emails are actually being sent via SendGrid
 */

const BASE = 'http://localhost:12000/api/v1';
const PASSWORD = 'Queens2026';

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

function log(msg) { console.log(`  ${msg}`); }

(async () => {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  SendGrid Email Delivery Test                          ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const testEmail = `test_${Date.now()}@example.com`;
  const testData = {
    email: testEmail,
    password: PASSWORD,
    firstname: 'Test',
    lastname: 'User',
    username: `testuser${Date.now()}`.substring(0, 20),
    phoneNumber: '+2348012345678',
    user_type: 'Individual',
    roles: 'user',
    terms_and_cond: 'selected',
  };

  console.log('📧 Registering new user:', testEmail);
  const { status, json } = await req('POST', '/auth/signup', testData);

  console.log('Status:', status);
  if (status === 201 || status === 200) {
    log('✅ Signup successful');
    log('User should receive verification email');
  } else {
    log('❌ Signup failed:', json.error || json.message);
  }

  console.log('\n📋 Checking auth service logs for SendGrid activity...\n');
  const { execSync } = require('child_process');
  try {
    const logs = execSync('docker logs taxi-auth --tail 30 2>&1').toString();
    const lines = logs.split('\n');
    
    // Look for SendGrid or email sending indicators
    const emailLines = lines.filter(l => 
      l.includes('[Mail]') || 
      l.includes('SendGrid') || 
      l.includes('Delivered') ||
      l.includes('MockProvider') ||
      l.includes('would send')
    );

    if (emailLines.length > 0) {
      console.log('Email activity found:');
      emailLines.forEach(l => console.log('  ', l.trim()));
    } else {
      console.log('No email activity in logs');
      console.log('\nLast 10 log lines:');
      lines.slice(-10).forEach(l => {
        if (l.trim()) console.log('  ', l.trim());
      });
    }
  } catch (e) {
    console.log('Could not read docker logs:', e.message);
  }

  console.log('\n✅ Test complete\n');
})();
