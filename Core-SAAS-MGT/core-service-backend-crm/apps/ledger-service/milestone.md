# Ledger Service — Milestone

## Port
`3003`

## What Has Been Done
- Complete double-entry general ledger system
- Chart of accounts management with hierarchical tree structure (materialized path)
- GL account CRUD with parent-child relationships
- Posting engine: balanced journal entries with debit/credit validation
- Transaction posting, retrieval by ID and reference
- Audit trail: full entry history with GL impact per journal
- Financial reports: trial balance, balance sheet, profit & loss statement
- Trip revenue recognition with commission splitting
- Commission rule engine (CRUD + calculate)
- Escrow wallet management (create, lock, release, admin override)
- QCoin reward system (award trip coins, wallet, transactions)
- Site-wide fare configuration management
- Tenant remittance configuration (driver-specific, due processing)
- Daily total and balance queries for sub-ledger accounts
- GL-sourced analytics seeding for auth-service dashboard

## Feature Enhancements
- **Pagination:** GL accounts listing supports `pageNumber`/`pageSize` and `skip`/`take`
- **Enum normalization:** `@Transform` decorator accepts both uppercase (ASSET) and lowercase (asset) type values
- **Safe JSON serialization:** Posting controller returns only necessary fields to avoid circular references
- **Validation transform:** Global `ValidationPipe({ transform: true })` enables class-transformer decorators
- **Real Swagger payloads:** All POST/PUT bodies include named examples (cash account, wallet liability, trip revenue)
- **Sub-ledger tracking:** Support for CUSTOMER_ACCOUNT, DRIVER_ACCOUNT, PARTNER_ACCOUNT sub-ledger types

## Stability
- `ValidationPipe({ transform: true })` globally applied
- Balanced entry validation (debits must equal credits)
- Seeded GL accounts on startup (standard chart of accounts)
- Account code uniqueness enforcement per tenant
- Proper error handling for missing accounts, unbalanced entries, duplicate codes

## Use Cases
- **Double-Entry Bookkeeping:** Record every financial event as balanced debit/credit journal entries
- **Financial Reporting:** Generate trial balance, balance sheet, and P&L on demand
- **Trip Revenue Recognition:** Automatically record trip revenue with commission splitting
- **Escrow Management:** Lock/release partner funds with full audit trail
- **Carbon Credit Rewards:** Award QCoins for green trips (solar battery swaps)
- **Commission Rules:** Configure commission rates per tenant and calculate on trip amounts
- **Audit Trail:** Full traceability from journal entry → GL impact → financial report

## Available Endpoints

### GL Accounts
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/accounts` | Create GL account |
| GET | `/ledger/accounts` | List accounts (`?tenantId=&pageNumber=1&pageSize=50`) |
| GET | `/ledger/accounts/tree` | Hierarchical account tree |
| GET | `/ledger/accounts/:id` | Get account details |
| PATCH | `/ledger/accounts/:id` | Update account fields |
| GET | `/ledger/accounts/sub-ledger/:id/daily-total` | Daily total for sub-ledger |
| GET | `/ledger/accounts/sub-ledger/:id/balance` | Sub-ledger balance |

**POST /ledger/accounts payload:**
```json
{
  "code": "CASH-001",
  "name": "Cash at Bank",
  "type": "asset",
  "tenantId": "tenant-001",
  "currency": "USD",
  "parentId": "optional-parent-uuid"
}
```

### Posting
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/posting/transaction` | Post balanced double-entry transaction |
| GET | `/ledger/posting/transaction/:id` | Get transaction by ID |
| GET | `/ledger/posting/reference/:ref` | Get transaction by reference |

**POST /ledger/posting/transaction payload:**
```json
{
  "reference": "TRIP-2026-000001",
  "description": "Trip fare: Driver D001 → Rider R001",
  "postingDate": "2026-06-02",
  "currency": "USD",
  "tenantId": "tenant-001",
  "entries": [
    { "glAccountId": "uuid-1", "amount": 42.50, "side": "DEBIT", "subLedgerId": "cust-uuid" },
    { "glAccountId": "uuid-2", "amount": 42.50, "side": "CREDIT", "subLedgerId": "driver-uuid" }
  ]
}
```

### Transactions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/transactions` | Post new transaction |
| GET | `/ledger/transactions` | List transactions (paginated, filterable) |
| GET | `/ledger/transactions/:id` | Get by ID |
| GET | `/ledger/transactions/reference/:ref` | Get by reference |

### Audit Trail
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/ledger/audit/trail` | List audit entries (paginated) |
| GET | `/ledger/audit/trail/:reference` | Full audit trail by reference |
| GET | `/ledger/audit/gl-impact/:journalId` | GL debit/credit impact |
| GET | `/ledger/audit/balance-sheet` | Balance sheet report |
| GET | `/ledger/audit/profit-loss` | Profit & loss statement |
| GET | `/ledger/audit/trial-balance` | Trial balance report |

### Revenue
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/revenue/trip` | Record trip revenue |
| GET | `/ledger/revenue/trip/:tripId` | Get trip financial record |
| GET | `/ledger/revenue/trips` | List trip records (paginated) |
| GET | `/ledger/revenue/summary` | Aggregated revenue summary |

### Commissions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/commissions/calculate` | Calculate commission for amount |
| POST | `/ledger/commissions/rules` | Create commission rule |
| GET | `/ledger/commissions/rules` | List commission rules |
| PATCH | `/ledger/commissions/rules/:id` | Update commission rule |
| DELETE | `/ledger/commissions/rules/:id` | Delete commission rule |

### Coin Rewards
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/ledger/coin-reward/award-trip` | Award QCoins for trip |
| GET | `/ledger/coin-reward/balance/:entityType/:entityId` | Get coin balance |
| GET | `/ledger/coin-reward/wallet/:entityType/:entityId` | Get wallet details |
| GET | `/ledger/coin-reward/transactions/:walletId` | List coin transactions |
| GET | `/ledger/coin-reward/wallets` | List all wallets |

### Escrow
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/escrow/wallet` | Create escrow wallet |
| POST | `/escrow/lock` | Lock funds in escrow |
| POST | `/escrow/release` | Release funds from escrow |
| POST | `/escrow/admin-override` | Admin override on wallet |
| GET | `/escrow/wallets` | List all wallets |
| GET | `/escrow/wallet/:partnerId` | Get wallet by partner |
| GET | `/escrow/wallet/id/:walletId` | Get wallet by ID |
| GET | `/escrow/summary` | Aggregated balance summary |

### Fare & Remittance Config
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/site-wide-fare-config` | Upsert fare config |
| GET | `/site-wide-fare-config` | Get all fare configs |
| GET | `/site-wide-fare-config/:key` | Get fare config by key |
| DELETE | `/site-wide-fare-config/:key` | Delete fare config |
| POST | `/site-wide-fare-config/seed` | Seed default configs |
| POST | `/tenant-remittance-config` | Upsert remittance config |
| GET | `/tenant-remittance-config` | Get tenant configs |
| GET | `/tenant-remittance-config/driver/:id` | Get driver config |
| GET | `/tenant-remittance-config/default` | Get default config |
| DELETE | `/tenant-remittance-config/:configId` | Delete config |
| GET | `/tenant-remittance-config/due` | Get due configs |
