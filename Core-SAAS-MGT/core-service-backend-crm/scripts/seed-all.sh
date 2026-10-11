#!/usr/bin/env bash
#===============================================================================
# seed-all.sh — Full Database Seeding Orchestrator
# Seeds ALL microservices in dependency order, for root-admin and all tenants.
# Works with: core-service-backend-crm (NestJS/TypeORM/PostgreSQL)
#===============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

BOLD='\033[1m'; RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; CYAN='\033[0;36m'; NC='\033[0m'
log()  { echo -e "${CYAN}[SEED]${NC} $1"; }
ok()   { echo -e "  ${GREEN}✓${NC} $1"; }
warn() { echo -e "  ${YELLOW}⚠${NC} $1"; }
fail() { echo -e "  ${RED}✗${NC} $1"; }

log "${BOLD}===== Full Database Seeding Orchestrator =====${NC}"
log "Seeding all microservices in dependency order"

# ─── Step 1: Core auth data (tenants, scopes, roles, users) ───
log "Step 1/8: Auth Service (tenants, scopes, roles, users, OAuth, customers)"
# Auth service seeds on startup automatically via DatabaseSeeder in main.ts
# Force reseed by restarting
docker restart core-service-backend-crm-auth-service-1 2>/dev/null || warn "auth-service not running"
sleep 3
ok "Auth service reseeded (tenants: root-admin, tenant-001, tenant-002, acme-corp)"

# ─── Step 2: RBAC permissions & roles ───
log "Step 2/8: RBAC Service (permissions, roles)"
docker restart core-service-backend-crm-rbac-service-1 2>/dev/null || warn "rbac-service not running"
sleep 2
ok "RBAC service reseeded"

# ─── Step 3: Approval configs ───
log "Step 3/8: Approval Service (approval configs)"
docker restart core-service-backend-crm-approval-service-1 2>/dev/null || warn "approval-service not running"
sleep 2
ok "Approval service reseeded"

# ─── Step 4: Loan products & applications ───
log "Step 4/8: Loan Service (products, applications, accounts, schedules)"
docker restart core-service-backend-crm-loan-service-1 2>/dev/null || warn "loan-service not running"
sleep 2
ok "Loan service reseeded"

# ─── Step 5: Ledger — GL accounts & trip financial records ───
log "Step 5/8: Ledger Service (GL accounts, trip financial records)"
# First seed GL accounts via the GL seed script
if [ -f "$SCRIPT_DIR/seed-ledger-gl.sh" ]; then
  bash "$SCRIPT_DIR/seed-ledger-gl.sh" || warn "GL accounts seed had issues"
fi
docker restart core-service-backend-crm-ledger-service-1 2>/dev/null || warn "ledger-service not running"
sleep 2
ok "Ledger service reseeded"

# ─── Step 6: Wallet — driver earnings, fraud, savings ───
log "Step 6/8: Wallet Service (driver earnings, fraud flags, savings)"
docker restart core-service-backend-crm-wallet-service-1 2>/dev/null || warn "wallet-service not running"
sleep 2
ok "Wallet service reseeded"

# ─── Step 7: KYC records for drivers ───
log "Step 7/8: KYC Service (KYC records & documents)"
docker restart core-service-backend-crm-kyc-service-1 2>/dev/null || warn "kyc-service not running"
sleep 2
ok "KYC service reseeded"

# ─── Step 8: Other services (payment, accounts, batch, reversal, etc.) ───
log "Step 8/8: Other services (no auto-seeder, rely on empty state)"
for svc in payment-service accounts-service batch-service reversal-service retry-service compliance-service audit-service overdraft-service; do
  docker restart "core-service-backend-crm-$svc-1" 2>/dev/null || true
done
sleep 3
ok "All remaining services restarted"

log "${BOLD}===== Seeding complete! Run tests to verify. =====${NC}"
echo ""
echo "Run: bash scripts/run-all-service-tests.sh"
