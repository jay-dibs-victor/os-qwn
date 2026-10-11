#!/bin/bash

GATEWAY_URL="http://localhost:3000"
AUTH_URL="http://localhost:3001"
RBAC_URL="http://localhost:3002"
APPROVAL_URL="http://localhost:3004"
TENANT_ID="tenant-1"

echo "=== Clearing old data ==="
docker exec banking-postgres psql -U banking_user -d banking_db -c 'TRUNCATE TABLE "user" CASCADE; TRUNCATE TABLE "permissions" CASCADE;' || true
docker exec approval-db psql -U postgres -d approval -c 'TRUNCATE TABLE "approval_configs" CASCADE;' || true

echo "=== Seeding Data ==="

SUFFIX=$RANDOM
# 1. Create Users
echo "Creating Initiator User..."
INITIATOR_RES=$(curl -s -X POST "$AUTH_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"initiator_${SUFFIX}@bank.com\",
    \"password\": \"Password123!\",
    \"phone\": \"+1234567890\",
    \"tenantId\": \"$TENANT_ID\"
  }")
INITIATOR_ID=$(echo $INITIATOR_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

echo "Verifying Initiator (ID: $INITIATOR_ID)..."
curl -s -X POST "$AUTH_URL/auth/verify-account" \
  -H "Content-Type: application/json" \
  -d "{ \"userId\": \"$INITIATOR_ID\" }"
echo -e "\n"

echo "Creating Approver 1 User..."
APPROVER1_RES=$(curl -s -X POST "$AUTH_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"approver1_${SUFFIX}@bank.com\",
    \"password\": \"Password123!\",
    \"phone\": \"+1234567891\",
    \"tenantId\": \"$TENANT_ID\"
  }")
APPROVER1_ID=$(echo $APPROVER1_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Approver 1 ID: $APPROVER1_ID"
echo -e "\n"

echo "Creating Approver 2 User..."
APPROVER2_RES=$(curl -s -X POST "$AUTH_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"approver2_${SUFFIX}@bank.com\",
    \"password\": \"Password123!\",
    \"phone\": \"+1234567892\",
    \"tenantId\": \"$TENANT_ID\"
  }")
APPROVER2_ID=$(echo $APPROVER2_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")
echo "Approver 2 ID: $APPROVER2_ID"
echo -e "\n"

# 2. Create Permission in RBAC
echo "Creating Permission TRANSACTION_CREATE..."
PERM_RES=$(curl -s -X POST "$RBAC_URL/rbac/permissions" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"TRANSACTION_CREATE\",
    \"description\": \"Ability to create transactions\",
    \"tenantId\": \"$TENANT_ID\"
  }")

# 2.5 Create Role and Assign Permission
echo "Creating Admin Role..."
ROLE_RES=$(curl -s -X POST "$RBAC_URL/rbac/roles" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"ADMIN_${SUFFIX}\",
    \"description\": \"Administrator role\",
    \"permissions\": [\"TRANSACTION_CREATE\"],
    \"tenantId\": \"$TENANT_ID\"
  }")
ROLE_ID=$(echo $ROLE_RES | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

echo "Assigning Admin Role to Initiator..."
curl -s -X POST "$RBAC_URL/rbac/users/$INITIATOR_ID/roles/$ROLE_ID?tenantId=$TENANT_ID"
echo -e "\n"

# 3. Create Approval Config
echo "Creating Approval Config for POST /transactions..."
curl -s -X POST "$APPROVAL_URL/approval/configs" \
  -H "Content-Type: application/json" \
  -d "{
    \"method\": \"POST\",
    \"path\": \"/transactions\",
    \"requiredPermission\": \"TRANSACTION_CREATE\",
    \"isEnabled\": true,
    \"tenantId\": \"$TENANT_ID\",
    \"levels\": [
      { \"level\": 1, \"allowedUserIds\": [\"$APPROVER1_ID\"] },
      { \"level\": 2, \"allowedUserIds\": [\"$APPROVER2_ID\"] }
    ]
  }"
echo -e "\n"

echo "=== Testing Interception ==="

# 4. Simulate a transaction request via Gateway
echo "Initiating Transaction Request (should be intercepted)..."
curl -s -X POST "$GATEWAY_URL/transactions" \
  -H "Content-Type: application/json" \
  -H "x-tenant-id: $TENANT_ID" \
  -H "x-user-id: $INITIATOR_ID" \
  -d "{
    \"amount\": 50000,
    \"to\": \"account-ledger-001\",
    \"description\": \"Interbank transfer\"
  }"
echo -e "\n"

echo "=== Testing Approval Flow ==="
# Here we would capture the requestId from the response above and approve it.
# This script is a template for the flow.
echo "Seeding and Interception Test Complete."
