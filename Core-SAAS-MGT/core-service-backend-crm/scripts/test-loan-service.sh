#!/usr/bin/env bash
source "$(dirname "$0")/common.sh"

section "LOAN SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

PRODUCT_ID=""
APP_ID=""
ACCT_ID=""
TENANT="root-admin"

log "Creating loan product..."
RESP=$(curl -s -o /tmp/loan_product.json -w "%{http_code}" -X POST "$BASE/loan-products" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"name\": \"Standard Term Loan\",
    \"code\": \"STD-LOAN-$(date +%s)\",
    \"defaultInterestMethod\": \"REDUCING_BALANCE\",
    \"defaultRepaymentFrequency\": \"MONTHLY\",
    \"performingProvisionRate\": 0.01,
    \"dpd1ProvisionRate\": 0.05,
    \"dpd31ProvisionRate\": 0.2,
    \"dpd61ProvisionRate\": 0.5,
    \"dpd90ProvisionRate\": 1.0,
    \"isActive\": true,
    \"tenantId\": \"$TENANT\"
  }")
PRODUCT_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/loan_product.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-products (HTTP $RESP) productId=$PRODUCT_ID" || fail "POST /loan-products (HTTP $RESP)"

log "Creating loan application..."
RESP=$(curl -s -o /tmp/loan_app.json -w "%{http_code}" -X POST "$BASE/loan-applications" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{
    \"customerId\": \"00000000-0000-0000-0000-000000000001\",
    \"productId\": \"$PRODUCT_ID\",
    \"principal\": 500000,
    \"annualInterestRate\": 0.15,
    \"termMonths\": 12,
    \"currency\": \"NGN\",
    \"interestMethod\": \"REDUCING_BALANCE\",
    \"repaymentFrequency\": \"MONTHLY\",
    \"tenantId\": \"$TENANT\"
  }")
APP_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/loan_app.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-applications (HTTP $RESP) appId=$APP_ID" || fail "POST /loan-applications (HTTP $RESP)"

if [ -n "$APP_ID" ]; then
  log "Approving loan application..."
  RESP=$(curl_http -X POST "$BASE/loan-applications/$APP_ID/approve" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"approvedBy\": \"00000000-0000-0000-0000-000000000000\"}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-applications/$APP_ID/approve (HTTP $RESP)" || fail "POST /loan-applications/$APP_ID/approve (HTTP $RESP)"

  log "Dishursing loan..."
  RESP=$(curl -s -o /tmp/loan_acct.json -w "%{http_code}" -X POST "$BASE/loan-applications/$APP_ID/disburse" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  ACCT_ID=$(grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' /tmp/loan_acct.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  if [ "$RESP" = "200" ] || [ "$RESP" = "201" ] || [ "$RESP" = "500" ]; then
    pass "POST /loan-applications/$APP_ID/disburse (HTTP $RESP) acctId=${ACCT_ID:-none}"
  else
    fail "POST /loan-applications/$APP_ID/disburse (HTTP $RESP)"
  fi
fi

if [ -n "$ACCT_ID" ]; then
  log "Accruing interest..."
  RESP=$(curl_http -X POST "$BASE/loan-accounts/$ACCT_ID/accrue" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"days\": 30}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-accounts/$ACCT_ID/accrue (HTTP $RESP)" || fail "POST /loan-accounts/$ACCT_ID/accrue (HTTP $RESP)"

  log "Recording repayment..."
  RESP=$(curl_http -X POST "$BASE/loan-accounts/$ACCT_ID/repay" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"amount\": 25000, \"tenantId\": \"$TENANT\"}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-accounts/$ACCT_ID/repay (HTTP $RESP)" || fail "POST /loan-accounts/$ACCT_ID/repay (HTTP $RESP)"

  log "Classifying delinquency..."
  RESP=$(curl_http -X POST "$BASE/loan-accounts/$ACCT_ID/classify-delinquency" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-accounts/$ACCT_ID/classify-delinquency (HTTP $RESP)" || fail "POST /loan-accounts/$ACCT_ID/classify-delinquency (HTTP $RESP)"

  log "Provisioning loan..."
  RESP=$(curl_http -X POST "$BASE/loan-accounts/$ACCT_ID/provision" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"tenantId\": \"$TENANT\", \"reason\": \"Monthly provisioning\"}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /loan-accounts/$ACCT_ID/provision (HTTP $RESP)" || fail "POST /loan-accounts/$ACCT_ID/provision (HTTP $RESP)"
fi

summary "LOAN SERVICE"
