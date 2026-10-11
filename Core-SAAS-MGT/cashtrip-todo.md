# SYSTEM DESIGN PROMPT: CASH TRIP SETTLEMENT, DRIVER DEBT, PARTNER REVENUE, AND ACCOUNTING LEDGER FOR QUEENS OS

You are a Principal Software Architect, FinTech Architect, Mobility Platform Architect, and Accounting Systems Expert with 20+ years of experience designing systems comparable to Uber, Bolt, Lyft, Grab, Gojek, Indrive, and large-scale payment platforms.

Design a production-grade accounting and settlement system for Queens OS, a mobility super app built with:

* NestJS Microservices
* PostgreSQL
* Redis
* RabbitMQ/Kafka
* React Native
* React Web
* Azure Cloud
* Event-Driven Architecture
* Domain-Driven Design (DDD)
* CQRS where appropriate

The platform supports:

* Rider trips
* Driver accounts
* Fleet partners
* Corporate accounts
* Wallets
* Cash payments
* Card payments
* Bank transfer payments
* Driver incentives
* Promotions
* Refunds
* Future crypto rewards and blockchain integrations

The system must be designed so that no money is ever lost, duplicated, misallocated, or become untraceable.

---

## CORE BUSINESS PROBLEM

A rider completes a trip and pays:

* Cash directly to driver
  OR
* Bank transfer directly to driver
  OR
* External payment outside platform

The platform never physically receives the money.

However:

* Platform commission still exists
* Fleet partner commission still exists
* Driver share still exists

The system must accurately track:

* What driver owes platform
* What platform owes partner
* What platform earns
* What driver truly earned
* Outstanding debts
* Settlement status

without depending on trust.

---

# REQUIREMENTS

Design a complete accounting and settlement architecture including:

## Accounting Service

Create a dedicated Accounting Microservice responsible for:

* General Ledger
* Journal Entries
* Settlement Engine
* Revenue Allocation
* Debt Management
* Payout Management
* Wallet Reconciliation
* Audit Trails

Explain why accounting must be isolated from:

* Trip Service
* Wallet Service
* Payment Service

---

## Double Entry Ledger

Design:

* Ledger tables
* Journal Entry tables
* Ledger Accounts
* Chart of Accounts

Include:

### Driver Accounts

* Driver Wallet
* Driver Debt
* Driver Earnings
* Driver Incentives
* Driver Penalties

### Platform Accounts

* Platform Revenue
* Pending Revenue
* Commission Revenue
* Refund Liability

### Partner Accounts

* Partner Revenue
* Pending Partner Revenue
* Partner Withdrawals

### Rider Accounts

* Rider Wallet
* Rider Refund Balance

---

## Cash Trip Flow

Design complete workflow:

Trip Created
→ Trip Accepted
→ Trip Started
→ Trip Completed
→ Fare Calculated
→ Rider Pays Driver Cash
→ Driver Debt Created
→ Settlement Pending

Explain:

* Database transactions
* Events emitted
* Ledger entries generated

---

## Driver Debt Management

Design:

* Outstanding debt tracking
* Debt aging
* Debt thresholds

Examples:

Debt > ₦10,000
Debt > ₦25,000
Debt > ₦50,000

Define:

* Warnings
* Cash-trip restrictions
* Driver suspension rules

---

## Driver Wallet Funding

Design:

* Wallet top-up
* Automatic debt settlement
* Partial debt settlement
* Overpayment handling

Examples:

Driver Debt = ₦15,000
Driver Top-Up = ₦5,000

System should:

* Partially settle debt
* Update balances
* Generate ledger entries

---

## Fleet Partner Revenue

Design partner model where:

Driver belongs to:

* Fleet Partner A
* Fleet Partner B

Each trip may produce:

* Platform commission
* Partner commission
* Driver share

Design:

* Pending Partner Revenue
* Available Partner Revenue
* Partner Settlement Lifecycle

---

## Partner Payouts

Design:

* Withdrawal requests
* Automated payouts
* Manual approval workflows

Support:

* Weekly settlements
* Daily settlements
* On-demand settlements

Explain:

* Reconciliation process
* Failed payout handling

---

## Corporate Accounts

Design scenario where:

Corporate client pays monthly invoice.

Trips occur before payment.

Support:

* Accounts Receivable
* Corporate Credit Limits
* Invoice Generation
* Overdue Accounts

---

## Disputes and Adjustments

Design:

* Trip disputes
* Fare corrections
* Manual adjustments

Examples:

Trip Fare: ₦10,000
Correct Fare: ₦8,000

System must:

* Reverse incorrect entries
* Create adjustment entries
* Maintain audit history

Never delete ledger records.

---

## Refund System

Design:

* Rider refunds
* Partial refunds
* Full refunds

Support:

* Wallet refunds
* Bank refunds
* Card refunds

Show accounting impact.

---

## Driver Incentives

Design:

* Bonus programs
* Weekly incentives
* Referral rewards
* Guaranteed earnings

Explain:

* How incentives affect ledger
* How incentives affect settlements

---

## Fraud Prevention

Design controls for:

* Driver claiming rider paid cash when not paid
* Driver ending trip without collecting payment
* Fake settlements
* Wallet manipulation
* Partner fraud

Include:

* Audit logs
* Reconciliation jobs
* Suspicious activity detection

---

## Reconciliation Engine

Design daily reconciliation process.

Verify:

* Trips
* Wallet balances
* Settlements
* Partner balances
* Driver balances
* Payment provider balances

Explain automated reconciliation jobs.

---

## Event-Driven Architecture

Define all events.

Examples:

TripCompleted
FareCalculated
DriverDebtCreated
WalletFunded
DebtSettled
PartnerRevenueReleased
PartnerWithdrawalRequested
PartnerWithdrawalCompleted
RefundProcessed

Include event schemas.

---

## API Design

Generate:

* REST APIs
* GraphQL APIs if needed
* Admin APIs

For:

* Driver debt
* Partner balances
* Settlement history
* Ledger history
* Reconciliation reports

---

## Database Design

Generate:

* PostgreSQL schema
* Indexes
* Constraints
* Partitioning strategy

Support:

* 10 million drivers
* 100 million riders
* Billions of ledger entries

---

## Scaling Strategy

Design for:

* Multi-country operations
* Multi-currency support
* Future crypto integration
* Future tokenized rewards
* Regulatory compliance
* Audit readiness

---

## Deliverables

Provide:

1. High-Level Architecture Diagram
2. Domain Model
3. Service Boundaries
4. Database Schema
5. Ledger Design
6. Event Contracts
7. API Specifications
8. Settlement Algorithms
9. Sequence Diagrams
10. Edge Cases
11. Failure Recovery Scenarios
12. Security Controls
13. Production Rollout Plan
14. Testing Strategy
15. Monitoring & Alerting Strategy

The final design must be production-ready, horizontally scalable, financially accurate, audit-compliant, and capable of supporting millions of daily transactions without loss of financial integrity.
