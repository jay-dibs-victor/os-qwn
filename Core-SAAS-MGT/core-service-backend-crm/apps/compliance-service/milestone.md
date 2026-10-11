# Compliance Service — Milestone

## Port
`3011`

## What Has Been Done
- Anti-Money Laundering (AML) rule management with CRUD operations
- AML rule types: threshold-based (amount limits) and pattern-based (transaction patterns)
- Transaction monitoring/screening against AML rules
- Suspicious Activity Report (SAR) filing with evidence
- Compliance dashboard with metrics (total rules, alerts, SAR count, pending reviews)
- Sanctions screening service integration
- Event publishing for compliance events

## Feature Enhancements
- Severity levels for AML rules (LOW, MEDIUM, HIGH, CRITICAL) with auto-escalation
- Condition-based rules supporting flexible expressions
- Dashboard aggregates compliance posture at a glance
- Event-driven architecture for async alert processing

## Stability
- ValidationPipe globally applied
- Tenant-scoped AML rules and alerts
- Rule evaluation handles overlapping/multiple rule matches

## Use Cases
- **AML Screening:** Screen transactions against configurable AML rules in real-time
- **SAR Filing:** Document and submit suspicious activity reports with full evidence
- **Compliance Dashboard:** Monitor compliance posture with key metrics
- **Sanctions Screening:** Check customers/transactions against sanctions lists

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/aml-rules` | Create AML rule (threshold/pattern, severity, conditions) |
| POST | `/monitor` | Monitor/screen a transaction against AML rules |
| POST | `/sars` | File a Suspicious Activity Report (SAR) |
| GET | `/dashboard/:tenantId` | Get compliance dashboard metrics |

**POST /aml-rules payload:**
```json
{
  "name": "High-value wire alert",
  "type": "threshold",
  "severity": "HIGH",
  "conditions": { "minAmount": 1000000, "rail": "WIRE" },
  "tenantId": "tenant-001",
  "active": true
}
```

**POST /monitor payload:**
```json
{
  "transactionRef": "TX-001",
  "amount": 1500000,
  "currency": "NGN",
  "senderId": "cust-uuid",
  "receiverId": "other-uuid",
  "rail": "WIRE",
  "tenantId": "tenant-001"
}
```

**POST /sars payload:**
```json
{
  "tenantId": "tenant-001",
  "transactionRef": "TX-001",
  "subjectId": "cust-uuid",
  "reason": "Unusual large wire transfer inconsistent with profile",
  "evidence": { "ruleMatches": ["rule-uuid"], "transactionHistory": [] }
}
```
