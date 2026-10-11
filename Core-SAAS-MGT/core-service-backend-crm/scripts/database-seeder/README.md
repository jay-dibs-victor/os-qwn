# Database Seeder Blueprint

## Purpose
Orchestrate full database seeding across all 18 microservices in dependency order. Seeds both the root-admin tenant and all other tenants (tenant-001, tenant-002, acme-corp) with appropriate data.

## Seeding Order (FK-safe)
1. **auth-service** — tenants → scopes → roles → users → OAuth clients → customers
2. **rbac-service** — permissions → roles
3. **approval-service** — approval configs (method/path/levels)
4. **loan-service** — products → applications → accounts → schedules
5. **ledger-service** — GL accounts → trip financial records
6. **wallet-service** — driver earnings → fraud flags → savings
7. **kyc-service** — KYC records & documents
8. **payment/accounts/batch/reversal** — empty startup (no auto-seeder)

## Key Entities Per Tenant
Each tenant (root-admin, tenant-001, tenant-002, acme-corp) gets:
- Tenant record + scopes
- Admin + demo users with scopes
- OAuth clients
- Customers (drivers, riders, partners)
- 3 loan products + 10 loan applications
- Trip financial records (10-15 per tenant)
- Driver earnings
- KYC records

## Usage
```bash
# Full reseed (destroys and recreates all data)
bash scripts/seed-all.sh

# Verify with tests
bash scripts/run-all-service-tests.sh

# Quick test (just auth + coverage gaps)
bash scripts/test-coverage-gaps.sh
```
