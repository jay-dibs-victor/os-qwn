# Accounts Service — Milestone

## Port
`3005`

## What Has Been Done
- Bank account creation and management for customers
- Account status lifecycle: ACTIVE → SUSPENDED → CLOSED
- Debit/credit restriction checking per account
- KYC limit enforcement on transactions
- Single and batch posting to accounts
- Posting history with full audit trail
- Balance reconciliation

## Feature Enhancements
- Batch posting support for efficient bulk operations
- KYC limits query with transaction amount validation
- Restriction checking before any debit/credit operation
- Account number-based lookup for consistent referencing

## Stability
- ValidationPipe globally applied
- Status lifecycle enforcement (cannot reactivate CLOSED)
- Check-before-act pattern: restriction + KYC limits verified before posting

## Use Cases
- **Customer Onboarding:** Create bank accounts linked to customer profiles
- **Transaction Posting:** Apply debits/credits with pre-checks
- **KYC Compliance:** Verify transaction amounts against customer KYC tier limits
- **Reconciliation:** Compare calculated vs. actual balances

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/accounts` | Create a new bank account |
| GET | `/accounts/:accountNumber` | Get account details |
| GET | `/accounts/customer/:customerId` | List accounts for a customer |
| PATCH | `/accounts/:accountNumber/status` | Update account status (ACTIVE/SUSPENDED/CLOSED) |
| GET | `/accounts/:accountNumber/check-restriction` | Check debit/credit restrictions |
| GET | `/accounts/:accountNumber/check-kyc-limits` | Verify KYC limits for transaction amount |
| POST | `/accounts/:accountNumber/postings/apply` | Apply posting to account |
| POST | `/accounts/postings/apply-batch` | Apply multiple postings in batch |
| GET | `/accounts/:accountNumber/postings/history` | List posting history |
| GET | `/accounts/:accountNumber/reconcile` | Reconcile account balance |

**POST /accounts payload:**
```json
{
  "customerId": "cust-uuid",
  "accountType": "SAVINGS",
  "currency": "NGN",
  "tenantId": "tenant-001"
}
```
