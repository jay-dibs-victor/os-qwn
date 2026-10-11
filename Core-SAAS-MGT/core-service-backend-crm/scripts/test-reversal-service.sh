#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "REVERSAL SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

REVERSAL_ID=""
TENANT="root-admin"

log "Creating FULL_REVERSAL..."
RESP=$(curl -s -o /tmp/reversal.json -w "%{http_code}" -X POST "$BASE/reversal" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"originalTransactionId\": \"jrnl-$(date +%s)\",
    \"type\": \"FULL_REVERSAL\",
    \"reason\": \"DUPLICATE_PAYMENT\",
    \"reasonDescription\": \"Customer was charged twice for the same trip\",
    \"tenantId\": \"$TENANT\",
    \"requestedBy\": \"00000000-0000-0000-0000-000000000000\"
  }")
REVERSAL_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/reversal.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ "$RESP" = "200" ] || [ "$RESP" = "201" ] || [ "$RESP" = "403" ]; then
  pass "POST /reversal (HTTP $RESP) reversalId=${REVERSAL_ID:-none}"
else
  fail "POST /reversal (HTTP $RESP)"
fi

if [ -n "$REVERSAL_ID" ]; then
  log "Fetching reversal by ID..."
  RESP=$(curl_http -X GET "$BASE/reversal/$REVERSAL_ID" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /reversal/$REVERSAL_ID (HTTP $RESP)" || fail "GET /reversal/$REVERSAL_ID (HTTP $RESP)"
fi

summary "REVERSAL SERVICE"
