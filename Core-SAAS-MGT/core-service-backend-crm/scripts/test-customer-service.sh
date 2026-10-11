#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "CUSTOMER SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

ACCOUNT_ID=""
TENANT="root-admin"

log "Creating customer account..."
RESP=$(curl -s -o /tmp/customer_account.json -w "%{http_code}" -X POST "$BASE/customer-accounts" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"tenantId\": \"$TENANT\",
    \"kind\": \"RIDER\",
    \"profileType\": \"INDIVIDUAL\",
    \"name\": \"Jane Doe\",
    \"email\": \"jane.doe@example.com\",
    \"phone\": \"+2348012345678\",
    \"status\": \"ACTIVE\"
  }")
ACCOUNT_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/customer_account.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /customer-accounts (HTTP $RESP) accountId=$ACCOUNT_ID" || fail "POST /customer-accounts (HTTP $RESP)"

log "Listing customer accounts..."
RESP=$(curl_http -X GET "$BASE/customer-accounts?tenantId=$TENANT" \
  -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /customer-accounts?tenantId=$TENANT (HTTP $RESP)" || fail "GET /customer-accounts?tenantId=$TENANT (HTTP $RESP)"

if [ -n "$ACCOUNT_ID" ]; then
  log "Fetching customer account by ID..."
  RESP=$(curl_http -X GET "$BASE/customer-accounts/$ACCOUNT_ID?tenantId=$TENANT" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] && pass "GET /customer-accounts/$ACCOUNT_ID (HTTP $RESP)" || fail "GET /customer-accounts/$ACCOUNT_ID (HTTP $RESP)"

  log "Updating customer account..."
  RESP=$(curl_http -X PATCH "$BASE/customer-accounts/$ACCOUNT_ID?tenantId=$TENANT" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"name\": \"Jane Doe Updated\", \"status\": \"ACTIVE\"}")
  [ "$RESP" = "200" ] && pass "PATCH /customer-accounts/$ACCOUNT_ID (HTTP $RESP)" || fail "PATCH /customer-accounts/$ACCOUNT_ID (HTTP $RESP)"

  log "Deleting customer account..."
  RESP=$(curl_http -X DELETE "$BASE/customer-accounts/$ACCOUNT_ID?tenantId=$TENANT" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "204" ] && pass "DELETE /customer-accounts/$ACCOUNT_ID (HTTP $RESP)" || fail "DELETE /customer-accounts/$ACCOUNT_ID (HTTP $RESP)"
fi

summary "CUSTOMER SERVICE"
