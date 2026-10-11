# Wallet Service — Milestone

## Port
`3015`

## What Has Been Done
- Wallet transactions: transfer, funding, withdrawal with full audit trail
- QCoin exchange (buy/sell) for carbon credit rewards
- Fraud detection engine with rule evaluation and flag review
- Payment dispute management (create, list, get, resolve)
- Cash payment recording and bank transfer with dual confirmation
- Driver debt tracking with configurable thresholds
- Driver ledger with running balance and entry history
- Scheduler for automated remittance and savings processing
- Remittance scheduling with admin override capability
- Driver savings plans with contributions, early withdrawal, and maturity
- Partner settlement processing with balance tracking
- Driver earnings recording and payout management
- Database seeder runs on startup
- 11 controllers covering all wallet operations

## Feature Enhancements
- Comprehensive driver financial hub: debt, savings, earnings, ledger, remittance
- Fraud detection with review workflow for flagged drivers
- Bank transfer dual confirmation (initiate → confirm) for security
- Remittance scheduler with admin override for exceptional cases
- Savings plans with early withdrawal penalty logic
- Partner settlements with balance tracking per partner
- QCoin exchange enables green initiative rewards

## Stability
- Global ValidationPipe with transform enabled
- Tenant isolation via `x-tenant-id` header
- Fraud evaluation before high-risk operations
- Debt threshold prevents excessive driver borrowing
- Dual-confirmation for bank transfers

## Use Cases
- **Driver Financial Management:** Track earnings, debts, savings, and remittances
- **Partner Settlements:** Process and track partner payouts
- **Fraud Prevention:** Evaluate and flag suspicious driver activity
- **Green Rewards:** QCoin exchange incentivizes eco-friendly behavior
- **Automated Processing:** Scheduler handles overdue remittances and matured savings
- **Dispute Resolution:** Manage payment disputes end-to-end

## Available Endpoints

### Wallet Core
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/wallet/transactions` | List wallet transactions (paginated, filterable) |
| POST | `/wallet/transfer` | Transfer between wallets |
| POST | `/wallet/funding` | Fund a wallet |
| POST | `/wallet/withdrawal` | Withdraw from wallet |
| POST | `/wallet/qcoin-exchange` | Buy or sell QCoin |

### Fraud Detection
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/wallet/fraud/flags` | List fraud detection flags |
| POST | `/wallet/fraud/evaluate/:driverCustomerId` | Evaluate driver for fraud |
| POST | `/wallet/fraud/flags/:id/review` | Review a fraud flag |

### Disputes
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/disputes` | Create a payment dispute |
| GET | `/wallet/disputes` | List payment disputes |
| GET | `/wallet/disputes/:id` | Get dispute details |
| POST | `/wallet/disputes/:id/resolve` | Resolve a dispute |

### Payments
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/payments/cash` | Record cash payment |
| POST | `/wallet/payments/bank-transfer` | Initiate bank transfer |
| POST | `/wallet/payments/bank-transfer/confirm` | Confirm bank transfer |

### Driver Debt
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/wallet/drivers/debt` | List driver debts |
| GET | `/wallet/drivers/debt/:driverCustomerId` | Get driver debt detail |
| GET | `/wallet/drivers/debt/:driverCustomerId/check` | Check driver debt status |
| POST | `/wallet/drivers/debt/settle` | Manually settle driver debt |
| POST | `/wallet/drivers/debt/:driverCustomerId/threshold` | Update driver debt threshold |

### Driver Ledger
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/wallet/drivers/ledger/:driverCustomerId` | Get driver ledger entries |
| GET | `/wallet/drivers/ledger/:driverCustomerId/balance` | Get driver balance |
| POST | `/wallet/drivers/ledger` | Record driver ledger entry |

### Scheduler
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/scheduler/remittance/process-overdue` | Process overdue remittances |
| POST | `/wallet/scheduler/savings/disburse-mature` | Disburse mature savings |
| POST | `/wallet/scheduler/savings/disburse-weekly` | Disburse weekly savings |
| POST | `/wallet/scheduler/savings/disburse-monthly` | Disburse monthly savings |

### Remittance
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/remittance/schedule` | Create a remittance schedule |
| POST | `/wallet/remittance/:scheduleId/process` | Process a remittance schedule |
| POST | `/wallet/remittance/process-due` | Process due remittances |
| POST | `/wallet/remittance/admin-override` | Admin override for remittance |
| GET | `/wallet/remittance/pending` | Get pending remittances |
| GET | `/wallet/remittance/all` | Get all remittance schedules |
| GET | `/wallet/remittance/schedule/:scheduleId` | Get a remittance schedule |
| GET | `/wallet/remittance/summary` | Get remittance summary |

### Driver Savings
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/driver-savings/plan` | Create a savings plan |
| POST | `/wallet/driver-savings/contribute` | Record a contribution |
| POST | `/wallet/driver-savings/early-withdrawal` | Process early withdrawal |
| POST | `/wallet/driver-savings/cancel` | Cancel a savings plan |
| GET | `/wallet/driver-savings/plans` | Get all savings plans |
| GET | `/wallet/driver-savings/plans/:driverCustomerId` | Get driver savings plans |
| GET | `/wallet/driver-savings/plan/:planId` | Get a savings plan |
| GET | `/wallet/driver-savings/summary` | Get savings summary |

### Partner Settlements
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/partner-settlements` | Create a settlement |
| POST | `/wallet/partner-settlements/settle` | Settle a partner |
| GET | `/wallet/partner-settlements/partner/:partnerId/balance` | Get partner balance |
| GET | `/wallet/partner-settlements` | List partner settlements |

### Driver Earnings
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/wallet/driver-earnings/record` | Record a driver earning |
| POST | `/wallet/driver-earnings/:id/payout` | Payout a driver |
| GET | `/wallet/driver-earnings/driver/:driverCustomerId` | Get driver earnings |
| GET | `/wallet/driver-earnings/summary` | Get earnings summary |
| GET | `/wallet/driver-earnings` | List all driver earnings |
