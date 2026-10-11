# KYC Service — Milestone

## Port
`3010`

## What Has Been Done
- KYC record creation for customer identity management
- Identity verification using BVN (Bank Verification Number) and NIN (National Identification Number)
- Document submission for proof of identity, address, etc.
- Liveness detection with scoring mechanism
- KYC record lifecycle: created → verified → submitted
- Event publishing for KYC lifecycle events
- Database seeder runs on startup

## Feature Enhancements
- Dual verification: BVN and NIN for robust identity proofing
- Liveness score threshold configuration
- Document association with KYC records for audit trail
- Event-driven notifications on KYC status changes

## Stability
- ValidationPipe globally applied
- KYC status guards prevent re-verification of already verified records
- Tenant-isolated KYC records

## Use Cases
- **Customer Onboarding:** Collect and verify identity documents for new customers
- **Regulatory Compliance:** Meet KYC requirements with BVN/NIN verification
- **Fraud Prevention:** Liveness detection prevents spoofing attempts
- **Audit Trail:** Full document and verification history per customer

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/kyc` | Create KYC record for a customer |
| POST | `/kyc/:id/verify` | Verify identity using BVN and NIN |
| POST | `/kyc/:id/submit` | Submit KYC record for review |
| POST | `/kyc/:id/liveness` | Complete liveness check with score |

**POST /kyc payload:**
```json
{
  "customerId": "driver-uuid",
  "tenantId": "tenant-001",
  "idType": "BVN",
  "idNumber": "22334455667",
  "documentUrls": {
    "idFront": "https://res.cloudinary.com/.../id_front.jpg",
    "idBack": "https://res.cloudinary.com/.../id_back.jpg"
  }
}
```

**POST /kyc/:id/verify payload:**
```json
{
  "bvn": "22334455667",
  "nin": "12345678901"
}
```

**POST /kyc/:id/liveness payload:**
```json
{
  "score": 0.92,
  "videoUrl": "https://res.cloudinary.com/.../liveness.mp4"
}
```
