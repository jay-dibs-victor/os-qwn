# Core Banking SaaS — Master Implementation Plan
**Project Start:** January 5, 2023 | **Horizon:** December 2023
**Platform:** NestJS · PostgreSQL · Redis · RabbitMQ · Docker

---

## 1. Project Charter

We are building a **production-grade, multi-tenant Core Banking SaaS** — not a toy project. This system will serve 1,000,000+ customers for a core banking system development company. It competes at the level of Temenos, Finacle, and Mambu.

### Non-Negotiables
| Principle | Requirement |
|---|---|
| ACID Compliance | Ledger MUST use serializable transactions. Zero balance drift. |
| Idempotency | Every transaction entry point MUST carry an `Idempotency-Key`. |
| Event Sourcing | Every financial state change is an immutable event. |
| Auditability | Full traceability: who did what, when, from where, why. |
| PND Enforcement | Every transaction entry point checks account restrictions FIRST. |
| Regulatory | KYC tiers, AML reporting, NDPR data privacy built-in. |

---

## 2. Full Tech Stack

| Layer | Technology |
|---|---|
| Backend Framework | NestJS (TypeScript) |
| Primary DB | PostgreSQL (ACID — Ledger, Transactions, Accounts) |
| Document Store | (Future) MongoDB — flexible KYC/profile data |
| Cache / Session | Redis |
| Message Broker | RabbitMQ (Event Bus) |
| Containerization | Docker + Docker Compose |
| API Style | REST (external) + RabbitMQ events (internal) |
| Auth Protocol | OAuth 2.0 + OpenID Connect + JWT (RS256) |
| Secret Management | KMS / Vault (key rotation) |
| Observability | OpenTelemetry · ELK Stack · Prometheus · Grafana |
| Testing | Jest (unit) + Supertest (integration) |
| Linting | ESLint + Prettier (industrial standard) |
| API Docs | Swagger / OpenAPI per service |

---

## 3. Complete Microservices Decomposition

### Group A — Identity & Trust
| Service | Core Responsibility |
|---|---|
| **api-gateway** | Single entry point. Rate limiting, routing, request signing, IP whitelisting. |
| **identity-service** | User/Business/Dev/System identity. Profile, device tracking, sessions. |
| **auth-service** | OAuth 2.0 + OIDC. Token issuance/rotation/revocation. PKCE. |
| **consent-service** | Open Banking consent. User grants, scope mgmt, revocation, audit. |
| **rbac-service** | Roles, permissions, ABAC policy engine. Maker-checker enforcement. |
| **session-service** | Active sessions, remote logout, concurrent session limits. |

### Group B — Core Financial Engine
| Service | Core Responsibility |
|---|---|
| **ledger-service** | **THE HEART.** Double-entry, GL/sub-ledger, EOD/EOM, ACID strict. |
| **accounts-service** | Account lifecycle state machine. All account types. PND checks. |
| **posting-engine** | Atomic multi-leg postings. Templates. Real-time + batch modes. |
| **transaction-service** | Transaction orchestration. Idempotency. Approval routing. |

### Group C — Payments & Money Movement
| Service | Core Responsibility |
|---|---|
| **payment-service** | Internal/external transfers. Smart routing. SLA monitoring. |
| **batch-service** | Bulk payroll/disbursements. CSV/API ingestion. Approval gates. |
| **reversal-service** | Full/partial reversals. Reason codes. Ledger compensation. |
| **retry-service** | Exponential backoff retries. Saga compensation. Failure recovery. |

### Group D — Products & Credit
| Service | Core Responsibility |
|---|---|
| **loan-service** | Loan lifecycle state machine. Accrual, repayment, delinquency. |
| **overdraft-service** | Authorized/temporary OD. Daily accrual. Auto-recovery. |
| **collections-service** | DPD tracking. Dunning workflows. Agent assignment. Legal escalation. |

### Group E — Risk & Compliance
| Service | Core Responsibility |
|---|---|
| **pnd-service** | Bank/Fraud/User/Legal PND controls. Channel-level blocking. |
| **fraud-service** | Real-time scoring. Velocity checks. Geo-detection. Behavioral ML. |
| **kyc-service** | KYC tiers. Doc verification. Watchlist screening (PEP/sanctions). |
| **audit-service** | Immutable append-only logs. Forensic replay. Regulatory exports. |
| **compliance-service** | AML rules engine. SAR filing. Data retention policies. |

### Group F — Channels & Experience
| Service | Core Responsibility |
|---|---|
| **notification-service** | Event-driven SMS/Email/Push via RabbitMQ subscriptions. |
| **dispute-service** | Transaction dispute submission, evidence, SLA, resolution tracking. |

### Group G — SaaS & Operations
| Service | Core Responsibility |
|---|---|
| **tenant-service** | Tenant isolation (DB-per-tenant). Per-tenant configs, billing. |
| **approval-service** | Configurable maker-checker workflows. Amount-based routing. SLA escalation. |
| **reconciliation-service** | Internal vs external ledger matching. Exception queues. |

---

## 4. Development Discipline

```
One file → one commit.
50 minutes to 5 hours per file implementation.
A single file may take 7–10 commits to complete.
Task-Driven Development: every file has a weighted task.
Unit tests MANDATORY. Integration tests MANDATORY for Ledger/Auth.
ESLint + Prettier enforced before every commit.
Swagger docs updated alongside each service.
```

---

## 5. Commit Format

Follow the `commit-format.sh` already in `BankingService/`:
```
feat(service-name): <description of what was implemented>
test(service-name): <unit/integration test added>
docs(service-name): <swagger/readme updated>
fix(service-name): <bug fixed>
chore(infra): <docker/config changes>
```

---

## 6. Project Timeline (Jan 5 – Dec 31, 2023)

| Month | Service(s) |
|---|---|
| **Month 1** (Jan) | Docker infra · API Gateway · Common Library (`@app/common`) |
| **Month 2** (Feb) | Auth Service · Identity Service · Token Service |
| **Month 3** (Mar) | RBAC Service · Consent Service · Session Service |
| **Month 4** (Apr) | Ledger Service (ACID engine + Event Sourcing) |
| **Month 5** (May) | Accounts Service (lifecycle + PND hooks) |
| **Month 6** (Jun) | Posting Engine · Transaction Service |
| **Month 7** (Jul) | Payment Service · Batch Service |
| **Month 8** (Aug) | Reversal Service · Retry/Recovery Service |
| **Month 9** (Sep) | KYC Service · AML/Compliance Service · Audit Service |
| **Month 10** (Oct) | Loan Service · Overdraft Service · Collections Service |
| **Month 11** (Nov) | Fraud Service · PND Service · Dispute Service |
| **Month 12** (Dec) | Tenant Service · Approval Service · Reconciliation Service |
