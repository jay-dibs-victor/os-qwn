# Service Specifications
## Core Banking SaaS — All Microservices

---

├── libs/
│   └── common/                   ← @app/common shared library
│       ├── src/
│       │   ├── rmq/              ← RabbitMQ client module
│       │   ├── decorators/       ← CurrentUser, TenantId, etc.
│       │   ├── guards/           ← JwtAuthGuard, RolesGuard
│       │   ├── filters/          ← Global exception filters
│       │   ├── interceptors/     ← Logging, Transform interceptors
│       │   ├── dto/              ← Shared DTOs
│       │   └── constants/        ← Event names, queue names
├── apps/
│   ├── api-gateway/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── routes/
│   │   │   ├── middleware/       ← Rate limiting, Correlation-ID
│   │   │   └── filters/
│   │   ├── test/
│   │   └── Dockerfile
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── auth/             ← login, register, JWT
│   │   │   ├── oauth/            ← OAuth 2.0, PKCE
│   │   │   ├── mfa/              ← OTP, TOTP
│   │   │   ├── token/            ← Issuance, rotation, revocation
│   │   │   └── entities/
│   │   ├── test/
│   │   └── Dockerfile
│   ├── identity-service/
│   ├── rbac-service/
│   ├── consent-service/
│   ├── session-service/
│   ├── ledger-service/
│   ├── accounts-service/
│   ├── pnd-service/
│   ├── posting-engine/
│   ├── transaction-service/
│   ├── payment-service/
│   ├── batch-service/
│   ├── reversal-service/
│   ├── retry-service/
│   ├── loan-service/
│   ├── overdraft-service/
│   ├── collections-service/
│   ├── kyc-service/
│   ├── audit-service/
│   ├── compliance-service/
│   ├── fraud-service/
│   ├── notification-service/
│   ├── dispute-service/
│   ├── approval-service/
│   ├── tenant-service/
│   └── reconciliation-service/

## SERVICE 1: auth-service

**Purpose:** Open Banking–grade Identity & Access Management.

### Entities
```
User { id, email, phone, password_hash, mfa_enabled, risk_score, tenant_id, status }
AuthToken { id, user_id, type, jti, expires_at, revoked, tenant_id }
OAuthClient { id, client_id, client_secret_hash, scopes[], tenant_id }
ConsentGrant { id, user_id, client_id, scopes[], expires_at, revoked_at, tenant_id }
DeviceRecord { id, user_id, fingerprint, trust_level, last_seen_at }
```

### Business Rules
- Email/Phone + OTP is primary Nigerian auth flow
- Step-up auth triggers on: high-risk TX, new device, suspicious geo
- Token rotation on every refresh token use
- MFA mandatory for admin roles and transactions > ₦1M
- Consent grants are time-bounded and user-revocable at any time
- Auth events MUST emit to audit-service and session-service

### API Endpoints
```
POST /auth/register
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/mfa/verify
POST /oauth/token           (Client Credentials + PKCE)
GET  /oauth/authorize       (Authorization Code flow)
POST /oauth/revoke
GET  /oauth/userinfo
POST /consent/grant
DELETE /consent/{id}        (Revoke)
```

---

## SERVICE 2: identity-service

**Purpose:** User profile management, device tracking, session control, identity linking.

### Entities
```
UserProfile { id, user_id, kyc_tier, bvn_hash, nin_hash, tenant_id }
IdentityLink { id, user_id, type (phone|email|bvn|nin), value_hash }
ActiveSession { id, user_id, device_id, ip, created_at, last_active_at }
```

### Business Rules
- One user → multiple linked identities (phone, email, BVN, NIN)
- BVN/NIN stored as irreversible hashes (NDPR compliance)
- Remote session kill must propagate to auth-service token revocation

---

## SERVICE 3: rbac-service

**Purpose:** Role hierarchy, permission engine, ABAC policy evaluation, maker-checker SoD.

### Entities
```
Role { id, name, parent_role_id, tenant_id, scope (branch|region|global) }
Permission { id, resource, action }  → e.g. transactions.approve
RolePermission { role_id, permission_id }
UserRole { user_id, role_id, expires_at, assigned_by }
AbacPolicy { id, resource, conditions_json, effect (allow|deny), tenant_id }
```

### Business Rules
- Teller → Supervisor → Manager → Director → Admin hierarchy
- SoD: Maker CANNOT approve their own transaction (enforced at rbac-service)
- ABAC example: Allow IF amount < ₦1M AND role = supervisor AND time IN (09:00–17:00)
- Scoped permissions: by branch, region, or tenant-wide
- Dynamic/temporary role assignment with expiry date

---

## SERVICE 4: approval-service

**Purpose:** Configurable, multi-level maker-checker workflow engine.

### Entities
```
ApprovalWorkflow { id, name, trigger_conditions_json, levels_json, tenant_id }
ApprovalRequest { id, workflow_id, entity_type, entity_id, status, created_by, tenant_id }
ApprovalLevel { request_id, level, approvers[], required_count, deadline_at }
ApprovalAction { id, request_id, level, actor_id, action (approve|reject), comment, at }
```

### Approval Routing Rules
```
Amount < ₦100k        → Auto-approve
₦100k – ₦1M          → Supervisor approval
₦1M – ₦10M           → Manager + Supervisor (parallel)
> ₦10M               → Director + Manager (sequential)
High-risk transaction → Extra fraud check gate
```

### Business Rules
- Auto-escalate if not actioned within SLA window
- Full immutable audit trail on every approval action
- Workflow templates reusable across tenants
- Sandbox testing of workflows before activation
-  So the final goal is this for every microservice we check if its configurured for approval via a permission function name . 
- if it is then route that endpoint request to approval so we can store the endpoint and payload and other meta data like the initiator id , approval function /approval function id (the permisison tied to the requesting resource). 
-  we are specific with post , put patch delete endpoints. else if these endpointn request do not have configuration set we execute the intending request where by we already have our gateway routing to the right microservice to execute the action

---

## SERVICE 5: ledger-service (THE HEART)

**Purpose:** Double-entry accounting. GL/sub-ledger management. EOD/EOM processing. Event Store.

### Entities
```
GlAccount { id, code, name, type (asset|liability|income|expense), parent_id, tenant_id }
LedgerEntry { id, transaction_id, gl_account_id, type (DR|CR), amount, currency,
              posted_at, effective_date, tenant_id, reversed_by }
EventStore { id, aggregate_id, aggregate_type, event_type, payload_json,
             version, occurred_at, tenant_id }
TrialBalanceSnapshot { id, snapshot_date, gl_account_id, balance, tenant_id }
```

### Invariants (NEVER BREAK)
```
1. SUM(all DR entries) == SUM(all CR entries) at all times
2. No entry is ever deleted — only reversed
3. EventStore is append-only (no UPDATE, no DELETE)
4. Every posting uses a DB transaction with SERIALIZABLE isolation
5. Backdated entries require manager approval + rebalancing
```

### Posting Flow
```
1. Receive PostingCommand (with idempotency_key)
2. Check idempotency_key not already processed
3. BEGIN TRANSACTION (SERIALIZABLE)
4. Write EventStore entry
5. Write LedgerEntry rows (all legs)
6. Validate: SUM(DR) == SUM(CR)
7. COMMIT
8. Emit LedgerEntryPostedEvent → RabbitMQ
```

---

## SERVICE 6: accounts-service

**Purpose:** Account lifecycle state machine, KYC status gate, PND consumer.

### Account Types
```
Savings · Current · Fixed/Term Deposit · Loan Account
Joint Account · Escrow · Virtual Account · Sweep Account
```

### Account States (State Machine)
```
PENDING → ACTIVE → DORMANT → FROZEN → CLOSED
              ↓
           RESTRICTED  (PND applied)
```

### Entities
```
Account { id, number, type, status, currency, tenant_id, customer_id,
          kyc_tier, daily_debit_limit, daily_credit_limit, overdraft_limit }
AccountRestriction { account_id, type (PND_DEBIT|PND_CREDIT|FULL_FREEZE),
                     reason_code, initiated_by, expires_at, channel_restrictions[] }
InterestTier { account_id, min_balance, max_balance, rate, effective_date }
```

### Business Rules
- PND check is the FIRST gate on every transaction attempt
- Dormancy trigger: no activity for 180 days (configurable per tenant)
- Joint accounts: permissions defined per co-owner
- Virtual accounts: mapped to a parent settlement account

---

## SERVICE 7: pnd-service

**Purpose:** Centralized Post-No-Debit/Credit restriction management. Four PND types enforced.

### PND Types
```
BANK_PND        → Fraud suspicion, regulatory order
FRAUD_PND       → Real-time fraud engine trigger (temporary)
USER_PND        → Customer self-lock (lost phone/card)
LEGAL_PND       → Court order / law enforcement
```

### Restriction Scope
```
FULL_FREEZE           → No debits, no credits
DEBIT_ONLY            → No outflows allowed
CREDIT_ONLY           → No inflows allowed
CHANNEL_SPECIFIC      → Block only transfers, allow deposits
```

### Enforcement Rule
```
Every transaction handler MUST call:
  pnd-service.check(accountId) BEFORE any balance operation.
  If PND active → reject with ACCOUNT_RESTRICTED error.
```

---

## SERVICE 8: payment-service

**Purpose:** Internal/external transfers, payment rail integration, smart routing.

### Payment Rails Supported
```
Internal    → Same-bank transfers (ledger posting only)
NIBSS/NIP   → Local Nigerian interbank
RTGS        → Real-Time Gross Settlement (high value)
SWIFT       → International (MT103 / ISO 20022)
```

### Smart Routing Engine
```
Route based on: cost · speed · success rate
Failover: auto-switch provider on failure
Liquidity check: reject if insufficient pool
```

### Entities
```
PaymentInstruction { id, idempotency_key, source_account_id, target_account_id,
                     amount, currency, rail, status, approval_id, tenant_id }
PaymentStatusLog { payment_id, status, provider_response, at }
```

---

## SERVICE 9: batch-service

**Purpose:** Bulk payroll, vendor payments, government disbursements.

### Processing Flow
```
1. Upload file (CSV/Excel/API JSON)
2. Validate each row: account validity + balance
3. Create ApprovalRequest (bulk payments REQUIRE approval)
4. On approval: process each item
5. Partial success: capture per-row success/fail status
6. Emit BatchCompletedEvent with summary
```

### Entities
```
BatchJob { id, type, status, total_count, success_count, fail_count,
           uploaded_by, approved_by, tenant_id }
BatchItem { id, batch_id, target_account, amount, status, error_code }
```

---

## SERVICE 10: reversal-service

**Purpose:** Controlled reversal of transactions. Compensation for failed Sagas.

### Reversal Types
```
FULL_REVERSAL       → Mirror all ledger legs (inverted)
PARTIAL_REVERSAL    → Reverse a subset of amount
CHARGEBACK          → External card network dispute
```

### Rules
```
Only authorized roles (REVERSAL_OFFICER or above) can initiate.
Mandatory approval for amounts > ₦100k.
External settled transactions need special workflow.
Original ↔ Reversal linked by transaction_id.
Time window restrictions configurable per tenant.
```

### Ledger Impact
```
Original:   DR Customer A / CR Customer B
Reversal:   DR Customer B / CR Customer A
Both entries remain in ledger (immutable).
```

---

## SERVICE 11: retry-service

**Purpose:** Exponential backoff retry for failed payments. Saga compensation orchestration.

### Retry Strategy
```
Attempt 1: immediate
Attempt 2: +30 seconds
Attempt 3: +2 minutes
Attempt 4: +10 minutes
Attempt 5: +1 hour → move to dead letter → alert
```

### Entities
```
RetryRecord { id, transaction_id, attempt_count, last_attempt_at,
              next_attempt_at, status, error_code }
```

### Compensation (Saga)
```
On max retry exceeded:
  1. reversal-service.initiateCompensation(transactionId)
  2. Restore any reserved balances
  3. Emit TransactionFailedEvent
  4. Notify customer
  5. Alert ops dashboard
```

---

## SERVICE 12: loan-service

**Purpose:** Full loan lifecycle. Personal, SME, BNPL, revolving credit.

### Loan States (State Machine)
```
APPLIED → UNDER_REVIEW → APPROVED → DISBURSED
       → ACTIVE_REPAYMENT → COMPLETED
       → DELINQUENT → NON_PERFORMING → WRITTEN_OFF
```

### Entities
```
LoanApplication { id, customer_id, type, amount, term_months, purpose, status }
LoanAccount { id, application_id, principal, outstanding_balance,
              interest_rate, accrual_type, repayment_schedule[], next_due_date }
RepaymentSchedule { loan_id, due_date, principal_due, interest_due, status }
```

### Interest Accrual Types
```
REDUCING_BALANCE  → Interest on outstanding balance
FLAT_RATE         → Fixed % of original principal
DAILY_ACCRUAL     → Computed daily, posted monthly
```

---

## SERVICE 13: overdraft-service

**Purpose:** Authorized and temporary overdraft management.

### Rules
```
Authorized OD: pre-approved limit assigned to account
Temporary OD: case-by-case approval workflow
Interest accrues daily on utilized amount ONLY
Auto-recovery: when credits arrive, OD balance deducted first
Expiry: OD facility has an expiry date
Channel restrictions: OD may be limited to specific channels
```

### Ledger GL Impact
```
OD utilized: DR Overdraft Receivable GL / CR Customer Account GL
Interest:    DR Interest Receivable GL  / CR Interest Income GL
Recovery:    DR Customer Account GL     / CR Overdraft Receivable GL
```

---

## SERVICE 14: collections-service

**Purpose:** Automated dunning, agent workflows, legal escalation pipeline.

### DPD Buckets (Days Past Due)
```
Current (0 days)     → Normal
Bucket 1 (1-30)      → Automated reminders (SMS + Email)
Bucket 2 (31-60)     → Increased contact frequency + payment links
Bucket 3 (61-89)     → Agent assignment
Bucket 4 (90+)       → Non-performing. Legal escalation track.
```

### Collections Workflow
```
Auto-debit attempt → SMS/Email reminders → Agent contact
  → Restructuring offer → Hard collections → External agency
  → Legal / Litigation → Write-off (with recovery tracking)
```

---

## SERVICE 15: fraud-service

**Purpose:** Real-time transaction scoring. Behavioral anomaly. Velocity and geo checks.

### Detection Signals
```
Velocity:     > X transactions in Y minutes from same account
Geo:          TX location inconsistent with known location
Device:       Unknown/untrusted device
Amount:       Sudden spike vs historical average
Pattern:      Multiple small TXs followed by large one (structuring)
Time:         TX at unusual hour for customer profile
```

### Actions
```
Score 0-40:   Allow
Score 41-70:  Step-up auth (OTP required)
Score 71-89:  Block + alert customer + create case
Score 90+:    Block + apply FRAUD_PND + escalate to compliance
```

---

## SERVICE 16: kyc-service

**Purpose:** Multi-tier KYC, document verification, watchlist screening.

### KYC Tiers (CBN Compliant)
```
Tier 1: Phone + BVN verification → Low transaction limits
Tier 2: Tier 1 + ID document   → Medium limits
Tier 3: Tier 2 + Address proof + Biometric → Full limits
```

### Checks Performed
```
BVN/NIN verification via NIBSS API
Document OCR + liveness detection
PEP (Politically Exposed Person) screening
Sanctions list screening (OFAC, UN, EU)
```

---

## SERVICE 17: audit-service

**Purpose:** Immutable append-only log for all critical actions across all services.

### Rules
```
No UPDATE, no DELETE. INSERT only.
Every event from every service is captured.
Full traceability: user → action → resource → outcome → timestamp → IP → device
Supports forensic replay and investigation.
Regulatory export (CSV/PDF) on demand.
```

### Entities
```
AuditLog { id, tenant_id, actor_id, actor_type, action, resource_type,
           resource_id, outcome, metadata_json, ip_address, device_id, at }
```

---

## SERVICE 18: reconciliation-service

**Purpose:** Internal GL vs sub-ledger reconciliation. External provider matching.

### Reconciliation Types
```
INTERNAL:  Ledger GL entries vs Account balances (daily)
EXTERNAL:  Bank statement vs payment provider reports (daily)
BATCH:     Bulk payment provider responses vs batch records
```

### Flow
```
1. Pull provider settlement report
2. Match against internal payment records (auto-matching by TX reference)
3. Unmatched items → exception queue → manual review
4. Emit ReconciliationCompletedEvent with match rate
```

---

## SERVICE 19: notification-service

**Purpose:** Event-driven multi-channel notifications.

### Channels: SMS · Email · Push · WhatsApp

### Trigger Events (subscribed from RabbitMQ)
```
transaction.posted     → "Your account has been debited ₦X"
payment.completed      → "Transfer of ₦X to [Beneficiary] successful"
transaction.failed     → "Transaction failed: [reason]"
loan.repayment.due     → "Your loan payment of ₦X is due tomorrow"
login.success          → "New login from [device] at [time]"
account.pnd.applied    → "Your account has been restricted"
```

### Entities
```
NotificationTemplate { id, event_type, channel, body_template, tenant_id }
NotificationLog { id, user_id, channel, event_type, status, sent_at, error }
```

---

## SERVICE 20: dispute-service

**Purpose:** Transaction dispute lifecycle. Evidence management. SLA enforcement.

### Dispute States
```
SUBMITTED → UNDER_REVIEW → AWAITING_EVIDENCE
  → SENT_TO_PROVIDER → RESOLVED (REFUNDED | REJECTED)
```

### Rules
```
SLA: Initial response within 24hrs (configurable)
Evidence: customer uploads via API
Card disputes: routed to card network (Visa/Mastercard) process
Auto-escalate if SLA breached
Full audit trail on every state change
```
