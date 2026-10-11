#!/usr/bin/env node
/**
 * COMPREHENSIVE END-TO-END FINANCIAL FLOW SEED
 * =============================================
 * Simulates the complete business lifecycle:
 *   Trip Payment → Commission Split → Revenue Recording → Driver Earnings →
 *   Partner Settlement → Escrow → Savings → Remittance Config →
 *   Site-Wide Fare Config → Remittance Schedules → Scheduler Workers →
 *   QUEENS COIN REWARDS → Audit Trail → GL Reports
 *
 * Run: node seed-full-financial-flow.js
 * Requires: BASE_URL env or defaults to http://localhost:3000
 */

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const TENANT_ID = 'seed-tenant-001'
const DRIVER_ID = 'seed-driver-001'
const PARTNER_ID = 'seed-partner-001'
const RIDER_ID = 'seed-rider-001'
const RIDER_EMAIL = 'rider@test.com'
const TRIP_ID = 'seed-trip-001'

async function req(method, path, data) {
  const url = `${BASE}${path}`
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'x-tenant-id': TENANT_ID },
  }
  if (data) opts.body = JSON.stringify(data)
  const res = await fetch(url, opts)
  const body = res.status === 204 ? {} : await res.json().catch(() => ({}))
  const ok = res.ok || res.status === 201
  console.log(`  [${ok ? '✓' : '✗'}] ${method} ${path}`)
  if (!ok) console.error(`       FAILED (${res.status}): ${JSON.stringify(body).slice(0, 200)}`)
  return { ok, status: res.status, data: body }
}

async function main() {
  const passed = []
  const failed = []
  let step = 0
  function log(description) {
    step++
    console.log(`\n${'═'.repeat(60)}`)
    console.log(`  STEP ${step}: ${description}`)
    console.log(`${'═'.repeat(60)}`)
  }
  function check(name, result) {
    if (result.ok) passed.push(name)
    else failed.push(name)
  }

  // ===================================================================
  // 1. SITE-WIDE FARE CONFIG (ledger-service)
  // ===================================================================
  log('Site-Wide Fare Config — seed defaults + CRUD')

  let r = await req('POST', '/ledger/site-wide-fare-config/seed')
  check('Seed fare defaults', r)

  r = await req('POST', '/ledger/site-wide-fare-config', {
    configKey: 'INDIVIDUAL_DRIVER_COMMISSION_RATE',
    configValue: '10',
    description: 'Default commission rate for individual stand-alone drivers',
    dataType: 'number',
  })
  check('Upsert fare config', r)

  r = await req('GET', `/ledger/site-wide-fare-config/INDIVIDUAL_DRIVER_COMMISSION_RATE`)
  check('Get fare config by key', r)

  r = await req('GET', '/ledger/site-wide-fare-config')
  check('List all fare configs', r)

  // ===================================================================
  // 2. TENANT REMITTANCE CONFIG (ledger-service)
  // ===================================================================
  log('Tenant Driver Remittance Config — CRUD + driver lookup')

  r = await req('POST', '/ledger/tenant-remittance-config', {
    tenantId: TENANT_ID,
    remittanceCycle: 'WEEKLY',
    remittanceType: 'PERCENTAGE_OF_FARE',
    remittanceValue: 15,
    commissionRate: 5,
    dayOfWeek: 1,
    isActive: true,
  })
  check('Create tenant default remittance config', r)
  const defaultConfigId = r.data?.id

  r = await req('POST', '/ledger/tenant-remittance-config', {
    tenantId: TENANT_ID,
    driverCustomerId: DRIVER_ID,
    remittanceCycle: 'DAILY',
    remittanceType: 'FIXED_AMOUNT',
    remittanceValue: 2000,
    commissionRate: 10,
    isActive: true,
  })
  check('Create per-driver remittance config', r)

  r = await req('GET', `/ledger/tenant-remittance-config/driver/${DRIVER_ID}?tenantId=${TENANT_ID}`)
  check('Get driver-specific remittance config', r)

  r = await req('GET', `/ledger/tenant-remittance-config/default?tenantId=${TENANT_ID}`)
  check('Get default remittance config', r)

  r = await req('GET', `/ledger/tenant-remittance-config?tenantId=${TENANT_ID}`)
  check('List all tenant remittance configs', r)

  r = await req('GET', `/ledger/tenant-remittance-config/due?tenantId=${TENANT_ID}`)
  check('Get due remittance configs', r)

  // ===================================================================
  // 3. GL ACCOUNTS (ledger-service)
  // ===================================================================
  log('GL Accounts — list + tree')

  r = await req('GET', `/ledger/accounts?tenantId=${TENANT_ID}`)
  check('List GL accounts', r)

  r = await req('GET', '/ledger/accounts/tree')
  check('Get GL accounts tree', r)

  // ===================================================================
  // 4. COMMISSION RULES (ledger-service)
  // ===================================================================
  log('Commission Rules — CRUD + calculate')

  r = await req('POST', '/ledger/commissions/rules', {
    tenantId: TENANT_ID,
    name: 'Standard Platform Commission',
    ruleType: 'PLATFORM',
    calculationMethod: 'PERCENTAGE',
    rate: 10,
    isActive: true,
  })
  check('Create commission rule', r)
  const ruleId = r.data?.id

  r = await req('POST', '/ledger/commissions/rules', {
    tenantId: TENANT_ID,
    name: 'Partner Referral Commission',
    ruleType: 'PARTNER',
    calculationMethod: 'PERCENTAGE',
    rate: 5,
    isActive: true,
  })
  check('Create partner commission rule', r)

  r = await req('GET', `/ledger/commissions/rules?tenantId=${TENANT_ID}`)
  check('List commission rules', r)

  r = await req('POST', '/ledger/commissions/calculate', {
    tenantId: TENANT_ID,
    totalFare: 5000,
    driverType: 'INDIVIDUAL',
    partnerTenantId: PARTNER_ID,
  })
  check('Calculate commission', r)

  if (ruleId) {
    r = await req('PATCH', `/ledger/commissions/rules/${ruleId}`, { rate: 12 })
    check('Update commission rule', r)

    r = await req('DELETE', `/ledger/commissions/rules/${ruleId}`)
    check('Delete commission rule', r)

    // Re-create for rest of flow
    r = await req('POST', '/ledger/commissions/rules', {
      tenantId: TENANT_ID,
      name: 'Standard Platform Commission',
      ruleType: 'PLATFORM',
      calculationMethod: 'PERCENTAGE',
      rate: 10,
      isActive: true,
    })
    check('Re-create commission rule for flow', r)
  }

  // ===================================================================
  // 5. TRIP PAYMENT FLOW (payment-service)
  // ===================================================================
  log('Trip Payment — Initiate → Verify → Complete')

  r = await req('POST', '/payments/trip/initiate', {
    tenantId: TENANT_ID,
    tripId: TRIP_ID,
    riderCustomerId: RIDER_ID,
    riderEmail: RIDER_EMAIL,
    fareAmount: 5000,
    driverCustomerId: DRIVER_ID,
    driverType: 'INDIVIDUAL',
    partnerTenantId: PARTNER_ID,
    platformCommissionRate: 0.10,
    partnerCommissionRate: 0.05,
  })
  check('Initiate trip payment', r)
  const paystackRef = r.data?.paymentReference || 'paystack_ref_001'

  r = await req('POST', '/payments/trip/verify', {
    tenantId: TENANT_ID,
    tripId: TRIP_ID,
    paystackReference: paystackRef,
  })
  check('Verify trip payment', r)

  r = await req('POST', `/payments/trip/${TRIP_ID}/complete`, {
    tenantId: TENANT_ID,
    paystackReference: paystackRef,
    driverCustomerId: DRIVER_ID,
    partnerId: PARTNER_ID,
  })
  check('Complete trip payment', r)

  r = await req('GET', `/payments/trip/calculate-commission?totalFare=5000&platformRate=0.10&partnerRate=0.05&isCorporate=false`)
  check('Calculate commission preview', r)

  r = await req('GET', `/payments/trip/${paystackRef}`)
  check('Get trip payment by reference', r)

  r = await req('GET', `/payments/trip/trip/${TRIP_ID}`)
  check('Get trip payments by tripId', r)

  // ===================================================================
  // 6. REVENUE RECORDING (ledger-service)
  // ===================================================================
  log('Revenue Recording — record trip revenue + list + summary')

  r = await req('POST', '/ledger/revenue/trip', {
    tenantId: TENANT_ID,
    tripId: TRIP_ID,
    driverCustomerId: DRIVER_ID,
    partnerTenantId: PARTNER_ID,
    totalFare: 5000,
    platformCommission: 500,
    partnerCommission: 250,
    driverPayout: 4250,
    currency: 'NGN',
  })
  check('Record trip revenue', r)

  r = await req('GET', `/ledger/revenue/trip/${TRIP_ID}?tenantId=${TENANT_ID}`)
  check('Get trip financial record', r)

  r = await req('GET', `/ledger/revenue/trips?tenantId=${TENANT_ID}&page=0&pageSize=20`)
  check('List trip financial records', r)

  r = await req('GET', `/ledger/revenue/summary?tenantId=${TENANT_ID}`)
  check('Get revenue summary', r)

  // ===================================================================
  // 7. DRIVER EARNINGS (wallet-service)
  // ===================================================================
  log('Driver Earnings — record + list + summary')

  r = await req('POST', '/driver-earnings/record', {
    tenantId: TENANT_ID,
    driverCustomerId: DRIVER_ID,
    tripId: TRIP_ID,
    tripFare: 5000,
    platformCommission: 500,
    partnerCommission: 250,
    netEarnings: 4250,
    bonusAmount: 0,
    penaltyAmount: 0,
    currency: 'NGN',
  })
  check('Record driver earning', r)
  const earningId = r.data?.id

  r = await req('GET', `/driver-earnings/driver/${DRIVER_ID}?tenantId=${TENANT_ID}`)
  check('Get driver earnings by driver', r)

  r = await req('GET', `/driver-earnings?tenantId=${TENANT_ID}&page=1&pageSize=20`)
  check('List all driver earnings', r)

  r = await req('GET', `/driver-earnings/summary?tenantId=${TENANT_ID}&driverCustomerId=${DRIVER_ID}`)
  check('Get driver earnings summary', r)

  // Payout the earning
  if (earningId) {
    r = await req('POST', `/driver-earnings/${earningId}/payout`, {
      tenantId: TENANT_ID,
      driverAccountNumber: '0123456789',
    })
    check('Payout driver earning by ID', r)
  }

  r = await req('GET', `/driver-earnings?tenantId=${TENANT_ID}`)
  check('List driver earnings after payout', r)

  // ===================================================================
  // 8. PARTNER SETTLEMENTS (wallet-service)
  // ===================================================================
  log('Partner Settlements — accrue + settle + balance')

  r = await req('POST', '/partner-settlements', {
    tenantId: TENANT_ID,
    partnerId: PARTNER_ID,
    amount: 5000,
    reference: `partner-accrue-${TRIP_ID}`,
    description: 'Commission accrual for trip',
  })
  check('Create/accrue partner settlement', r)
  const settlementId = r.data?.id

  r = await req('POST', '/partner-settlements/settle', {
    tenantId: TENANT_ID,
    settlementId,
    amount: 2500,
    reference: `settle-${Date.now()}`,
  })
  check('Settle partner payout', r)

  r = await req('GET', `/partner-settlements/partner/${PARTNER_ID}/balance?tenantId=${TENANT_ID}`)
  check('Get partner balance', r)

  r = await req('GET', `/partner-settlements?tenantId=${TENANT_ID}`)
  check('List partner settlements', r)

  // ===================================================================
  // 9. ESCROW (ledger-service)
  // ===================================================================
  log('Escrow — create wallet + lock + release + admin override')

  r = await req('POST', '/ledger/escrow/wallet', {
    tenantId: TENANT_ID,
    partnerId: PARTNER_ID,
    initialBalance: 10000,
    currency: 'NGN',
  })
  check('Create escrow wallet', r)

  r = await req('POST', '/ledger/escrow/lock', {
    tenantId: TENANT_ID,
    partnerId: PARTNER_ID,
    amount: 5000,
    reason: 'Trip payment hold',
    reference: `lock-${Date.now()}`,
  })
  check('Lock escrow funds', r)

  r = await req('POST', '/ledger/escrow/release', {
    tenantId: TENANT_ID,
    partnerId: PARTNER_ID,
    amount: 2000,
    reference: `release-${Date.now()}`,
  })
  check('Release escrow funds', r)

  r = await req('POST', '/ledger/escrow/admin-override', {
    tenantId: TENANT_ID,
    partnerId: PARTNER_ID,
    amount: 3000,
    reason: 'Admin force release',
    actor: 'seed-admin',
    reference: `override-${Date.now()}`,
  })
  check('Admin override escrow', r)

  r = await req('GET', `/ledger/escrow/wallets?tenantId=${TENANT_ID}`)
  check('List escrow wallets', r)

  r = await req('GET', `/ledger/escrow/wallet/${PARTNER_ID}?tenantId=${TENANT_ID}`)
  check('Get escrow wallet by partner', r)

  r = await req('GET', `/ledger/escrow/summary?tenantId=${TENANT_ID}`)
  check('Get escrow summary', r)

  // ===================================================================
  // 10. SAVINGS PLANS (wallet-service)
  // ===================================================================
  log('Savings Plans — create + contribute + early withdrawal + cancel')

  r = await req('POST', '/driver-savings/plan', {
    driverCustomerId: DRIVER_ID,
    targetAmount: 100000,
    contributionPerTrip: 500,
    earlyWithdrawalPenaltyPercent: 5,
    targetDate: new Date(Date.now() + 365 * 86400000).toISOString(),
  })
  check('Create savings plan', r)
  const planId = r.data?.id

  r = await req('POST', '/driver-savings/contribute', {
    planId,
    tripId: TRIP_ID,
    amount: 500,
  })
  check('Contribute to savings', r)

  r = await req('POST', '/driver-savings/contribute', {
    planId,
    tripId: `${TRIP_ID}-2`,
    amount: 500,
  })
  check('Contribute again to savings', r)

  r = await req('GET', `/driver-savings/plans`)
  check('List savings plans', r)

  r = await req('GET', `/driver-savings/summary`)
  check('Get savings summary', r)

  if (planId) {
    r = await req('POST', '/driver-savings/early-withdrawal', {
      planId,
      amount: 200,
      reason: 'Emergency',
    })
    check('Early withdrawal from savings', r)

    r = await req('POST', '/driver-savings/cancel', {
      planId,
      reason: 'Testing complete',
    })
    check('Cancel savings plan', r)
  }

  // ===================================================================
  // 11. REMITTANCE SCHEDULES (wallet-service)
  // ===================================================================
  log('Remittance Schedules — create + process + admin override')

  r = await req('POST', '/remittance/schedule', {
    partnerId: PARTNER_ID,
    cycle: 'WEEKLY',
    amount: 15000,
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
  })
  check('Create remittance schedule', r)
  const scheduleId = r.data?.id

  if (scheduleId) {
    r = await req('POST', `/remittance/${scheduleId}/process`, { actor: 'seed-bot' })
    check('Process remittance schedule by ID', r)
  }

  r = await req('POST', '/remittance/process-due', { actor: 'seed-bot' })
  check('Process due remittances', r)

  const overdueScheduleId = scheduleId // reuse if available
  if (overdueScheduleId) {
    r = await req('POST', '/remittance/admin-override', {
      scheduleId: overdueScheduleId,
      reason: 'Admin override for seed test',
      actor: 'seed-admin',
      releaseAmount: 5000,
    })
    check('Admin override remittance', r)
  }

  r = await req('GET', '/remittance/pending')
  check('List pending remittances', r)

  r = await req('GET', '/remittance/all')
  check('List all remittances', r)

  r = await req('GET', '/remittance/summary')
  check('Get remittance summary', r)

  // ===================================================================
  // 12. SCHEDULER WORKERS (wallet-service)
  // ===================================================================
  log('Scheduler Workers — trigger overdue remittances + savings disbursement')

  r = await req('POST', '/scheduler/remittance/process-overdue', {})
  check('Process overdue remittances', r)

  r = await req('POST', '/scheduler/savings/disburse-mature', {})
  check('Disburse mature savings', r)

  r = await req('POST', '/scheduler/savings/disburse-weekly', {})
  check('Disburse weekly savings', r)

  r = await req('POST', '/scheduler/savings/disburse-monthly', {})
  check('Disburse monthly savings', r)

  // ===================================================================
  // 13. QUEENS COIN REWARDS (ledger-service)
  // ===================================================================
  log('Coin Rewards — verify trip reward distribution')

  // Verify coins were awarded during trip completion (step 5)
  r = await req('GET', `/ledger/coin-reward/balance/RIDER/${RIDER_ID}`)
  check('Get rider coin balance', r)

  r = await req('GET', `/ledger/coin-reward/balance/DRIVER/${DRIVER_ID}`)
  check('Get driver coin balance', r)

  r = await req('GET', `/ledger/coin-reward/balance/TENANT/${TENANT_ID}`)
  check('Get tenant coin balance', r)

  // Direct award test (idempotent - same tripId reference won't create duplicate credits)
  r = await req('POST', '/ledger/coin-reward/award-trip', {
    tripId: `${TRIP_ID}-coin-test`,
    tenantId: TENANT_ID,
    riderCustomerId: RIDER_ID,
    driverCustomerId: DRIVER_ID,
  })
  check('Award trip coins directly', r)
  const coinAward = r.data
  if (coinAward) {
    console.log(`       Rider: ₿${coinAward.riderCoins}, Driver: ₿${coinAward.driverCoins}, Tenant: ₿${coinAward.tenantCoins}`)
  }

  // View wallets
  r = await req('GET', `/ledger/coin-reward/wallet/RIDER/${RIDER_ID}`)
  check('Get rider coin wallet', r)
  const riderWallet = r.data
  if (riderWallet?.exists !== false) {
    const walletId = riderWallet?.id
    if (walletId) {
      r = await req('GET', `/ledger/coin-reward/transactions/${walletId}?page=0&pageSize=20`)
      check('List rider coin transactions', r)
    }
  }

  r = await req('GET', `/ledger/coin-reward/wallet/DRIVER/${DRIVER_ID}`)
  check('Get driver coin wallet', r)

  r = await req('GET', `/ledger/coin-reward/wallet/TENANT/${TENANT_ID}`)
  check('Get tenant coin wallet', r)

  r = await req('GET', '/ledger/coin-reward/wallets')
  check('List all coin wallets', r)

  // ===================================================================
  // 14. AUDIT TRAIL & GL IMPACT (ledger-service)
  // ===================================================================
  log('Audit Trail & GL Impact — trail + reference + GL impact')

  r = await req('GET', `/ledger/audit/trail?tenantId=${TENANT_ID}&page=0&pageSize=20`)
  check('List audit trail', r)

  r = await req('GET', `/ledger/audit/trail/${TRIP_ID}?tenantId=${TENANT_ID}`)
  check('Get audit trail by reference', r)

  // GL impact for any journal entries we have
  if (r.data && Array.isArray(r.data)) {
    const journal = r.data[0]
    if (journal?.id) {
      r = await req('GET', `/ledger/audit/gl-impact/${journal.id}?tenantId=${TENANT_ID}`)
      check('Get GL impact by journal ID', r)
    }
  }

  // ===================================================================
  // 15. FINANCIAL REPORTS (ledger-service)
  // ===================================================================
  log('Financial Reports — balance sheet + P&L + trial balance')

  r = await req('GET', `/ledger/audit/balance-sheet?tenantId=${TENANT_ID}`)
  check('Get balance sheet', r)

  r = await req('GET', `/ledger/audit/profit-loss?tenantId=${TENANT_ID}`)
  check('Get profit & loss', r)

  r = await req('GET', `/ledger/audit/trial-balance?tenantId=${TENANT_ID}`)
  check('Get trial balance', r)

  // ===================================================================
  // 16. DELETE REMITTANCE CONFIG (cleanup)
  // ===================================================================
  log('Cleanup — delete remittance config')

  if (defaultConfigId) {
    r = await req('DELETE', `/ledger/tenant-remittance-config/${defaultConfigId}`)
    check('Delete remittance config', r)
  }

  // Clean up fare config
  r = await req('DELETE', `/ledger/site-wide-fare-config/INDIVIDUAL_DRIVER_COMMISSION_RATE`)
  check('Delete fare config', r)

  // ===================================================================
  // SUMMARY
  // ===================================================================
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`  SEED COMPLETE — ${passed.length} passed, ${failed.length} failed, ${passed.length + failed.length} total`)
  console.log(`${'═'.repeat(60)}`)
  if (failed.length) {
    console.log(`\n  FAILED (${failed.length}):`)
    failed.forEach(f => console.log(`    ✗ ${f}`))
    process.exit(1)
  } else {
    console.log(`\n  ✓ ALL ENDPOINTS PASSED`)
  }
}

main().catch(err => {
  console.error('SEED FAILED:', err)
  process.exit(1)
})
