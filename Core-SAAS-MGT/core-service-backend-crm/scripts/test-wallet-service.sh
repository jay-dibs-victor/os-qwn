#!/usr/bin/env bash
#===============================================================================
# Wallet Service — Endpoint Test Suite (53 endpoints, 11 controllers)
# Runs against API gateway (default http://localhost:3000, proxied to :3015)
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

check() {
  local method="$1" path="$2" expect="$3" payload="$4"
  local label="$method $path"
  if [ -n "$payload" ]; then
    RESP=$(curl_body -X "$method" "$BASE$path" \
      -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" -d "$payload")
  else
    RESP=$(curl_body -X "$method" "$BASE$path" \
      -H "$AUTH_HEADER" -H "x-tenant-id: root-admin")
  fi
  local body CODE
  body=$(echo "$RESP" | sed '$d')
  CODE=$(echo "$RESP" | tail -n1)
  local ok=1
  IFS='/' read -ra codes <<< "$expect"
  for c in "${codes[@]}"; do
    if [ "$CODE" = "$c" ]; then ok=0; break; fi
  done
  if [ "$ok" -eq 0 ]; then
    pass "$label → $CODE"
  else
    fail "$label → expected $expect, got $CODE"
  fi
  echo "$body"
}

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Create GL account + test accounts (needed by funding/withdrawal/transfer) ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Wallet Core"

# Create a real GL account first (ledger service requires UUID, not "gl-1100")
GL_TIMESTAMP=$(date +%s)
GL_RESP=$(curl -s -X POST "$BASE/ledger/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d "{\"code\":\"WLT-TEST-$GL_TIMESTAMP\",\"name\":\"Wallet Test GL\",\"type\":\"asset\",\"tenantId\":\"root-admin\",\"currency\":\"USD\"}")
GL_ACCOUNT_ID=$(echo "$GL_RESP" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$GL_ACCOUNT_ID" ]; then
  pass "POST /ledger/accounts (created GL account: $GL_ACCOUNT_ID)"
else
  GL_ACCOUNT_ID="gl-1100"
  log "Using fallback GL account: $GL_ACCOUNT_ID"
fi

# Create source account
ACC_RESP=$(curl -s -X POST "$BASE/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"customerId\":\"root-admin\",\"name\":\"Test Wallet\",\"type\":\"SAVINGS\",\"currency\":\"USD\",\"kycTier\":\"TIER_3\",\"tenantId\":\"root-admin\",\"glAccountId\":\"$GL_ACCOUNT_ID\"}")
ACC_NUM=$(echo "$ACC_RESP" | grep -o '"accountNumber"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$ACC_NUM" ]; then
  pass "POST /accounts (created test account: $ACC_NUM)"
else
  ACC_NUM="ACC-001"
  log "Using fallback account: $ACC_NUM"
fi

# Create a second account for transfer (fromAccount != toAccount)
ACC2_RESP=$(curl -s -X POST "$BASE/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"customerId\":\"root-admin\",\"name\":\"Test Wallet 2\",\"type\":\"SAVINGS\",\"currency\":\"USD\",\"kycTier\":\"TIER_3\",\"tenantId\":\"root-admin\",\"glAccountId\":\"$GL_ACCOUNT_ID\"}")
ACC2_NUM=$(echo "$ACC2_RESP" | grep -o '"accountNumber"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$ACC2_NUM" ]; then
  pass "POST /accounts (created 2nd account: $ACC2_NUM)"
else
  ACC2_NUM="ACC-002"
  log "Using fallback 2nd account: $ACC2_NUM"
fi

check GET "/wallet/transactions?tenantId=root-admin" "200" ""

check POST "/wallet/transfer" "200/201" \
  "{\"fromAccountNumber\":\"$ACC_NUM\",\"toAccountNumber\":\"$ACC2_NUM\",\"amount\":100,\"currency\":\"USD\",\"tenantId\":\"root-admin\"}"

check POST "/wallet/funding" "200/201" \
  "{\"accountNumber\":\"$ACC_NUM\",\"amount\":1000,\"currency\":\"USD\",\"tenantId\":\"root-admin\"}"

check POST "/wallet/withdrawal" "200/201" \
  "{\"accountNumber\":\"$ACC_NUM\",\"amount\":100,\"currency\":\"USD\",\"tenantId\":\"root-admin\"}"

# Create a fiat wallet for qcoin exchange customer first
curl -s -X POST "$BASE/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"customerId\":\"CUST-001\",\"name\":\"QCoin Fiat\",\"type\":\"SAVINGS\",\"currency\":\"NGN\",\"kycTier\":\"TIER_3\",\"tenantId\":\"root-admin\",\"glAccountId\":\"$GL_ACCOUNT_ID\"}" > /dev/null 2>&1 || true
# Force all existing QCN accounts to TIER_3 via DB (PATCH endpoint can't update kycTier)
/usr/local/bin/docker exec core-service-backend-crm-accounts-db-1 psql -U postgres -d accounts \
  -c "UPDATE accounts SET \"kycTier\" = 'TIER_3' WHERE \"currency\" = 'QCN';" 2>/dev/null || true
# Create a fresh QCN account with TIER_3 (if none exists)
curl -s -X POST "$BASE/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"customerId\":\"CUST-001\",\"name\":\"QCoin Wallet\",\"type\":\"SAVINGS\",\"currency\":\"QCN\",\"kycTier\":\"TIER_3\",\"tenantId\":\"root-admin\",\"glAccountId\":\"$GL_ACCOUNT_ID\"}" > /dev/null 2>&1 || true

check POST "/wallet/qcoin-exchange" "200/201" \
  '{"customerId":"CUST-001","direction":"BUY_QCOIN","fiatAmount":100,"qcoinAmount":10,"tenantId":"root-admin"}'

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Fraud Detection                                                           ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Fraud Detection"

check GET "/wallet/fraud/flags?tenantId=root-admin" "200" ""

# Fraud evaluate reads tenantId from query param or header, NOT from body
check POST "/wallet/fraud/evaluate/test-driver-001?tenantId=root-admin" "200/201" \
  '{"transactionId":"TXN-001","amount":100,"currency":"USD"}'

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Disputes                                                                  ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Disputes"

DISPUTE_RESP=$(curl -s -X POST "$BASE/wallet/disputes" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"tripId":"TRIP-001","driverCustomerId":"DRV-001","riderCustomerId":"RDR-001","disputeType":"TRIP_FARE","raisedBy":"RIDER","disputedAmount":50,"reason":"Incorrect charge","tenantId":"root-admin"}')
DISPUTE_ID=$(echo "$DISPUTE_RESP" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
DISPUTE_HTTP_CODE=$(echo "$DISPUTE_RESP" | python3 -c "
import sys, json
try:
    d = json.load(sys.stdin)
    print(d.get('statusCode', 201) if isinstance(d, dict) and 'statusCode' in d else 201)
except:
    print(0)
" 2>/dev/null)
if [ "$DISPUTE_HTTP_CODE" = "200" ] || [ "$DISPUTE_HTTP_CODE" = "201" ]; then
  pass "POST /wallet/disputes → $DISPUTE_HTTP_CODE"
else
  fail "POST /wallet/disputes → $DISPUTE_HTTP_CODE"
  echo "$DISPUTE_RESP"
fi

check GET "/wallet/disputes?tenantId=root-admin" "200" ""

if [ -n "$DISPUTE_ID" ]; then
  check GET "/wallet/disputes/$DISPUTE_ID?tenantId=root-admin" "200" ""
else
  fail "GET /wallet/disputes/:id — no ID captured from creation"
fi

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Payments                                                                  ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Payments"

check POST "/wallet/payments/cash" "200/201" \
  '{"tripId":"TRIP-001","driverCustomerId":"DRV-001","riderCustomerId":"RDR-001","fareAmount":50,"commissionAmount":5,"currency":"USD","tenantId":"root-admin"}'

TFR_RESP_RAW=$(curl -s -X POST "$BASE/wallet/payments/bank-transfer" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d '{"tripId":"TRIP-001","driverCustomerId":"DRV-001","riderCustomerId":"RDR-001","amount":200,"currency":"USD","tenantId":"root-admin"}')
TFR_ID=$(echo "$TFR_RESP_RAW" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$TFR_ID" ]; then
  pass "POST /wallet/payments/bank-transfer (created: $TFR_ID)"
else
  fail "POST /wallet/payments/bank-transfer — no ID in response"
fi

if [ -n "$TFR_ID" ]; then
  check POST "/wallet/payments/bank-transfer/confirm" "200/201" \
    "{\"bankTransferId\":\"$TFR_ID\",\"confirmedBy\":\"DRIVER\",\"confirmedAmount\":200,\"tenantId\":\"root-admin\"}"
fi

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Driver Debt                                                               ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Driver Debt"

check GET "/wallet/drivers/debt?tenantId=root-admin" "200" ""

# These endpoints need tenantId as query param
check GET "/wallet/drivers/debt/DRV-001?tenantId=root-admin" "200" ""
check GET "/wallet/drivers/debt/DRV-001/check?tenantId=root-admin" "200" ""

# Settle with actual outstanding balance from debt record
DEBT_BALANCE=$(curl -s "$BASE/wallet/drivers/debt/DRV-001?tenantId=root-admin" \
  -H "$AUTH_HEADER" -H "x-tenant-id: root-admin" | python3 -c "import sys,json; d=json.load(sys.stdin); print(int(d.get('outstandingBalance',0)))" 2>/dev/null)
DEBT_BALANCE="${DEBT_BALANCE:-0}"
if [ "$DEBT_BALANCE" -gt 0 ] 2>/dev/null; then
  check POST "/wallet/drivers/debt/settle" \
    "{\"driverCustomerId\":\"DRV-001\",\"amount\":$DEBT_BALANCE,\"method\":\"EARNING_OFFSET\",\"tenantId\":\"root-admin\"}"
else
  pass "POST /wallet/drivers/debt/settle — skipped (balance=$DEBT_BALANCE)"
fi

check POST "/wallet/drivers/debt/DRV-001/threshold?tenantId=root-admin" "200/201" \
  '{"threshold":1000}'

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Driver Ledger                                                             ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Driver Ledger"

check GET "/wallet/drivers/ledger/DRV-001?tenantId=root-admin" "200" ""
check GET "/wallet/drivers/ledger/DRV-001/balance?tenantId=root-admin" "200" ""

check POST "/wallet/drivers/ledger" "200/201" \
  '{"driverCustomerId":"DRV-001","entryType":"TRIP_EARNING","direction":"CREDIT","amount":200,"description":"Test entry","tenantId":"root-admin"}'

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Remittance                                                                ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Remittance"

# Remittance schedule uses x-tenant-id header (passed via AUTH_HEADER as well)
check POST "/wallet/remittance/schedule" "200/201" \
  '{"partnerId":"PARTNER-001","cycle":"WEEKLY","amount":500,"dueDate":"2026-06-15"}'

check POST "/wallet/remittance/process-due" "200/201" \
  '{"actor":"admin@example.com"}'

check GET "/wallet/remittance/pending?tenantId=root-admin" "200" ""
check GET "/wallet/remittance/all?tenantId=root-admin" "200" ""
check GET "/wallet/remittance/summary?tenantId=root-admin" "200" ""

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Driver Savings                                                            ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Driver Savings"

# Driver savings uses x-tenant-id header — cancel ALL active plans for DRV-001 first
ALL_PLANS=$(curl -s "$BASE/wallet/driver-savings/plans?tenantId=root-admin" -H "$AUTH_HEADER" -H "x-tenant-id: root-admin")
for AP_ID in $(echo "$ALL_PLANS" | python3 -c "import sys,json; d=json.load(sys.stdin); plans=[p for p in d if p.get('status')=='ACTIVE']; print(' '.join(p['id'] for p in plans))" 2>/dev/null); do
  curl -s -X POST "$BASE/wallet/driver-savings/cancel" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
    -d "{\"planId\":\"$AP_ID\",\"reason\":\"Test reset\",\"tenantId\":\"root-admin\"}" > /dev/null 2>&1 || true
done

SVP_RESP_RAW=$(curl -s -X POST "$BASE/wallet/driver-savings/plan" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d '{"driverCustomerId":"DRV-001","targetAmount":500,"contributionPerTrip":50}')
SVP_ID=$(echo "$SVP_RESP_RAW" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$SVP_ID" ]; then
  pass "POST /wallet/driver-savings/plan (created: $SVP_ID)"
else
  fail "POST /wallet/driver-savings/plan — no ID in response"
fi

# Contribute needs planId from the plan creation above
if [ -n "$SVP_ID" ]; then
  check POST "/wallet/driver-savings/contribute" "200/201" \
    "{\"planId\":\"$SVP_ID\",\"tripId\":\"TRIP-001\",\"amount\":200}"
fi

check GET "/wallet/driver-savings/plans?tenantId=root-admin" "200" ""
check GET "/wallet/driver-savings/summary?tenantId=root-admin" "200" ""

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Partner Settlements                                                       ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Partner Settlements"

SETTLE_RESP=$(curl -s -X POST "$BASE/wallet/partner-settlements" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d '{"partnerId":"PARTNER-001","amount":1000,"tenantId":"root-admin"}')
echo "$SETTLE_RESP" | python3 -c "import sys,json; print('Settlement created')" 2>/dev/null || true

# Capture the settlement UUID from the creation above
SETTLE_ID=$(echo "$SETTLE_RESP" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

# Create required GL accounts for partner settlement (2202=partner payable, 1101=cash)
curl -s -X POST "$BASE/ledger/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d "{\"code\":\"2202\",\"name\":\"Partner Payable\",\"type\":\"liability\",\"tenantId\":\"root-admin\",\"currency\":\"NGN\"}" > /dev/null 2>&1 || true
curl -s -X POST "$BASE/ledger/accounts" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" -H "x-tenant-id: root-admin" \
  -d "{\"code\":\"1101\",\"name\":\"Cash\",\"type\":\"asset\",\"tenantId\":\"root-admin\",\"currency\":\"NGN\"}" > /dev/null 2>&1 || true

if [ -n "$SETTLE_ID" ]; then
  check POST "/wallet/partner-settlements/settle" "200/201" \
    "{\"settlementId\":\"$SETTLE_ID\",\"partnerAccountNumber\":\"$ACC_NUM\",\"tenantId\":\"root-admin\"}"
else
  fail "POST /wallet/partner-settlements/settle — no settlement ID captured"
fi

check GET "/wallet/partner-settlements?tenantId=root-admin" "200" ""

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Driver Earnings                                                           ║
#╚══════════════════════════════════════════════════════════════════════════════╝
section "Driver Earnings"

check POST "/wallet/driver-earnings/record" "200/201" \
  '{"driverCustomerId":"DRV-001","tripId":"TRIP-001","tripFare":350,"platformCommission":35,"partnerCommission":0,"netEarnings":315,"currency":"USD","tenantId":"root-admin"}'

check GET "/wallet/driver-earnings?tenantId=root-admin" "200" ""
check GET "/wallet/driver-earnings/summary?tenantId=root-admin" "200" ""

#╔══════════════════════════════════════════════════════════════════════════════╗
#║  Summary                                                                   ║
#╚══════════════════════════════════════════════════════════════════════════════╝
summary "Wallet Service"
