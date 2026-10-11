#!/usr/bin/env bash
# Seed known UUID GL accounts into the ledger-service database.
# This matches the CASH_GL_ACCOUNT_ID and QCOIN_DEPOSITS_GL_ACCOUNT_ID
# env vars in docker-compose.yml.
set -e

LEDGER_DB_HOST="${LEDGER_DB_HOST:-localhost}"
LEDGER_DB_PORT="${LEDGER_DB_PORT:-15434}"
LEDGER_DB_USER="${LEDGER_DB_USER:-postgres}"
LEDGER_DB_PASS="${LEDGER_DB_PASS:-postgres}"
LEDGER_DB_NAME="${LEDGER_DB_NAME:-ledger}"

export PGPASSWORD="$LEDGER_DB_PASS"

# Insert cash GL account with fixed UUID if it doesn't exist
psql -h "$LEDGER_DB_HOST" -p "$LEDGER_DB_PORT" -U "$LEDGER_DB_USER" -d "$LEDGER_DB_NAME" <<SQL
INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  NOW(), NOW(),
  'CASH-1100', 'Platform Cash Pool', 'asset', 'ACTIVE',
  'root-admin', 0.00, 'USD'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  NOW(), NOW(),
  'QCOIN-2100', 'QCoin Deposits', 'liability', 'ACTIVE',
  'root-admin', 0.00, 'QCN'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO gl_accounts (id, "createdAt", "updatedAt", code, name, type, status, "tenantId", balance, currency)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  NOW(), NOW(),
  'ESCROW-1300', 'Chama Escrow', 'asset', 'ACTIVE',
  'root-admin', 0.00, 'USD'
)
ON CONFLICT (id) DO NOTHING;
SQL

echo "Ledger GL accounts seeded successfully."
