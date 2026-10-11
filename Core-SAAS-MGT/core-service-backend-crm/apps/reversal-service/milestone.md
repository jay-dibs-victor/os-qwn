# Reversal Service — Milestone

## Port
`3008`

## What Has Been Done
- Transaction reversal management: FULL_REVERSAL, PARTIAL_REVERSAL, CHARGEBACK
- Mirror-image GL posting (inverts original debits/credits) on reversal
- Auto-execution for reversals ≤ $100,000
- Large reversals (>$100,000) require external approval
- Event publishing for reversal lifecycle events
- PermissionsGuard with `@Permissions('reversal.create')`

## Feature Enhancements
- Automatic vs. manual approval based on amount threshold
- Full reversal (entire amount) and partial reversal (specified amount) support
- Chargeback type for disputed transactions
- Original transaction lookup for mirror posting

## Stability
- ValidationPipe globally applied
- Amount validation: partial amount must not exceed original amount
- PermissionsGuard protects creation endpoint
- Event-driven notifications for async processing

## Use Cases
- **Error Correction:** Reverse transactions processed in error
- **Dispute Resolution:** Process chargebacks for contested transactions
- **Partial Refunds:** Reverse only a portion of the original amount
- **Compliance:** Full audit trail for every reversal with GL impact

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/reversal` | Create reversal (full/partial/chargeback) |
| GET | `/reversal/:id` | Get reversal by ID |

**POST /reversal payload:**
```json
{
  "originalTransactionRef": "PAY-2026-00001",
  "type": "FULL_REVERSAL",
  "tenantId": "tenant-001",
  "reason": "Duplicate payment processed",
  "initiatedBy": "admin-uuid"
}
```

**POST /reversal payload (partial):**
```json
{
  "originalTransactionRef": "PAY-2026-00002",
  "type": "PARTIAL_REVERSAL",
  "amount": 5000.00,
  "tenantId": "tenant-001",
  "reason": "Partial refund for overcharge",
  "initiatedBy": "admin-uuid"
}
```
