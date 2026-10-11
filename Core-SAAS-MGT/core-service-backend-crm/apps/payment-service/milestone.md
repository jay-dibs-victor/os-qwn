# Payment Service — Milestone

## Port
`3006`

## What Has Been Done
- Payment initiation and processing across 4 rails (INTERNAL, ACH, WIRE, CARD)
- Idempotency support via `Idempotency-Key` header to prevent duplicate processing
- Trip payment flow: initiate → verify → complete with commission splitting
- Paystack gateway integration for external payment processing
- Payment history with pagination and date-range filtering
- Commission calculation endpoint for trip fares
- GL double-entry posting on payment completion
- Swagger documentation with real payload examples

## Feature Enhancements
- Fixed missing `@ApiBody` import in payment controller for Swagger decorators
- Idempotency key ensures safe retries without double-charging
- Multiple payment rails with consistent response format
- Commission breakdown calculated and returned separately

## Stability
- Global ValidationPipe with whitelist enabled
- Idempotency-key prevents duplicate processing
- Trip payment flow validates upstream (commission calculation, GL posting)
- Separate controller concerns: general payments vs. trip payments

## Use Cases
- **Internal Transfer:** Move funds between platform accounts (no external rail)
- **Third-Party Payments:** Process ACH, WIRE, or CARD payments via Paystack
- **Trip Payment Lifecycle:** Initiate from fare → verify with gateway → complete with commission split
- **Payment Reconciliation:** Audit trail via `GET /payments/:id` and history endpoints

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/payments/internal-transfer` | Internal book transfer between internal accounts |
| POST | `/payments` | Initiate payment via chosen rail (INTERNAL/ACH/WIRE/CARD) |
| GET | `/payments/:id` | Retrieve payment by ID |
| GET | `/payments/history` | Paginated payment history with date range |
| GET | `/payments` | List payments with filtering (status, rail, tenant, source) |
| POST | `/payments/trip/initiate` | Initiate trip payment via payment gateway |
| POST | `/payments/trip/verify` | Verify trip payment using Paystack reference |
| POST | `/payments/trip/:tripId/complete` | Complete trip payment and disburse funds |
| GET | `/payments/trip/calculate-commission` | Calculate commission breakdown for trip fare |
| GET | `/payments/trip/:reference` | Get transaction by reference |
| GET | `/payments/trip/trip/:tripId` | Get all payments for a trip |

**POST /payments payload:**
```json
{
  "amount": 5000.00,
  "currency": "NGN",
  "rail": "INTERNAL",
  "sourceAccount": "ACC-001",
  "destinationAccount": "ACC-002",
  "reference": "PAY-2026-00001",
  "tenantId": "tenant-001",
  "description": "Commission settlement",
  "metadata": { "tripId": "TRIP-001" }
}
```
