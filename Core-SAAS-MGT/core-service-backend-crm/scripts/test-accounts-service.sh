#!/usr/bin/env bash
set -uo pipefail

source "$(dirname "$0")/common.sh"

section "ACCOUNTS SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

log "Creating account..."
ACCOUNT_NUM=$(curl -s -X POST "$BASE/accounts" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"customerId":"root-admin","name":"Test Account","type":"SAVINGS","currency":"USD","kycTier":"TIER_3","tenantId":"root-admin"}' | grep -o '"accountNumber"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ -n "$ACCOUNT_NUM" ] && pass "POST /accounts (account: $ACCOUNT_NUM)" || fail "POST /accounts (no accountNumber)"

if [ -n "$ACCOUNT_NUM" ]; then
  log "Fetching account by accountNumber..."
  RESP=$(curl_http -X GET "$BASE/accounts/$ACCOUNT_NUM?tenantId=root-admin" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /accounts/:accountNumber" || fail "GET /accounts/:accountNumber (HTTP $RESP)"
fi

log "Fetching accounts by customerId..."
RESP=$(curl_http -X GET "$BASE/accounts/customer/root-admin?tenantId=root-admin" \
  -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /accounts/customer/:customerId" || fail "GET /accounts/customer/:customerId (HTTP $RESP)"

if [ -n "$ACCOUNT_NUM" ]; then
  log "Updating account status to ACTIVE..."
  RESP=$(curl_http -X PATCH "$BASE/accounts/$ACCOUNT_NUM/status" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{"status":"ACTIVE"}')
  [ "$RESP" = "200" ] && pass "PATCH /accounts/:accountNumber/status" || fail "PATCH /accounts/:accountNumber/status (HTTP $RESP)"

  log "Checking account restriction..."
  RESP=$(curl_http -X GET "$BASE/accounts/$ACCOUNT_NUM/check-restriction?tenantId=root-admin" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /accounts/:accountNumber/check-restriction" || fail "GET /accounts/:accountNumber/check-restriction (HTTP $RESP)"

  log "Checking KYC limits..."
  RESP=$(curl_http -X GET "$BASE/accounts/$ACCOUNT_NUM/check-kyc-limits?tenantId=root-admin" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /accounts/:accountNumber/check-kyc-limits" || fail "GET /accounts/:accountNumber/check-kyc-limits (HTTP $RESP)"

  log "Applying posting to account..."
  RESP=$(curl_http -X POST "$BASE/accounts/$ACCOUNT_NUM/postings/apply" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{"ledgerEntryId":"test-ledger-entry","reference":"Test posting","side":"CREDIT","amount":100,"tenantId":"root-admin"}')
  if [ "$RESP" = "200" ] || [ "$RESP" = "201" ]; then
    pass "POST /accounts/:accountNumber/postings/apply"
  else
    fail "POST /accounts/:accountNumber/postings/apply (HTTP $RESP)"
  fi

  log "Applying batch posting..."
  RESP=$(curl_http -X POST "$BASE/accounts/postings/apply-batch" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "[{\"accountNumber\":\"$ACCOUNT_NUM\",\"posting\":{\"ledgerEntryId\":\"test-batch-entry\",\"reference\":\"Batch posting\",\"side\":\"CREDIT\",\"amount\":50,\"tenantId\":\"root-admin\"}}]")
  if [ "$RESP" = "200" ] || [ "$RESP" = "201" ]; then
    pass "POST /accounts/postings/apply-batch"
  else
    fail "POST /accounts/postings/apply-batch (HTTP $RESP)"
  fi

  log "Fetching posting history..."
  RESP=$(curl_http -X GET "$BASE/accounts/$ACCOUNT_NUM/postings/history?tenantId=root-admin" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /accounts/:accountNumber/postings/history" || fail "GET /accounts/:accountNumber/postings/history (HTTP $RESP)"

  log "Reconciling account..."
  RESP=$(curl_http -X GET "$BASE/accounts/$ACCOUNT_NUM/reconcile?tenantId=root-admin" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /accounts/:accountNumber/reconcile" || fail "GET /accounts/:accountNumber/reconcile (HTTP $RESP)"
fi

summary "Accounts Service"
