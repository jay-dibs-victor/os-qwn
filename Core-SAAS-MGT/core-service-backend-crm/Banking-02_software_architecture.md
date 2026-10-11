# Software Architecture Document (SAD)
## Core Banking SaaS Platform

---

## 1. Architecture Philosophy

```
Financial systems do not get "eventually consistent" on money.
The Ledger is ALWAYS strongly consistent.
Everything else can be eventually consistent via events.
```

| Domain | Consistency Model |
|---|---|
| Ledger Engine | **Strong** (ACID, Serializable isolation) |
| Account Balances | **Strong** (read from Ledger) |
| Notifications | Eventually consistent |
| Analytics / Reports | Eventually consistent |
| Session / Cache | Eventually consistent |

---

## 2. System Topology

```
  Client / Partner / Fintech
         │
         ▼
  ┌─────────────────────┐
  │     API GATEWAY      │ ◄── Rate limiting, IP whitelist,
  │  (NestJS + Proxy)   │     Request signing (HMAC),
  └─────────┬───────────┘     Auth token validation
            │
     ┌──────┴──────┐
     │             │
     ▼             ▼
 Identity     Other Services
 /Auth         (routed by path)
     │
     ▼
  RabbitMQ Event Bus
  ┌───┬───┬───┬───┬───┐
  │   │   │   │   │   │
  ▼   ▼   ▼   ▼   ▼   ▼
Ledger Accts Pay Loan Notif Audit
```

---

## 3. Event-Driven Communication

### 3.1 RabbitMQ Exchange Design
```
Exchange: banking.events (topic)
Exchange: banking.commands (direct)
Exchange: banking.dead-letter (fanout)

Key Queues:
  ledger.commands         → Ledger Service
  ledger.events           → Accounts, Audit, Notification
  payment.commands        → Payment Service
  payment.events          → Ledger, Notification, Audit
  auth.events             → Session, Audit
  kyc.events              → Accounts, Compliance
  loan.events             → Ledger, Collections, Notification
  fraud.alerts            → PND, Auth, Audit
```

### 3.2 Core Event Catalog
```
auth.user.registered
auth.login.success
auth.login.failed
auth.token.revoked
auth.consent.granted
auth.consent.revoked

account.created
account.activated
account.frozen
account.closed
account.pnd.applied
account.pnd.lifted

transaction.initiated
transaction.approved
transaction.posted
transaction.failed
transaction.reversed
transaction.retry.scheduled

ledger.entry.posted
ledger.entry.reversed
ledger.eod.completed

payment.initiated
payment.completed
payment.failed
payment.refunded

loan.applied
loan.approved
loan.disbursed
loan.repayment.received
loan.delinquent
loan.writtenoff

kyc.submitted
kyc.approved
kyc.rejected

fraud.alert.raised
fraud.account.blocked

notification.sent
notification.failed
```

---

## 4. Event Sourcing Architecture

### 4.1 Event Store (Ledger Service)
Every financial state change is written as an immutable event before the state is updated.

```
EventStore Table (PostgreSQL):
  id            UUID
  aggregate_id  UUID          ← Account or Transaction ID
  aggregate_type VARCHAR       ← 'ACCOUNT' | 'LEDGER_ENTRY'
  event_type    VARCHAR        ← 'DEBIT_POSTED' | 'CREDIT_POSTED'
  payload       JSONB         ← Full event data
  version       INTEGER       ← Optimistic concurrency
  occurred_at   TIMESTAMPTZ
  tenant_id     UUID
```

### 4.2 Event Flow: Money Transfer
```
1. POST /payments/transfer (API Gateway)
2. Auth validated → RBAC checked → PND checked
3. TransferCommand → payment-service
4. payment-service queries Accounts Service: sufficient balance?
5. Approval Engine: amount > threshold? → Maker-Checker
6. PaymentInitiatedEvent → RabbitMQ → ledger-service
7. Ledger writes EventStore entry (atomic)
8. Ledger executes double-entry posting (atomic, ACID)
9. LedgerEntryPostedEvent → RabbitMQ
10. accounts-service updates local balance view
11. notification-service sends SMS/Email
12. audit-service writes immutable log
13. PaymentCompletedEvent → API Gateway → 200 response

If Step 8 fails:
  - retry-service applies exponential backoff
  - If max retries → reversal-service triggered
  - reversal-service posts compensating entries
  - ReversalCreatedEvent → audit, notification
```

### 4.3 Saga Pattern (Distributed Transactions)
```
Orchestration-based Saga via payment-service:

STEP 1: Reserve balance       → if fail: abort
STEP 2: Debit source account  → if fail: release reservation
STEP 3: Credit target account → if fail: credit source back
STEP 4: Post to Ledger        → if fail: reverse Steps 2+3
STEP 5: Notify parties        → fire-and-forget
STEP 6: Write audit log       → fire-and-forget
```

---

## 5. Ledger Architecture (CRITICAL)

### 5.1 Double-Entry Rules
```
EVERY transaction MUST have:
  SUM(Debits) == SUM(Credits)

Example: Customer Transfer of ₦10,000
  DR  Customer A Account   10,000
  CR  Customer B Account   10,000

Example: Transfer with Fee
  DR  Customer A Account   10,100
  CR  Customer B Account   10,000
  CR  Fee Income GL            100
```

### 5.2 GL Account Hierarchy
```
Assets
  └── Customer Deposits
        ├── Savings Accounts
        ├── Current Accounts
        └── Fixed Deposits
  └── Loans Receivable
        ├── Personal Loans
        └── SME Loans
  └── Overdraft Receivable
  └── Nostro Accounts

Liabilities
  └── Customer Liabilities (deposits owed)
  └── Suspense Accounts

Income
  └── Fee Income
  └── Interest Income
  └── Overdraft Interest Income

Expenses
  └── Interest Expense
```

### 5.3 Posting Templates
```
TEMPLATE: internal_transfer
  Leg 1: DR source_account_gl
  Leg 2: CR target_account_gl

TEMPLATE: withdrawal_with_fee
  Leg 1: DR customer_account_gl
  Leg 2: CR cash_gl
  Leg 3: CR fee_income_gl

TEMPLATE: loan_repayment
  Leg 1: DR customer_account_gl  (principal)
  Leg 2: DR customer_account_gl  (interest)
  Leg 3: CR loan_principal_gl
  Leg 4: CR interest_income_gl

TEMPLATE: reversal
  Mirror all legs of original posting (inverted)
```

---

## 6. Multi-Tenancy Architecture

### 6.1 Isolation Strategy
```
Option 1 (Phase 1): Schema-per-tenant in shared PostgreSQL cluster
Option 2 (Phase 3+): Database-per-tenant for large tenants

Tenant ID propagated via:
  HTTP Header:  X-Tenant-ID
  JWT Claim:    tenant_id
  DB Context:   SET search_path = tenant_{id}
```

### 6.2 Tenant-Aware Data Flow
```
All repositories inject TenantContext:
  Every query: WHERE tenant_id = :tenantId
  Connection pool: PgBouncer per tenant
  Redis keys: tenant:{id}:cache:{key}
  RabbitMQ routing key: {tenantId}.event.type
```

---

## 7. API Gateway Architecture

```
Responsibilities:
  ✓ JWT validation (calls auth-service)
  ✓ Rate limiting (per-tenant, per-client)
  ✓ Request signing validation (HMAC)
  ✓ IP whitelisting (institutional clients)
  ✓ mTLS enforcement (partner integrations)
  ✓ Routing to downstream services
  ✓ Request/Response logging
  ✓ Circuit breaker (fail-fast on downstream errors)
  ✓ Global error normalization
  ✓ Correlation ID injection (for distributed tracing)

Route Map:
  /auth/**        → auth-service
  /identity/**    → identity-service
  /accounts/**    → accounts-service
  /ledger/**      → ledger-service (internal only)
  /payments/**    → payment-service
  /loans/**       → loan-service
  /kyc/**         → kyc-service
  /admin/**       → rbac-protected internal services
  /webhooks/**    → event-subscription management
```

---

## 8. Auth & IAM Architecture (Open Banking Grade)

```
Identity Types:
  End Users     → Email/Phone/OTP/Biometric
  Businesses    → OAuth 2.0 Client Credentials
  Developers    → API Keys + OAuth 2.0 PKCE
  Institutions  → mTLS + Signed JWTs
  Services      → mTLS Internal Identity

Auth Flows:
  Web/Mobile App     → Authorization Code + PKCE
  Server-to-Server   → Client Credentials
  High-Value TX      → Step-Up Auth (OTP/Biometric trigger)
  Partner API        → mTLS + Client Secret

Token Strategy:
  Access Token:   15 minutes (JWT RS256)
  Refresh Token:  30 days (rotated on use)
  ID Token:       OpenID Connect standard
  API Key:        Hashed + stored, per-tenant scoped

Consent (Open Banking):
  User grants scope to third-party app
  Time-bounded (expiry enforced)
  Revocable at any time
  Audited (consent_id → all access logs)
```

---

## 9. Security Architecture

```
Transport:      TLS 1.3 everywhere. mTLS for partners.
At Rest:        AES-256 encryption for PII fields.
Secrets:        KMS / HashiCorp Vault. Rotated per policy.
JWT Signing:    RS256 asymmetric keys. Keys rotated monthly.
PII Masking:    Account numbers, BVN masked in logs.
RBAC:           Role hierarchy enforced at service level.
ABAC:           Policy engine evaluates context attributes.
Fraud Auth:     Risk score gates authentication flow.
Rate Limiting:  Per-IP, per-client, per-tenant at Gateway.
```

---

## 10. Observability Stack

```
Distributed Tracing: OpenTelemetry → Jaeger
  Every request gets Correlation-ID injected at Gateway.
  Trace spans across all downstream services.

Centralized Logging: ELK Stack
  Logstash ingests structured JSON logs from all services.
  Kibana dashboards: error rates, auth failures, TX volumes.

Metrics: Prometheus + Grafana
  Transaction throughput (TPS)
  Ledger posting latency
  Payment success/failure rates
  Auth token issuance rates
  Service health (CPU, memory, DB connections)

Alerting:
  P0: Ledger balance mismatch → PagerDuty immediate
  P1: Auth service down → Slack alert
  P2: High payment failure rate → Email alert
```
