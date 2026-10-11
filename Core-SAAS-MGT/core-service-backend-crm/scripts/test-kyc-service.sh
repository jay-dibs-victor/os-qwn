#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "KYC SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

KYC_ID=""
TENANT="root-admin"

log "Creating KYC record..."
RESP=$(curl -s -o /tmp/kyc_record.json -w "%{http_code}" -X POST "$BASE/kyc" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"customerId\": \"00000000-0000-0000-0000-000000000001\",
    \"tenantId\": \"$TENANT\"
  }")
KYC_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/kyc_record.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /kyc (HTTP $RESP) kycId=$KYC_ID" || fail "POST /kyc (HTTP $RESP)"

if [ -n "$KYC_ID" ]; then
  log "Verifying KYC identity with BVN/NIN..."
  RESP=$(curl_http -X POST "$BASE/kyc/$KYC_ID/verify" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{
      \"bvn\": \"22222222222\",
      \"nin\": \"33333333333\",
      \"tenantId\": \"$TENANT\"
    }")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /kyc/$KYC_ID/verify (HTTP $RESP)" || fail "POST /kyc/$KYC_ID/verify (HTTP $RESP)"

  log "Submitting KYC record..."
  RESP=$(curl_http -X POST "$BASE/kyc/$KYC_ID/submit" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /kyc/$KYC_ID/submit (HTTP $RESP)" || fail "POST /kyc/$KYC_ID/submit (HTTP $RESP)"

  log "Completing liveness check..."
  RESP=$(curl_http -X POST "$BASE/kyc/$KYC_ID/liveness" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{
      \"score\": 0.95,
      \"tenantId\": \"$TENANT\"
    }")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /kyc/$KYC_ID/liveness (HTTP $RESP)" || fail "POST /kyc/$KYC_ID/liveness (HTTP $RESP)"
fi

summary "KYC SERVICE"
