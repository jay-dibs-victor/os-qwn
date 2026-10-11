#!/usr/bin/env bash
set -uo pipefail

source "$(dirname "$0")/common.sh"

section "RBAC SERVICE"
do_login "Root Admin"
AUTH_HEADER="Authorization: Bearer $TOKEN"

log "Creating permission..."
PERM_ID=$(curl -s -X POST "$BASE/rbac/permissions" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"name\":\"TRANSACTION_CREATE_$RANDOM\",\"slug\":\"TRANSACTION_CREATE_$RANDOM\",\"description\":\"Create transactions\",\"tenantId\":\"root-admin\"}" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$PERM_ID" ]; then
  pass "POST /rbac/permissions (id: $PERM_ID)"
else
  fail "POST /rbac/permissions"
fi

log "Listing permissions..."
RESP=$(curl_http -X GET "$BASE/rbac/permissions" -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /rbac/permissions" || fail "GET /rbac/permissions (HTTP $RESP)"

if [ -n "$PERM_ID" ]; then
  log "Updating permission..."
  RESP=$(curl_http -X PUT "$BASE/rbac/permissions/$PERM_ID" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{"name":"TRANSACTION_CREATE","description":"Updated description","tenantId":"root-admin"}')
  [ "$RESP" = "200" ] && pass "PUT /rbac/permissions/:id" || fail "PUT /rbac/permissions/:id (HTTP $RESP)"

  log "Deleting permission..."
  RESP=$(curl_http -X DELETE "$BASE/rbac/permissions/$PERM_ID" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "204" ] && pass "DELETE /rbac/permissions/:id" || fail "DELETE /rbac/permissions/:id (HTTP $RESP)"
fi

log "Getting user UUID..."
USER_UUID=$(curl -s -H "$AUTH_HEADER" "$BASE/auth/me" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

log "Creating role..."
ROLE_ID=$(curl -s -X POST "$BASE/rbac/roles" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d "{\"name\":\"ADMIN_$RANDOM\",\"description\":\"Administrator role\",\"tenantId\":\"root-admin\"}" | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
[ -n "$ROLE_ID" ] && pass "POST /rbac/roles (id: $ROLE_ID)" || fail "POST /rbac/roles"

log "Listing roles..."
RESP=$(curl_http -X GET "$BASE/rbac/roles" -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /rbac/roles" || fail "GET /rbac/roles (HTTP $RESP)"

log "Assigning role to user (single)..."
if [ -n "$USER_UUID" ] && [ -n "$ROLE_ID" ]; then
  RESP=$(curl_http -X POST "$BASE/rbac/users/$USER_UUID/roles/$ROLE_ID?tenantId=root-admin" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /rbac/users/:userId/roles/:roleId" || fail "POST /rbac/users/:userId/roles/:roleId (HTTP $RESP) user=$USER_UUID role=$ROLE_ID"
else
  fail "POST /rbac/users/:userId/roles/:roleId — no user UUID or role ID"
fi

log "Bulk assigning roles..."
if [ -n "$USER_UUID" ] && [ -n "$ROLE_ID" ]; then
  RESP=$(curl_http -X POST "$BASE/rbac/users/$USER_UUID/roles" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"roleIds\":[\"$ROLE_ID\"],\"tenantId\":\"root-admin\"}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /rbac/users/:userId/roles (bulk)" || fail "POST /rbac/users/:userId/roles (HTTP $RESP)"
else
  fail "POST /rbac/users/:userId/roles (bulk) — no user UUID or role ID"
fi

if [ -n "$ROLE_ID" ]; then
  log "Updating role..."
  RESP=$(curl_http -X PUT "$BASE/rbac/roles/$ROLE_ID" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d '{"name":"ADMIN","description":"Updated admin role"}')
  [ "$RESP" = "200" ] && pass "PUT /rbac/roles/:id" || fail "PUT /rbac/roles/:id (HTTP $RESP)"

  log "Deleting role..."
  RESP=$(curl_http -X DELETE "$BASE/rbac/roles/$ROLE_ID" \
    -H "$AUTH_HEADER")
  [ "$RESP" = "200" ] || [ "$RESP" = "204" ] && pass "DELETE /rbac/roles/:id" || fail "DELETE /rbac/roles/:id (HTTP $RESP)"
fi

log "Fetching user permissions..."

log "Fetching user permissions..."
RESP=$(curl_http -X GET "$BASE/rbac/users/$USER_UUID/permissions?tenantId=root-admin" \
  -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /rbac/users/:userId/permissions" || fail "GET /rbac/users/:userId/permissions (HTTP $RESP)"

log "Creating policy..."
POLICY_ID=$(curl -s -X POST "$BASE/rbac/policies" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{"name":"AllowCreateTransactions_'"$RANDOM"'","rules":{"effect":"ALLOW","actions":["TRANSACTION_CREATE"],"resources":["*"]},"tenantId":"root-admin"}' | grep -o '"id"[[:space:]]*:[[:space:]]*"[^"]*"' | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
if [ -n "$POLICY_ID" ]; then
  pass "POST /rbac/policies (id: $POLICY_ID)"
else
  fail "POST /rbac/policies"
fi

log "Listing policies..."
RESP=$(curl_http -X GET "$BASE/rbac/policies" -H "$AUTH_HEADER")
[ "$RESP" = "200" ] && pass "GET /rbac/policies" || fail "GET /rbac/policies (HTTP $RESP)"

log "Evaluating policy..."
if [ -n "$POLICY_ID" ]; then
  RESP=$(curl_http -X POST "$BASE/rbac/policies/evaluate" \
    -H "Content-Type: application/json" \
    -H "$AUTH_HEADER" \
    -d "{\"policyId\":\"$POLICY_ID\",\"context\":{\"userId\":\"$USER_UUID\",\"action\":\"TRANSACTION_CREATE\",\"resource\":\"*\"}}")
  [ "$RESP" = "200" ] || [ "$RESP" = "201" ] && pass "POST /rbac/policies/evaluate" || fail "POST /rbac/policies/evaluate (HTTP $RESP)"
else
  fail "POST /rbac/policies/evaluate — no policy ID"
fi

summary "RBAC Service"
