#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "COMPLIANCE SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

TENANT="root-admin"

log "Creating AML rule..."
RESP=$(curl_http -X POST "$BASE/aml-rules" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"name\": \"High-Value Alert\",
    \"type\": \"threshold\",
    \"severity\": \"HIGH\",
    \"conditions\": { \"minAmount\": 10000 },
    \"tenantId\": \"$TENANT\"
  }")
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /aml-rules (HTTP $RESP)" || fail "POST /aml-rules (HTTP $RESP)"

log "Monitoring transaction..."
RESP=$(curl_http -X POST "$BASE/monitor" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"transactionId\": \"txn-$(date +%s)\",
    \"customerId\": \"00000000-0000-0000-0000-000000000001\",
    \"counterpartyName\": \"Business Ltd\",
    \"amount\": 500000,
    \"tenantId\": \"$TENANT\"
  }")
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /monitor (HTTP $RESP)" || fail "POST /monitor (HTTP $RESP)"

log "Filing SAR..."
RESP=$(curl_http -X POST "$BASE/sars" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"customerId\": \"00000000-0000-0000-0000-000000000001\",
    \"alertIds\": [\"alert-$(date +%s)\"],
    \"narrative\": \"Multiple high-value transactions flagged\",
    \"filedBy\": \"00000000-0000-0000-0000-000000000000\",
    \"tenantId\": \"$TENANT\"
  }")
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /sars (HTTP $RESP)" || fail "POST /sars (HTTP $RESP)"

log "Fetching compliance dashboard..."
RESP=$(curl_http -X GET "$BASE/dashboard/$TENANT" \
  -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /dashboard/$TENANT (HTTP $RESP)" || fail "GET /dashboard/$TENANT (HTTP $RESP)"

summary "COMPLIANCE SERVICE"
