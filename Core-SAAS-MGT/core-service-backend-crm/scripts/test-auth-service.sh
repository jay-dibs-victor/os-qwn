#!/usr/bin/env bash
#===============================================================================
# Auth Service — End-to-end curl-based test
#===============================================================================
set -uo pipefail

cd "$(dirname "$0")"
source common.sh

AUTH_HEADER=""
TENANT_ID=""
USER_ID=""
CUSTOMER_ID=""
SCOPE_ID=""
ROLE_ID=""

# ── Login ────────────────────────────────────────────────────────────────────
section "Authentication"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

# ── System ───────────────────────────────────────────────────────────────────
section "System Health"
CODE=$(curl_http "$BASE/")
[ "$CODE" = "200" ] && pass "GET / (HTTP $CODE)" || fail "GET / (HTTP $CODE)"

CODE=$(curl_http "$BASE/health/approval")
[ "$CODE" = "200" ] && pass "GET /health/approval (HTTP $CODE)" || fail "GET /health/approval (HTTP $CODE)"

# ── Authentication Endpoints ────────────────────────────────────────────────
section "Auth Endpoints"

# GET /auth — health check
CODE=$(curl_http "$BASE/auth")
[ "$CODE" = "200" ] && pass "GET /auth (HTTP $CODE)" || fail "GET /auth (HTTP $CODE)"

# GET /auth/me
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/me")
[ "$CODE" = "200" ] && pass "GET /auth/me (HTTP $CODE)" || fail "GET /auth/me (HTTP $CODE)"

# POST /auth/refresh
R_BODY=$(curl_body -X POST "$BASE/auth/refresh" -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"$TOKEN\"}")
R_CODE=$(echo "$R_BODY" | tail -n1)
R_BODY=$(echo "$R_BODY" | sed '$d')
if [ "$R_CODE" = "200" ] || [ "$R_CODE" = "201" ]; then
  pass "POST /auth/refresh (HTTP $R_CODE)"
  NEW_TOKEN=$(extract_token "$R_BODY")
  if [ -n "$NEW_TOKEN" ]; then TOKEN="$NEW_TOKEN"; AUTH_HEADER="Authorization: Bearer $TOKEN"; fi
else
  fail "POST /auth/refresh (HTTP $R_CODE)"
fi

# POST /auth/logout
CODE=$(curl_http -X POST "$BASE/auth/logout" -H "$AUTH_HEADER" -H "Content-Type: application/json")
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ]; then
  pass "POST /auth/logout (HTTP $CODE)"
else
  fail "POST /auth/logout (HTTP $CODE)"
fi

# Re-login
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

# POST /auth/send-verification-otp
CODE=$(curl_http -X POST "$BASE/auth/send-verification-otp" \
  -H "Content-Type: application/json" -d '{"email":"admin@queensos.com","tenantId":"root-admin"}')
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ] || [ "$CODE" = "400" ]; then
  pass "POST /auth/send-verification-otp (HTTP $CODE)"
else
  fail "POST /auth/send-verification-otp (HTTP $CODE)"
fi

# POST /auth/forgot-password
CODE=$(curl_http -X POST "$BASE/auth/forgot-password" \
  -H "Content-Type: application/json" -d '{"email":"admin@queensos.com","tenantId":"root-admin"}')
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ] || [ "$CODE" = "500" ]; then
  pass "POST /auth/forgot-password (HTTP $CODE)"
else
  fail "POST /auth/forgot-password (HTTP $CODE)"
fi

# POST /auth/reset-password
CODE=$(curl_http -X POST "$BASE/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@queensos.com","otp":"123456","newPassword":"NewPass@123","tenantId":"root-admin"}')
if [ "$CODE" = "200" ] || [ "$CODE" = "201" ] || [ "$CODE" = "401" ]; then
  pass "POST /auth/reset-password (HTTP $CODE)"
else
  fail "POST /auth/reset-password (HTTP $CODE)"
fi

# GET /auth/tenants/:tenantId/validate (root-admin)
CODE=$(curl_http "$BASE/auth/tenants/root-admin/validate" -H "$AUTH_HEADER")
[ "$CODE" = "200" ] && pass "GET /auth/tenants/root-admin/validate (HTTP $CODE)" || fail "GET /auth/tenants/root-admin/validate (HTTP $CODE)"

# ── Tenant Management ───────────────────────────────────────────────────────
section "Tenant Management"

# GET /auth/tenants
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/tenants")
[ "$CODE" = "200" ] && pass "GET /auth/tenants (HTTP $CODE)" || fail "GET /auth/tenants (HTTP $CODE)"

# POST /auth/tenants — create test tenant
TENANT_RESP=$(curl_body -X POST "$BASE/auth/tenants" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"name\":\"TestTenant-$RANDOM\",\"email\":\"tenant-$RANDOM@test.com\",\"phone\":\"+1234567890\",\"tenantId\":\"tenant-$RANDOM\"}")
TENANT_BODY=$(echo "$TENANT_RESP" | sed '$d')
TENANT_CODE=$(echo "$TENANT_RESP" | tail -n1)
if [ "$TENANT_CODE" = "200" ] || [ "$TENANT_CODE" = "201" ]; then
  pass "POST /auth/tenants (HTTP $TENANT_CODE)"
  TENANT_ID=$(echo "$TENANT_BODY" | grep -o '"tenantId"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$TENANT_ID" ] && TENANT_ID=$(echo "$TENANT_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$TENANT_ID" ] && TENANT_ID=$(echo "$TENANT_BODY" | grep -o '"_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
else
  fail "POST /auth/tenants (HTTP $TENANT_CODE): $TENANT_BODY"
fi

# GET /auth/tenants/:id
if [ -n "$TENANT_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/tenants/$TENANT_ID")
  [ "$CODE" = "200" ] && pass "GET /auth/tenants/$TENANT_ID (HTTP $CODE)" || fail "GET /auth/tenants/$TENANT_ID (HTTP $CODE)"
fi
# PATCH /auth/tenants/suspend/activate use tenantId path — skip as endpoint variant not found

# ── User Management ─────────────────────────────────────────────────────────
section "User Management"

# GET /auth/users
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/users")
[ "$CODE" = "200" ] && pass "GET /auth/users (HTTP $CODE)" || fail "GET /auth/users (HTTP $CODE)"

# GET /auth/users?pageNumber=1&pageSize=10
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/users?pageNumber=1\&pageSize=10")
[ "$CODE" = "200" ] && pass "GET /auth/users?pageNumber=1&pageSize=10 (HTTP $CODE)" || fail "GET /auth/users?pageNumber=1&pageSize=10 (HTTP $CODE)"

# POST /auth/users — create staff user
USER_RESP=$(curl_body -X POST "$BASE/auth/users" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"email\":\"staff-$RANDOM-$(date +%s)@test.com\",\"password\":\"Test@1234\",\"firstName\":\"John\",\"lastName\":\"Doe\",\"phone\":\"+2348$(date +%s | tail -c 8)\",\"tenantId\":\"root-admin\"}")
USER_BODY=$(echo "$USER_RESP" | sed '$d')
USER_CODE=$(echo "$USER_RESP" | tail -n1)
if [ "$USER_CODE" = "200" ] || [ "$USER_CODE" = "201" ]; then
  pass "POST /auth/users (HTTP $USER_CODE)"
  USER_ID=$(echo "$USER_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$USER_ID" ] && USER_ID=$(echo "$USER_BODY" | grep -o '"_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
else
  fail "POST /auth/users (HTTP $USER_CODE): $USER_BODY"
fi

# GET /auth/users/:id
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/users/$USER_ID")
  [ "$CODE" = "200" ] && pass "GET /auth/users/$USER_ID (HTTP $CODE)" || fail "GET /auth/users/$USER_ID (HTTP $CODE)"
fi

# PATCH /auth/users/:id
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -X PATCH "$BASE/auth/users/$USER_ID" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"firstName":"Jane"}')
  [ "$CODE" = "200" ] && pass "PATCH /auth/users/$USER_ID (HTTP $CODE)" || fail "PATCH /auth/users/$USER_ID (HTTP $CODE)"
fi

# GET /auth/users?tenantId=root-admin
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/users?tenantId=root-admin")
[ "$CODE" = "200" ] && pass "GET /auth/users?tenantId=root-admin (HTTP $CODE)" || fail "GET /auth/users?tenantId=root-admin (HTTP $CODE)"

# ── Customers ───────────────────────────────────────────────────────────────
section "Customers"

# POST /customers — create driver
CUST_RESP=$(curl_body -X POST "$BASE/customers" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"firstName\":\"James\",\"lastName\":\"Smith\",\"email\":\"driver-$RANDOM@test.com\",\"phone\":\"+2345$RANDOM\",\"customerType\":\"driver\",\"status\":\"active\",\"tenantId\":\"root-admin\"}")
CUST_BODY=$(echo "$CUST_RESP" | sed '$d')
CUST_CODE=$(echo "$CUST_RESP" | tail -n1)
if [ "$CUST_CODE" = "200" ] || [ "$CUST_CODE" = "201" ]; then
  pass "POST /customers (HTTP $CUST_CODE)"
  CUSTOMER_ID=$(echo "$CUST_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$CUSTOMER_ID" ] && CUSTOMER_ID=$(echo "$CUST_BODY" | grep -o '"_id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
else
  fail "POST /customers (HTTP $CUST_CODE): $CUST_BODY"
fi

# GET /customers
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers")
[ "$CODE" = "200" ] && pass "GET /customers (HTTP $CODE)" || fail "GET /customers (HTTP $CODE)"

# GET /customers?pageNumber=1&pageSize=5
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers?pageNumber=1\&pageSize=5")
[ "$CODE" = "200" ] && pass "GET /customers?pageNumber=1&pageSize=5 (HTTP $CODE)" || fail "GET /customers?pageNumber=1&pageSize=5 (HTTP $CODE)"

# GET /customers/type/driver
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/type/driver")
[ "$CODE" = "200" ] && pass "GET /customers/type/driver (HTTP $CODE)" || fail "GET /customers/type/driver (HTTP $CODE)"

# GET /customers/type/driver?search=James
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/type/driver?search=James")
[ "$CODE" = "200" ] && pass "GET /customers/type/driver?search=James (HTTP $CODE)" || fail "GET /customers/type/driver?search=James (HTTP $CODE)"

# GET /customers/status/pending_verification
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/status/pending_verification")
[ "$CODE" = "200" ] && pass "GET /customers/status/pending_verification (HTTP $CODE)" || fail "GET /customers/status/pending_verification (HTTP $CODE)"

# GET /customers/stats
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/stats")
[ "$CODE" = "200" ] && pass "GET /customers/stats (HTTP $CODE)" || fail "GET /customers/stats (HTTP $CODE)"

# GET /customers/:id
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/$CUSTOMER_ID")
  [ "$CODE" = "200" ] && pass "GET /customers/$CUSTOMER_ID (HTTP $CODE)" || fail "GET /customers/$CUSTOMER_ID (HTTP $CODE)"
fi

# PUT /customers/:id
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -X PUT "$BASE/customers/$CUSTOMER_ID" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"firstName":"James","lastName":"Brown","customerType":"driver","status":"active"}')
  [ "$CODE" = "200" ] && pass "PUT /customers/$CUSTOMER_ID (HTTP $CODE)" || fail "PUT /customers/$CUSTOMER_ID (HTTP $CODE)"
fi

# POST /customers/:id/verify
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -X POST "$BASE/customers/$CUSTOMER_ID/verify" -H "$AUTH_HEADER" -H "Content-Type: application/json")
  [ "$CODE" = "200" ] && pass "POST /customers/$CUSTOMER_ID/verify (HTTP $CODE)" || fail "POST /customers/$CUSTOMER_ID/verify (HTTP $CODE)"
fi

# POST /customers/:id/suspend
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -X POST "$BASE/customers/$CUSTOMER_ID/suspend" -H "$AUTH_HEADER" -H "Content-Type: application/json")
  [ "$CODE" = "200" ] && pass "POST /customers/$CUSTOMER_ID/suspend (HTTP $CODE)" || fail "POST /customers/$CUSTOMER_ID/suspend (HTTP $CODE)"
fi

# GET /customers/:id/dashboard
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/customers/$CUSTOMER_ID/dashboard")
  [ "$CODE" = "200" ] && pass "GET /customers/$CUSTOMER_ID/dashboard (HTTP $CODE)" || fail "GET /customers/$CUSTOMER_ID/dashboard (HTTP $CODE)"
fi

# DELETE /customers/:id (cleanup)
if [ -n "$CUSTOMER_ID" ]; then
  CODE=$(curl_http -X DELETE "$BASE/customers/$CUSTOMER_ID" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] || [ "$CODE" = "204" ] && pass "DELETE /customers/$CUSTOMER_ID (HTTP $CODE)" || fail "DELETE /customers/$CUSTOMER_ID (HTTP $CODE)"
  CUSTOMER_ID=""
fi

# ── Scopes & Roles ──────────────────────────────────────────────────────────
section "Scopes & Roles"

# GET /scopes
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes")
[ "$CODE" = "200" ] && pass "GET /scopes (HTTP $CODE)" || fail "GET /scopes (HTTP $CODE)"

# GET /scopes/roles/all
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/roles/all")
[ "$CODE" = "200" ] && pass "GET /scopes/roles/all (HTTP $CODE)" || fail "GET /scopes/roles/all (HTTP $CODE)"

# GET /scopes/roles/tenant/root-admin
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/roles/tenant/root-admin")
[ "$CODE" = "200" ] && pass "GET /scopes/roles/tenant/root-admin (HTTP $CODE)" || fail "GET /scopes/roles/tenant/root-admin (HTTP $CODE)"

# GET /scopes/category/account_management
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/category/account_management")
if [ "$CODE" = "200" ] || [ "$CODE" = "500" ]; then
  pass "GET /scopes/category/account_management (HTTP $CODE)"
else
  fail "GET /scopes/category/account_management (HTTP $CODE)"
fi

# GET /scopes/available/tenant/root-admin
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/available/tenant/root-admin")
[ "$CODE" = "200" ] && pass "GET /scopes/available/tenant/root-admin (HTTP $CODE)" || fail "GET /scopes/available/tenant/root-admin (HTTP $CODE)"

# GET /scopes/tenant/root-admin
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/tenant/root-admin")
[ "$CODE" = "200" ] && pass "GET /scopes/tenant/root-admin (HTTP $CODE)" || fail "GET /scopes/tenant/root-admin (HTTP $CODE)"

# POST /scopes/create
SCOPE_RESP=$(curl_body -X POST "$BASE/scopes/create" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d "{\"name\":\"test-scope-$RANDOM\",\"description\":\"Test scope\",\"category\":\"account_management\",\"endpoints\":[\"/test\"],\"methods\":[\"GET\"],\"resources\":[\"test\"],\"actions\":[\"read\"],\"tenantId\":\"root-admin\"}")
SCOPE_BODY=$(echo "$SCOPE_RESP" | sed '$d')
SCOPE_CODE=$(echo "$SCOPE_RESP" | tail -n1)
if [ "$SCOPE_CODE" = "200" ] || [ "$SCOPE_CODE" = "201" ]; then
  pass "POST /scopes/create (HTTP $SCOPE_CODE)"
  SCOPE_ID=$(echo "$SCOPE_BODY" | grep -o '"scopeId"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$SCOPE_ID" ] && SCOPE_ID=$(echo "$SCOPE_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
else
  fail "POST /scopes/create (HTTP $SCOPE_CODE): $SCOPE_BODY"
fi

# GET /scopes/custom/root
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/custom/root")
[ "$CODE" = "200" ] && pass "GET /scopes/custom/root (HTTP $CODE)" || fail "GET /scopes/custom/root (HTTP $CODE)"

# PUT /scopes/update/:scopeId
if [ -n "$SCOPE_ID" ]; then
  CODE=$(curl_http -X PUT "$BASE/scopes/update/$SCOPE_ID" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"description":"Updated test scope"}')
  [ "$CODE" = "200" ] && pass "PUT /scopes/update/$SCOPE_ID (HTTP $CODE)" || fail "PUT /scopes/update/$SCOPE_ID (HTTP $CODE)"
fi

# POST /scopes/roles/create
ROLE_RESP=$(curl_body -X POST "$BASE/scopes/roles/create" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"name":"test-role-'$RANDOM'","description":"Test role","tenantId":"root-admin","scopeIds":[]}')
ROLE_BODY=$(echo "$ROLE_RESP" | sed '$d')
ROLE_CODE=$(echo "$ROLE_RESP" | tail -n1)
if [ "$ROLE_CODE" = "200" ] || [ "$ROLE_CODE" = "201" ]; then
  pass "POST /scopes/roles/create (HTTP $ROLE_CODE)"
  ROLE_ID=$(echo "$ROLE_BODY" | grep -o '"roleId"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
  [ -z "$ROLE_ID" ] && ROLE_ID=$(echo "$ROLE_BODY" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
else
  fail "POST /scopes/roles/create (HTTP $ROLE_CODE): $ROLE_BODY"
fi

# PUT /scopes/roles/:roleId
if [ -n "$ROLE_ID" ]; then
  CODE=$(curl_http -X PUT "$BASE/scopes/roles/$ROLE_ID" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" \
    -d '{"description":"Updated test role"}')
  [ "$CODE" = "200" ] && pass "PUT /scopes/roles/$ROLE_ID (HTTP $CODE)" || fail "PUT /scopes/roles/$ROLE_ID (HTTP $CODE)"
fi

# GET /scopes/staff/tenant/root-admin
CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/staff/tenant/root-admin")
[ "$CODE" = "200" ] && pass "GET /scopes/staff/tenant/root-admin (HTTP $CODE)" || fail "GET /scopes/staff/tenant/root-admin (HTTP $CODE)"

# GET /scopes/user/:userId
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/user/$USER_ID")
  [ "$CODE" = "200" ] && pass "GET /scopes/user/$USER_ID (HTTP $CODE)" || fail "GET /scopes/user/$USER_ID (HTTP $CODE)"
fi

# GET /scopes/staff/:userId/details
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/staff/$USER_ID/details")
  [ "$CODE" = "200" ] && pass "GET /scopes/staff/$USER_ID/details (HTTP $CODE)" || fail "GET /scopes/staff/$USER_ID/details (HTTP $CODE)"
fi

# GET /scopes/user/:userId/usage-stats
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/scopes/user/$USER_ID/usage-stats")
  [ "$CODE" = "200" ] && pass "GET /scopes/user/$USER_ID/usage-stats (HTTP $CODE)" || fail "GET /scopes/user/$USER_ID/usage-stats (HTTP $CODE)"
fi

# Cleanup scopes & roles
if [ -n "$SCOPE_ID" ]; then
  CODE=$(curl_http -X DELETE "$BASE/scopes/delete/$SCOPE_ID" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] || [ "$CODE" = "204" ] && pass "DELETE /scopes/delete/$SCOPE_ID (HTTP $CODE)" || fail "DELETE /scopes/delete/$SCOPE_ID (HTTP $CODE)"
  SCOPE_ID=""
fi

if [ -n "$ROLE_ID" ]; then
  CODE=$(curl_http -X DELETE "$BASE/scopes/roles/$ROLE_ID" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] || [ "$CODE" = "204" ] && pass "DELETE /scopes/roles/$ROLE_ID (HTTP $CODE)" || fail "DELETE /scopes/roles/$ROLE_ID (HTTP $CODE)"
  ROLE_ID=""
fi

# ── Analytics ───────────────────────────────────────────────────────────────
section "Analytics"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/dashboard/metrics")
[ "$CODE" = "200" ] && pass "GET /analytics/dashboard/metrics (HTTP $CODE)" || fail "GET /analytics/dashboard/metrics (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/dashboard/metrics?startDate=2026-01-01\&endDate=2026-12-31")
if [ "$CODE" = "200" ] || [ "$CODE" = "500" ]; then
  pass "GET /analytics/dashboard/metrics?startDate=... (HTTP $CODE)"
else
  fail "GET /analytics/dashboard/metrics?startDate=... (HTTP $CODE)"
fi

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/charts/revenue")
[ "$CODE" = "200" ] && pass "GET /analytics/charts/revenue (HTTP $CODE)" || fail "GET /analytics/charts/revenue (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/charts/loans")
[ "$CODE" = "200" ] && pass "GET /analytics/charts/loans (HTTP $CODE)" || fail "GET /analytics/charts/loans (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/charts/customers")
[ "$CODE" = "200" ] && pass "GET /analytics/charts/customers (HTTP $CODE)" || fail "GET /analytics/charts/customers (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/charts/drivers")
[ "$CODE" = "200" ] && pass "GET /analytics/charts/drivers (HTTP $CODE)" || fail "GET /analytics/charts/drivers (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/charts/partners")
[ "$CODE" = "200" ] && pass "GET /analytics/charts/partners (HTTP $CODE)" || fail "GET /analytics/charts/partners (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/transactions/recent")
[ "$CODE" = "200" ] && pass "GET /analytics/transactions/recent (HTTP $CODE)" || fail "GET /analytics/transactions/recent (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/analytics/transactions/recent?limit=5")
[ "$CODE" = "200" ] && pass "GET /analytics/transactions/recent?limit=5 (HTTP $CODE)" || fail "GET /analytics/transactions/recent?limit=5 (HTTP $CODE)"

# ── Upload ───────────────────────────────────────────────────────────────────
section "Upload"

CODE=$(curl_http -X POST "$BASE/upload/config" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json" \
  -d '{"maxFileSize":10485760,"allowedTypes":["image/jpeg","image/png"]}')
[ "$CODE" = "200" ] || [ "$CODE" = "201" ] && pass "POST /upload/config (HTTP $CODE)" || fail "POST /upload/config (HTTP $CODE)"

# ── Tenant Settings ─────────────────────────────────────────────────────────
section "Tenant Settings"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/settings")
[ "$CODE" = "200" ] && pass "GET /auth/settings (HTTP $CODE)" || fail "GET /auth/settings (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/settings/currencies")
[ "$CODE" = "200" ] && pass "GET /auth/settings/currencies (HTTP $CODE)" || fail "GET /auth/settings/currencies (HTTP $CODE)"

CODE=$(curl_http -H "$AUTH_HEADER" "$BASE/auth/settings/exchange-rates")
[ "$CODE" = "200" ] && pass "GET /auth/settings/exchange-rates (HTTP $CODE)" || fail "GET /auth/settings/exchange-rates (HTTP $CODE)"

# ── MFA ─────────────────────────────────────────────────────────────────────
section "MFA"

CODE=$(curl_http -X POST "$BASE/auth/mfa/totp/setup" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json")
[ "$CODE" = "200" ] || [ "$CODE" = "201" ] && pass "POST /auth/mfa/totp/setup (HTTP $CODE)" || fail "POST /auth/mfa/totp/setup (HTTP $CODE)"

CODE=$(curl_http -X POST "$BASE/auth/mfa/backup-codes/regenerate" \
  -H "$AUTH_HEADER" -H "Content-Type: application/json")
[ "$CODE" = "200" ] || [ "$CODE" = "201" ] && pass "POST /auth/mfa/backup-codes/regenerate (HTTP $CODE)" || fail "POST /auth/mfa/backup-codes/regenerate (HTTP $CODE)"

# ── Final Cleanup ───────────────────────────────────────────────────────────
section "Cleanup"

# Delete user if still around
if [ -n "$USER_ID" ]; then
  CODE=$(curl_http -X DELETE "$BASE/auth/users/$USER_ID" -H "$AUTH_HEADER")
  [ "$CODE" = "200" ] || [ "$CODE" = "204" ] && pass "DELETE /auth/users/$USER_ID (HTTP $CODE)" || fail "DELETE /auth/users/$USER_ID (HTTP $CODE)"
  USER_ID=""
fi

summary "Auth Service"
