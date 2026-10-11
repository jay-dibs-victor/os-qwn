#!/usr/bin/env bash
#===============================================================================
# Ledger Service — End-to-end curl tests
#===============================================================================
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

section "Ledger Service — Login"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

# Track created resources
GL_ACCOUNT_ID=""
GL_ACCOUNT_ID2=""
TXN_ID=""
TXN_REF=""
COMMISSION_RULE_ID=""

# ===========================================================================
# GL Accounts
# ===========================================================================
section "GL Accounts"

TS=$(date +%s)
log "POST /ledger/accounts"
GL_RESULT=$(curl_body -X POST "$BASE/ledger/accounts" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: root-admin" \
  -H "$AUTH_HEADER" \
  -d "{\"code\":\"TEST-${TS}\",\"name\":\"Test GL Account\",\"type\":\"asset\",\"tenantId\":\"root-admin\",\"currency\":\"USD\"}")
GL_BODY=$(echo "$GL_RESULT" | sed '$d')
GL_CODE=$(echo "$GL_RESULT" | tail -n1)
if [ "$GL_CODE" = "200" ] || [ "$GL_CODE" = "201" ]; then
  GL_ACCOUNT_ID=$(echo "$GL_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  pass "POST /ledger/accounts (HTTP $GL_CODE, id=$GL_ACCOUNT_ID)"
else
  fail "POST /ledger/accounts (HTTP $GL_CODE): $GL_BODY"
fi

log "POST /ledger/accounts (second GL account)"
GL2_RESULT=$(curl_body -X POST "$BASE/ledger/accounts" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: root-admin" \
  -H "$AUTH_HEADER" \
  -d "{\"code\":\"TEST2-${TS}\",\"name\":\"Test GL Account 2\",\"type\":\"liability\",\"tenantId\":\"root-admin\",\"currency\":\"USD\"}")
GL2_BODY=$(echo "$GL2_RESULT" | sed '$d')
GL2_CODE=$(echo "$GL2_RESULT" | tail -n1)
if [ "$GL2_CODE" = "200" ] || [ "$GL2_CODE" = "201" ]; then
  GL_ACCOUNT_ID2=$(echo "$GL2_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  pass "POST /ledger/accounts #2 (HTTP $GL2_CODE, id=$GL_ACCOUNT_ID2)"
else
  fail "POST /ledger/accounts #2 (HTTP $GL2_CODE): $GL2_BODY"
fi

log "GET /ledger/accounts?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/accounts?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/accounts (HTTP $CODE)" || fail "GET /ledger/accounts (HTTP $CODE)"

log "GET /ledger/accounts?tenantId=root-admin&pageNumber=1&pageSize=10"
CODE=$(curl_http "$BASE/ledger/accounts?tenantId=root-admin&pageNumber=1&pageSize=10" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/accounts?pageNumber=1&pageSize=10 (HTTP $CODE)" || fail "GET /ledger/accounts?pageNumber=1&pageSize=10 (HTTP $CODE)"

log "GET /ledger/accounts/tree?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/accounts/tree?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/accounts/tree (HTTP $CODE)" || fail "GET /ledger/accounts/tree (HTTP $CODE)"

log "GET /ledger/accounts/$GL_ACCOUNT_ID?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/accounts/$GL_ACCOUNT_ID?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/accounts/:id (HTTP $CODE)" || fail "GET /ledger/accounts/:id (HTTP $CODE)"

log "PATCH /ledger/accounts/$GL_ACCOUNT_ID?tenantId=root-admin"
CODE=$(curl_http -X PATCH "$BASE/ledger/accounts/$GL_ACCOUNT_ID?tenantId=root-admin" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"name":"Test GL Account Updated"}')
[ "$CODE" = "200" ] && pass "PATCH /ledger/accounts/:id (HTTP $CODE)" || fail "PATCH /ledger/accounts/:id (HTTP $CODE)"

# ===========================================================================
# Posting
# ===========================================================================
section "Posting"

log "POST /ledger/posting/transaction"
TXN_REF="txn-$(date +%s)"
TXN_RESULT=$(curl_body -X POST "$BASE/ledger/posting/transaction" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"reference\": \"$TXN_REF\",
    \"description\": \"Test balanced entry\",
    \"postingDate\": \"$(date +%Y-%m-%d)\",
    \"tenantId\": \"root-admin\",
    \"entries\": [
      {\"glAccountId\":\"$GL_ACCOUNT_ID\",\"amount\":1000.00,\"side\":\"DEBIT\"},
      {\"glAccountId\":\"$GL_ACCOUNT_ID2\",\"amount\":1000.00,\"side\":\"CREDIT\"}
    ]
  }")
TXN_BODY=$(echo "$TXN_RESULT" | sed '$d')
TXN_CODE=$(echo "$TXN_RESULT" | tail -n1)
if [ "$TXN_CODE" = "200" ] || [ "$TXN_CODE" = "201" ]; then
  TXN_ID=$(echo "$TXN_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  pass "POST /ledger/posting/transaction (HTTP $TXN_CODE, id=${TXN_ID:-none})"
else
  fail "POST /ledger/posting/transaction (HTTP $TXN_CODE): $TXN_BODY"
fi

if [ -n "$TXN_ID" ]; then
  log "GET /ledger/posting/transaction/$TXN_ID?tenantId=root-admin"
  CODE=$(curl_http "$BASE/ledger/posting/transaction/$TXN_ID?tenantId=root-admin" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] && pass "GET /ledger/posting/transaction/:id (HTTP $CODE)" || fail "GET /ledger/posting/transaction/:id (HTTP $CODE)"
fi

log "GET /ledger/posting/reference/:ref"
CODE=$(curl_http "$BASE/ledger/posting/reference/$TXN_REF?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/posting/reference/:ref (HTTP $CODE)" || fail "GET /ledger/posting/reference/:ref (HTTP $CODE)"

# ===========================================================================
# Audit Trail
# ===========================================================================
section "Audit Trail"

for path in \
  "/ledger/audit/trail?tenantId=root-admin" \
  "/ledger/audit/trial-balance?tenantId=root-admin" \
  "/ledger/audit/balance-sheet?tenantId=root-admin" \
  "/ledger/audit/profit-loss?tenantId=root-admin"; do
  label="${path%%\?*}"
  CODE=$(curl_http "$BASE$path" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] && pass "GET $label (HTTP $CODE)" || fail "GET $label (HTTP $CODE)"
done

if [ -n "$TXN_REF" ]; then
  log "GET /ledger/audit/trail/:reference"
  CODE=$(curl_http "$BASE/ledger/audit/trail/$TXN_REF?tenantId=root-admin" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] && pass "GET /ledger/audit/trail/:reference (HTTP $CODE)" || fail "GET /ledger/audit/trail/:reference (HTTP $CODE)"
fi

log "GET /ledger/audit/gl-impact/:journalId"
CODE=$(curl_http "$BASE/ledger/audit/gl-impact/$TXN_ID?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/audit/gl-impact/:journalId (HTTP $CODE)" || fail "GET /ledger/audit/gl-impact/:journalId (HTTP $CODE)"

# ===========================================================================
# Revenue
# ===========================================================================
section "Revenue"

log "GET /ledger/revenue/summary?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/revenue/summary?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/revenue/summary (HTTP $CODE)" || fail "GET /ledger/revenue/summary (HTTP $CODE)"

log "GET /ledger/revenue/trips?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/revenue/trips?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/revenue/trips (HTTP $CODE)" || fail "GET /ledger/revenue/trips (HTTP $CODE)"

# ===========================================================================
# Commissions
# ===========================================================================
section "Commissions"

log "GET /ledger/commissions/rules?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/commissions/rules?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/commissions/rules (HTTP $CODE)" || fail "GET /ledger/commissions/rules (HTTP $CODE)"

log "POST /ledger/commissions/rules"
RULE_RESULT=$(curl_body -X POST "$BASE/ledger/commissions/rules" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"ruleType":"PLATFORM","calculationMethod":"PERCENTAGE","rate":0.10,"tenantId":"root-admin"}')
RULE_BODY=$(echo "$RULE_RESULT" | sed '$d')
RULE_CODE=$(echo "$RULE_RESULT" | tail -n1)
if [ "$RULE_CODE" = "200" ] || [ "$RULE_CODE" = "201" ]; then
  COMMISSION_RULE_ID=$(echo "$RULE_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  pass "POST /ledger/commissions/rules (HTTP $RULE_CODE, id=$COMMISSION_RULE_ID)"
else
  fail "POST /ledger/commissions/rules (HTTP $RULE_CODE): $RULE_BODY"
fi

# ===========================================================================
# Coin Rewards
# ===========================================================================
section "Coin Rewards"

log "GET /ledger/coin-reward/wallets"
CODE=$(curl_http "$BASE/ledger/coin-reward/wallets" -H "x-tenant-id: root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/coin-reward/wallets (HTTP $CODE)" || fail "GET /ledger/coin-reward/wallets (HTTP $CODE)"

# ===========================================================================
# Escrow
# ===========================================================================
section "Escrow"

log "GET /escrow/summary?tenantId=root-admin"
CODE=$(curl_http "$BASE/escrow/summary?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /escrow/summary (HTTP $CODE)" || fail "GET /escrow/summary (HTTP $CODE)"

log "GET /escrow/wallets?tenantId=root-admin"
CODE=$(curl_http "$BASE/escrow/wallets?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /escrow/wallets (HTTP $CODE)" || fail "GET /escrow/wallets (HTTP $CODE)"

# ===========================================================================
# Transactions (Generic)
# ===========================================================================
section "Transactions"

log "GET /ledger/transactions?tenantId=root-admin"
CODE=$(curl_http "$BASE/ledger/transactions?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /ledger/transactions (HTTP $CODE)" || fail "GET /ledger/transactions (HTTP $CODE)"

if [ -n "$TXN_ID" ]; then
  log "GET /ledger/transactions/$TXN_ID?tenantId=root-admin"
  CODE=$(curl_http "$BASE/ledger/transactions/$TXN_ID?tenantId=root-admin" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] && pass "GET /ledger/transactions/:id (HTTP $CODE)" || fail "GET /ledger/transactions/:id (HTTP $CODE)"
fi

if [ -n "$TXN_REF" ]; then
  log "GET /ledger/transactions/reference/:ref"
  CODE=$(curl_http "$BASE/ledger/transactions/reference/$TXN_REF?tenantId=root-admin" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] && pass "GET /ledger/transactions/reference/:ref (HTTP $CODE)" || fail "GET /ledger/transactions/reference/:ref (HTTP $CODE)"
fi

# ===========================================================================
# Fare & Remittance Config
# ===========================================================================
section "Fare & Remittance Config"

log "POST /site-wide-fare-config"
FARE_RESULT=$(curl_body -X POST "$BASE/site-wide-fare-config" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"key":"base-fare","value":"500","description":"Base fare per km"}')
FARE_BODY=$(echo "$FARE_RESULT" | sed '$d')
FARE_CODE=$(echo "$FARE_RESULT" | tail -n1)
if [ "$FARE_CODE" = "200" ] || [ "$FARE_CODE" = "201" ]; then
  pass "POST /site-wide-fare-config (HTTP $FARE_CODE)"
else
  fail "POST /site-wide-fare-config (HTTP $FARE_CODE): $FARE_BODY"
fi

log "GET /site-wide-fare-config"
CODE=$(curl_http "$BASE/site-wide-fare-config" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /site-wide-fare-config (HTTP $CODE)" || fail "GET /site-wide-fare-config (HTTP $CODE)"

log "GET /site-wide-fare-config/base-fare"
CODE=$(curl_http "$BASE/site-wide-fare-config/base-fare" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /site-wide-fare-config/:key (HTTP $CODE)" || fail "GET /site-wide-fare-config/:key (HTTP $CODE)"

log "GET /tenant-remittance-config?tenantId=root-admin"
CODE=$(curl_http "$BASE/tenant-remittance-config?tenantId=root-admin" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /tenant-remittance-config (HTTP $CODE)" || fail "GET /tenant-remittance-config (HTTP $CODE)"

log "GET /tenant-remittance-config/default"
CODE=$(curl_http "$BASE/tenant-remittance-config/default" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /tenant-remittance-config/default (HTTP $CODE)" || fail "GET /tenant-remittance-config/default (HTTP $CODE)"

log "POST /tenant-remittance-config"
REMITT_RESULT=$(curl_body -X POST "$BASE/tenant-remittance-config" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"driverCustomerId":"test-driver","tenantId":"root-admin","remittanceRate":0.8}')
REMITT_BODY=$(echo "$REMITT_RESULT" | sed '$d')
REMITT_CODE=$(echo "$REMITT_RESULT" | tail -n1)
if [ "$REMITT_CODE" = "200" ] || [ "$REMITT_CODE" = "201" ]; then
  pass "POST /tenant-remittance-config (HTTP $REMITT_CODE)"
else
  fail "POST /tenant-remittance-config (HTTP $REMITT_CODE): $REMITT_BODY"
fi

# ===========================================================================
# Summary
# ===========================================================================
summary "Ledger Service"
