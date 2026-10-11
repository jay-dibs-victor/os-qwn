# Loan Service — Milestone

## Port
`3013`

## What Has Been Done
- Loan product configuration with provisioning rates per DPD bucket
- Full loan lifecycle: application → approval → disbursement → repayment
- Interest accrual engine for outstanding loan accounts
- Delinquency classification based on Days Past Due (DPD)
- Loan loss provisioning with GL account mappings
- Event publishing for loan lifecycle events
- Database seeder runs on startup for test data

## Feature Enhancements
- Provisioning rates configurable per DPD bucket (current, 30-60d, 60-90d, 90-180d, 180-360d, 360d+)
- GL account mappings for provisioning entries
- Interest accrual computed on outstanding principal
- Delinquency classification automates provisioning triggers

## Stability
- ValidationPipe globally applied
- Loan application status checks before approval/disbursement
- Database seeder idempotently creates loan products on startup
- Event-based architecture for async processing

## Use Cases
- **Micro-Loans:** Offer small loans to drivers/partners with automated lifecycle
- **Interest Accrual:** Daily accrual computations for accurate P&L reporting
- **Risk Management:** Classify delinquent loans and provision for potential losses
- **Product Configuration:** Define interest rates, tenures, and provisioning per product

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/loan-products` | Create loan product with provisioning rates and GL mappings |
| POST | `/loan-applications` | Apply for a loan |
| POST | `/loan-applications/:id/approve` | Approve loan application |
| POST | `/loan-applications/:id/disburse` | Disburse approved loan amount |
| POST | `/loan-accounts/:id/accrue` | Accrue interest on loan account |
| POST | `/loan-accounts/:id/repay` | Make a loan repayment |
| POST | `/loan-accounts/:id/classify-delinquency` | Classify delinquency based on DPD |
| POST | `/loan-accounts/:id/provision` | Create loan loss provision entry |

**POST /loan-products payload:**
```json
{
  "name": "Driver Swift Loan",
  "description": "Short-term loan for Swift-tier drivers",
  "interestRate": 0.05,
  "tenureDays": 30,
  "maxAmount": 500000,
  "tenantId": "tenant-001",
  "provisioningRates": {
    "CURRENT": 0.01,
    "DPD_30_60": 0.05,
    "DPD_60_90": 0.10,
    "DPD_90_180": 0.25,
    "DPD_180_360": 0.50,
    "DPD_360_PLUS": 1.00
  },
  "glProvisionAccountId": "gl-account-uuid"
}
```

**POST /loan-applications payload:**
```json
{
  "customerId": "driver-uuid",
  "productId": "loan-product-uuid",
  "amount": 200000,
  "tenorDays": 30,
  "currency": "NGN",
  "purpose": "Vehicle maintenance",
  "tenantId": "tenant-001"
}
```
