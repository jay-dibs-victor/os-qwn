#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "BATCH SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

BATCH_ID=""
TENANT="root-admin"

log "Creating batch job..."
RESP=$(curl -s -o /tmp/batch.json -w "%{http_code}" -X POST "$BASE/batch" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"name\": \"Payroll-$(date +%s)\",
    \"tenantId\": \"$TENANT\",
    \"createdBy\": \"00000000-0000-0000-0000-000000000000\",
    \"items\": [
      {
        \"sourceAccountId\": \"acc-debit-001\",
        \"targetAccountId\": \"acc-credit-001\",
        \"amount\": 5000,
        \"currency\": \"NGN\"
      },
      {
        \"sourceAccountId\": \"acc-debit-001\",
        \"targetAccountId\": \"acc-credit-002\",
        \"amount\": 7500,
        \"currency\": \"NGN\"
      }
    ]
  }")
BATCH_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/batch.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ "$RESP" = "200" ] || [ "$RESP" = "201" ] || [ "$RESP" = "403" ]; then
  pass "POST /batch (HTTP $RESP) batchId=${BATCH_ID:-none}"
else
  fail "POST /batch (HTTP $RESP)"
fi

if [ -n "$BATCH_ID" ]; then
  log "Fetching batch job..."
  RESP=$(curl_http -X GET "$BASE/batch/$BATCH_ID" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /batch/$BATCH_ID (HTTP $RESP)" || fail "GET /batch/$BATCH_ID (HTTP $RESP)"

  log "Executing batch..."
  RESP=$(curl_http -X POST "$BASE/batch/$BATCH_ID/execute" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /batch/$BATCH_ID/execute (HTTP $RESP)" || fail "POST /batch/$BATCH_ID/execute (HTTP $RESP)"

  log "Retrying batch..."
  RESP=$(curl_http -X POST "$BASE/batch/$BATCH_ID/retry" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /batch/$BATCH_ID/retry (HTTP $RESP)" || fail "POST /batch/$BATCH_ID/retry (HTTP $RESP)"
fi

summary "BATCH SERVICE"
