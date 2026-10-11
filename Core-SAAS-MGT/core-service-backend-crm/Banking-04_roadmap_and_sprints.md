# Product Roadmap & Sprint Plan
## Core Banking SaaS — Jan 5, 2023 → Sept 30, 2025
### Restructured: May 2026 — Timeline extended to complete all 27 microservices

---

## What Has Been Built (Completed Sprints)

| Period | Service(s) | Status |
|---|---|---|
| Jan 5–31, 2023 | Docker Infra · API Gateway · @app/common | ✅ DONE |
| Feb 5 – Mar 4, 2023 | Auth Service (JWT, OAuth2, MFA) | ✅ DONE |
| Mar 5 – Apr 4, 2023 | RBAC Service | ✅ DONE |
| Apr 5 – May 15, 2023 | Ledger Service (ACID + Event Sourcing + EOD) | ✅ DONE |
| May 16 – Jun 22, 2023 | Accounts Service (lifecycle + PND checks + KYC limits) | ✅ DONE |
| Jun 23 – Jul 6, 2023 | Payment Service: Core entities + internal transfer | ✅ DONE |
| Jul 7–21, 2023 | Payment Service: NIBSS + RTGS + SWIFT + Smart Routing + Liquidity | ✅ DONE |
| Jul 22–24, 2023 | Payment Service: Enum refactor + Node 16 polyfill + README | ✅ DONE |
| Apr 1–28, 2024 | Payment Service: Status endpoints · Events · SLA · Recurring | ✅ DONE |
| May 9 – Jun 2, 2024 | Batch Service: Bulk ingestion · Processor · Approval gate | ✅ DONE |

---

## Completed SPRINT: April 2024 — Payment Service Completion
> **Apr 1–28, 2024** | 25 working days | Sprint break: Apr 29 – May 8

### Implementation Details
- [x] **Week 1**: Status/listing endpoints (`GET /payments`, `QueryPaymentDto`).
- [x] **Week 2**: RabbitMQ event emission (`PaymentEventsPublisher`) + Approval threshold (100k).
- [x] **Week 3**: `PaymentSlaService` (monitoring TTL) + `ScheduledPaymentService` (recurring transfers).
- [x] **Week 4**: Swagger/OpenAPI docs (`ApiProperty`) + Unit tests (`PaymentServiceService`).

**Sprint Break: Apr 29 – May 8, 2024** (10 days)

---

## Completed SPRINT: May 2024 — Batch Service
> **May 9 – Jun 2, 2024** | 25 working days | Sprint break: Jun 3–12

### Implementation Details
- [x] **Week 1**: `BatchJob` & `BatchItem` entities + CSV/JSON ingestion endpoints.
- [x] **Week 2**: Balance check (via payment call) + Partial success handler + Approval gate.
- [x] **Week 3**: `BatchCompletedEvent` logging + Retry logic for failed batch items.
- [x] **Week 4**: Swagger/OpenAPI docs + E2E infrastructure in Docker.

**Sprint Break: Jun 3–12, 2024** (10 days)

---

## LONG BREAK: Jun 13 – Aug 4, 2024 (~8 weeks)
> Project pause. Resume Aug 5, 2024.

---

## SPRINT: Aug 2024 — Reversal Service| can be done as single reversals  or batch upload reversals
> **Aug 5–29, 2024** | 25 days | Sprint break: Aug 30 – Sep 8

```
Week 1 (Aug 5–11):  ReversalRecord entity + reason codes
                    Full reversal: mirror all ledger legs (inverted)
                    Commits: ~9 commits

Week 2 (Aug 12–18): Partial reversal logic
                    Chargeback workflow (external)
                    Role-based authorization: REVERSAL_OFFICER
                    Commits: ~10 commits

Week 3 (Aug 19–25): Approval gate for reversals > ₦100k
                    Original ↔ Reversal transaction linkage
                    Commits: ~9 commits

Week 4 (Aug 26–29): Unit + integration tests + Swagger
                    Commits: ~8 commits
```

**Sprint Break: Aug 30 – Sep 8, 2024** (10 days)

---

## SPRINT: Sep 2024 — Retry Service: Retry batch upload (All or none approach if there was a failed batch payment we must ensure that debit ledger entry is reverted for the entire batch has corresponding credit entries else we must revert the entire batch payment this can be automated if setting api enables it or manually triggered by the approver) but for reversals it must be done on the  transaction level not batch level because reversal is done on the transaction level only. but we can  batch upload reversals to the reversal service and process it as a batch. 
> **Sep 9 – Oct 3, 2024** | 25 days | Sprint break: Oct 4–13

```
Week 1 (Sep 9–15):  RetryRecord entity (attempt_count, last_attempt_at, next_attempt_at)
                    Exponential backoff engine: 0s → 30s → 2m → 10m → 1h
                    Commits: ~9 commits

Week 2 (Sep 16–22): Dead-letter queue integration
                    Saga compensation orchestration
                    Commits: ~10 commits

Week 3 (Sep 23–29): Balance restoration on max retry exceeded
                    TransactionFailedEvent → audit + notification
                    Commits: ~9 commits

Week 4 (Sep 30 – Oct 3): Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Oct 4–13, 2024** (10 days)

---

## SPRINT: Oct 2024 — KYC Service and biometrics recognition onboarding
> **Oct 14 – Nov 7, 2024** | 25 days | Sprint break: Nov 8–17

```
Week 1 (Oct 14–20): KYC tiers (Tier 1/2/3) + KycRecord entity & biometrics recognition onboarding (facial recognition and liveness detection using api free apis if they dont exist we build one with python ml) 
                    BVN/NIN verification via NIBSS API stub
                    Commits: ~9 commits

Week 2 (Oct 21–27): Document OCR + liveness detection stub
                    PEP/sanctions watchlist screening
                    Commits: ~10 commits

Week 3 (Oct 28 – Nov 3): kyc.submitted / kyc.approved / kyc.rejected events
                    Tier upgrade triggers account limit update
                    Commits: ~9 commits

Week 4 (Nov 4–7):   Unit tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Nov 8–17, 2024** (10 days)

---

## SPRINT: Nov 2024 — Compliance Service (AML)
> **Nov 18 – Dec 12, 2024** | 25 days | Sprint break: Dec 13–22

```
Week 1 (Nov 18–24): AML rules engine (rule entity + evaluator)
                    SAR (Suspicious Activity Report) filing entity
                    Commits: ~9 commits

Week 2 (Nov 25 – Dec 1): Transaction monitoring (velocity, structuring patterns)
                    Sanctions screening integration stub
                    Commits: ~10 commits

Week 3 (Dec 2–8):   Data retention policy enforcement
                    ComplianceAlertEvent → RabbitMQ → audit
                    Commits: ~9 commits

Week 4 (Dec 9–12):  Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Dec 13–22, 2024** (10 days)
**Holiday Break: Dec 23, 2024 – Jan 5, 2025** (2 weeks)

---

## SPRINT: Jan 2025 — Audit Service
> **Jan 6–30, 2025** | 25 days | Sprint break: Jan 31 – Feb 9

```
Week 1 (Jan 6–12):  AuditLog entity (append-only, INSERT ONLY)
                    RabbitMQ consumer: subscribe to all service events
                    Commits: ~9 commits

Week 2 (Jan 13–19): Forensic replay endpoint
                    Actor tracing: user → action → resource → outcome
                    Commits: ~10 commits

Week 3 (Jan 20–26): Regulatory export (CSV/PDF on demand)
                    Tamper-proof hash chaining
                    Commits: ~9 commits

Week 4 (Jan 27–30): Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Jan 31 – Feb 9, 2025** (10 days)

---

## SPRINT: Feb 2025 — Loan Service
> **Feb 10 – Mar 6, 2025** | 25 days | Sprint break: Mar 7–16

```
Week 1 (Feb 10–16): LoanApplication + LoanAccount + RepaymentSchedule entities
                    State machine: APPLIED → APPROVED → DISBURSED
                    Commits: ~9 commits

Week 2 (Feb 17–23): Interest accrual engine (reducing balance + flat rate + daily)
                    Repayment engine (EMI, bullet, partial payments)
                    Commits: ~10 commits

Week 3 (Feb 24 – Mar 2): Delinquency handler + DPD classification
                    loan.disbursed / loan.repayment.received events
                    Commits: ~9 commits

Week 4 (Mar 3–6):   Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Mar 7–16, 2025** (10 days)

---

## SPRINT: Mar 2025 — Overdraft Service
> **Mar 17 – Apr 10, 2025** | 25 days | Sprint break: Apr 11–20

```
Week 1 (Mar 17–23): OD facility entity + authorized/temporary OD types
                    Limit management + expiry dates
                    Commits: ~9 commits

Week 2 (Mar 24–30): Daily interest accrual on utilized amount only
                    Auto-recovery on credit arrival
                    Commits: ~10 commits

Week 3 (Mar 31 – Apr 6): GL impact: DR Overdraft Receivable / CR Customer GL
                    Channel restrictions for OD usage
                    Commits: ~9 commits

Week 4 (Apr 7–10):  Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Apr 11–20, 2025** (10 days)

---

## SPRINT: Apr 2025 — Collections Service
> **Apr 21 – May 15, 2025** | 25 days | Sprint break: May 16–25

```
Week 1 (Apr 21–27): DPD bucket tracker (0 / 1-30 / 31-60 / 61-89 / 90+)
                    Automated SMS/email dunning triggers
                    Commits: ~9 commits

Week 2 (Apr 28 – May 4): Agent assignment engine
                    Agent dashboard data endpoints
                    Commits: ~10 commits

Week 3 (May 5–11):  Legal escalation pipeline
                    Write-off + recovery tracking
                    Commits: ~9 commits

Week 4 (May 12–15): Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: May 16–25, 2025** (10 days)

---

## SPRINT: May 2025 — Fraud Service
> **May 26 – Jun 19, 2025** | 25 days | Sprint break: Jun 20–29

```
Week 1 (May 26 – Jun 1): FraudScore engine (velocity + geo + device + amount)
                    Real-time scoring pipeline
                    Commits: ~9 commits

Week 2 (Jun 2–8):   Score-based action: allow / step-up / block blacklist, whitelist  / FRAUD_PND
                    fraud.alert.raised → pnd-service + audit
                    Commits: ~10 commits

Week 3 (Jun 9–15):  Behavioral pattern detection (structuring, unusual hours)
                    Fraud case management entity
                    Commits: ~9 commits

Week 4 (Jun 16–19): Tests + Swagger
                    Commits: ~7 commits
```

**Sprint Break: Jun 20–29, 2025** (10 days)

---

## SPRINT: Jun–Jul 2025 — Notification + Dispute + Tenant Services
> **Jun 30 – Jul 31, 2025** | 32 days | Sprint break: Aug 1–10

```
Week 1 (Jun 30 – Jul 6): notification-service
                    RabbitMQ subscriber: all payment/loan/fraud events
                    SMS + Email + Push channels
                    NotificationTemplate + NotificationLog entities
                    Commits: ~10 commits

Week 2 (Jul 7–13):  dispute-service
                    DisputeCase entity + state machine
                    Evidence upload + SLA tracking
                    Commits: ~10 commits

Week 3 (Jul 14–20): tenant-service
                    Tenant isolation (schema-per-tenant)
                    Per-tenant config + billing model
                    Commits: ~10 commits

Week 4 (Jul 21–31): Tests + Swagger for all 3 services
                    Commits: ~12 commits
```

**Sprint Break: Aug 1–10, 2025** (10 days)

---

## SPRINT: Aug–Sep 2025 — Identity + Consent + Session + Reconciliation + Final Hardening
> **Aug 11 – Sep 30, 2025** | 51 days — Final sprint to complete platform

```
Week 1 (Aug 11–17): identity-service
                    UserProfile + IdentityLink (BVN/NIN hashed)
                    Device tracking + trust scoring
                    Commits: ~10 commits

Week 2 (Aug 18–24): consent-service
                    ConsentGrant entity + scope management
                    Revocation + time-bound expiry + audit trail
                    Commits: ~10 commits

Week 3 (Aug 25–31): session-service
                    ActiveSession entity + concurrent session limits
                    Remote session kill → auth-service revocation
                    Commits: ~9 commits

Week 4 (Sep 1–7):   reconciliation-service
                    Internal GL vs sub-ledger reconciliation (daily)
                    External payment provider matching
                    Exception queue
                    Commits: ~10 commits

Week 5 (Sep 8–14):  pnd-service (standalone microservice)
                    4 PND types: BANK / FRAUD / USER / LEGAL
                    Channel-level restrictions
                    Decouple from accounts-service into own service
                    Commits: ~10 commits

Week 6 (Sep 15–21): approval-service enhancements
                    Multi-level + parallel + sequential approval
                    Dynamic routing + SLA escalation
                    Sandbox workflow testing
                    Commits: ~9 commits

Week 7 (Sep 22–30): Full platform integration tests
                    10,000 TPS benchmark tests
                    Ledger balance invariant assertions
                    Docker Compose final hardening
                    All Swagger docs complete
                    Commits: ~15 commits
```

---

## Full Milestone KPIs (Updated)

| Milestone | Target Date | Success Criteria |
|---|---|---|
| API Gateway Live | Jan 31, 2023 | All routes routable, rate limiting active ✅ |
| Auth MVP | Mar 4, 2023 | OAuth 2.0, MFA, token rotation secure ✅ |
| RBAC Live | Apr 4, 2023 | Maker-checker enforced, ABAC < 10ms ✅ |
| Ledger MVP | May 15, 2023 | Zero balance drift in 10,000 test TXs ✅ |
| Accounts + PND | Jun 22, 2023 | All states reachable, PND blocks TX ✅ |
| Payment Service Core | Jul 24, 2023 | Internal + NIBSS + RTGS + SWIFT + routing ✅ |
| **Payment Service Complete** | **Apr 28, 2024** | Status endpoints, events, SLA, tests |
| Batch Service | Jun 2, 2024 | Bulk payroll processed with approval gate |
| Reversal Service | Aug 29, 2024 | Full/partial reversals with ledger compensation |
| Retry + Recovery | Oct 3, 2024 | Saga compensation on max retries |
| KYC Service | Nov 7, 2024 | Tier 1/2/3 enforced, watchlist screening |
| Compliance (AML) | Dec 12, 2024 | SAR filing, velocity rules firing |
| Audit Service | Jan 30, 2025 | Append-only, forensic replay, regulatory export |
| Loan Service | Mar 6, 2025 | Full lifecycle, accrual, delinquency |
| Overdraft Service | Apr 10, 2025 | Daily accrual, auto-recovery, GL postings |
| Collections Service | May 15, 2025 | DPD buckets, dunning, legal escalation |
| Fraud Service | Jun 19, 2025 | Real-time scoring, FRAUD_PND trigger |
| Notification + Dispute + Tenant | Jul 31, 2025 | Multi-channel notif, dispute SLA, tenant isolation |
| **Full Platform** | **Sep 30, 2025** | All 27 services live, 10k TPS benchmark |

---

## Commit Standards (Always Active)

```
feat(service-name): <description of what was implemented>
test(service-name): <unit/integration test added>
docs(service-name): <swagger/readme updated>
fix(service-name):  <bug fixed>
chore(infra):       <docker/config changes>
refactor(service):  <code improvement without behavior change>

Rules:
  ONE file = ONE commit.
  50min – 5hr per file depending on complexity.
  7–10 commits to complete a single file's full intent.
  NO batch commits.
```

---

## Design Principles (Non-Negotiable)

```
1. IDEMPOTENCY EVERYWHERE
   Same request MUST NOT debit twice.
   Every TX endpoint requires Idempotency-Key header.

2. PND IS THE FIRST CHECK
   Before ANY balance operation:
     → Call pnd-service.check(accountId)
     → If restricted: reject immediately.

3. LEDGER MUST NEVER DRIFT
   SUM(DR) == SUM(CR) is invariant.
   Automated balance assertion runs every EOD.

4. EVENT-DRIVEN EVERYTHING
   All state changes emit events to RabbitMQ.
   No service calls another service's DB directly.

5. FULL TRACEABILITY
   Transaction → Approval → Posting → Reversal → Retry
   Every hop is logged with correlation-id.

6. ONE FILE = ONE COMMIT
   No batch commits. 50min–5hr per file.
   7–10 commits to complete a single file's full intent.
```

---

## Repository Structure (Target — All 27 Services)

```
BankingService/
├── libs/
│   └── common/                   ← @app/common (✅ done)
│       ├── src/
│       │   ├── rmq/
│       │   ├── decorators/
│       │   ├── guards/
│       │   ├── filters/
│       │   ├── interceptors/
│       │   ├── dto/
│       │   └── constants/
├── apps/
│   ├── api-gateway/              ✅ Jan 2023
│   ├── auth-service/             ✅ Feb 2023
│   ├── rbac-service/             ✅ Mar 2023
│   ├── ledger-service/           ✅ Apr–May 2023
│   ├── accounts-service/         ✅ May–Jun 2023
│   ├── approval-service/         ✅ (base), enhanced Sep 2025
│   ├── payment-service/          ✅ Jul 2023 core — Apr 2024 complete
│   ├── batch-service/            → May 2024
│   ├── reversal-service/         → Aug 2024
│   ├── retry-service/            → Sep 2024
│   ├── kyc-service/              → Oct 2024
│   ├── compliance-service/       → Nov 2024
│   ├── audit-service/            → Jan 2025
│   ├── loan-service/             → Feb 2025
│   ├── overdraft-service/        → Mar 2025
│   ├── collections-service/      → Apr 2025
│   ├── fraud-service/            → May 2025
│   ├── notification-service/     → Jun 2025
│   ├── dispute-service/          → Jul 2025
│   ├── tenant-service/           → Jul 2025
│   ├── identity-service/         → Aug 2025
│   ├── consent-service/          → Aug 2025
│   ├── session-service/          → Aug 2025
│   ├── reconciliation-service/   → Sep 2025
│   ├── pnd-service/              → Sep 2025
│   └── posting-engine/           ← Embedded in ledger-service ✅
```
