# Sprint Planning & Business Model Strategy
*Closing the Gap: From Architecture to Operating System*

This document outlines the agile sprints and corresponding business models required to bridge the gaps identified in the Milestone & Gap Analysis, moving Queens from a technically validated platform to a city-wide operational network in Lagos, and eventually a multi-modal ecosystem.

---

## Part 1: Strategic Sprint Planning (Next 6 Months)

### Sprint 1: The Lagos Pilot Readiness (Weeks 1-4)
**Objective:** Transition from internal testing to a controlled real-world launch. Focus entirely on stability and driver acquisition.
**Target Gap:** Real-World Pilot (Month 0-3 phase).
**Key Deliverables:**
- Code freeze on new microservices (Flights, Intercity).
- Stress-test the `ride-service` and API Gateway for concurrency.
- Finalize the Driver Onboarding flow (KYC, vehicle verification) in the `taxi-admin` and `driver-frontend`.
- Deploy MVP marketing landing pages and driver referral systems.
- **Goal:** Onboard 300 active drivers and achieve a sub-5-minute ETA in 2 specific high-density Lagos zones.

### Sprint 2: Core Intelligence & Economics (Weeks 5-8)
**Objective:** Implement the first layer of the "AI OS" to optimize revenue and driver utilization.
**Target Gap:** Dynamic Surge Pricing & Basic Demand Prediction.
**Key Deliverables:**
- Upgrade `taxi-ai-os-worker` to monitor live demand density in geofenced clusters.
- Implement automated surge multipliers during peak hours or low-supply states.
- Develop the "Heatmap" for the Driver App to guide drivers to high-demand zones predictively.
- **Goal:** Increase driver utilization to 12-15 trips/day by minimizing idle time.

### Sprint 3: Deepening Logistics & B2B (Weeks 9-12)
**Objective:** Activate the high-margin logistics layer to complement ride-hailing and boost driver earnings during off-peak passenger hours.
**Target Gap:** Progressive Batching & B2B API Exposure.
**Key Deliverables:**
- Implement the progressive batching algorithm in `shipping-service` (allowing a courier to pick up 3 packages heading in the same direction).
- Secure and document public B2B APIs for local e-commerce stores to dispatch deliveries automatically.
- Ensure OTP Handshake is completely frictionless for both sender and receiver.
- **Goal:** Add an average of 5 delivery tasks per day to the existing ride-hailing drivers.

### Sprint 4: Ecosystem Lock-in & Retention (Weeks 13-16)
**Objective:** Introduce structured revenue and driver loyalty programs.
**Target Gap:** Subscription Plans & Driver Financing.
**Key Deliverables:**
- Launch Queens "Pro" subscription logic for users (discounted rides + free deliveries for a monthly fee).
- Develop the driver finance dashboard, integrating with third-party microfinance APIs for lease-to-own vehicle tracking.
- Rollout driver retention bonuses (e.g., "Trip Coins" or milestone rewards).

### Sprint 5: The Multi-Modal Engine (Weeks 17-24)
**Objective:** Begin the transition from a local mobility app to a regional transport operating system.
**Target Gap:** Intercity Integration & Multi-Modal Journey Engine.
**Key Deliverables:**
- Integrate APIs from 1-2 major intercity bus operators.
- Build the Multi-Modal Engine: Allow a user to book [Uber to Park] + [Bus Ticket] + [Uber from Destination Park] in one transaction.
- Connect the existing `flight-*` services into the multi-modal engine.

---

## Part 2: Aligned Business Models

To achieve these milestones, the business model must evolve alongside the technical sprints. Rather than just relying on standard ride commissions, the system uses tiered models:

### 1. The Liquidity Model (Sprints 1-2)
*Used to capture the market and build the supply network.*
- **Subsidized Commissions:** Charge a lower take-rate (10-15%) compared to incumbents to attract drivers.
- **Surge Margins:** The platform retains a higher percentage of the surge multiplier to offset the lower base commission.
- **Float Income:** Leverage the unified wallet to hold balances, generating micro-margins on transactions.

### 2. The Utilization Model (Sprint 3)
*Used to increase profitability without raising passenger prices.*
- **Delivery Batching Margin:** By batching 3 deliveries for 1 courier, the platform charges 3 separate delivery fees to users but pays the driver an optimized batched rate, keeping the margin difference.
- **B2B Service Fees:** Charge local businesses a flat API usage fee or a volume-based discount for automated dispatching.

### 3. The Recurring Model (Sprint 4)
*Used to guarantee cash flow and ensure user lock-in.*
- **Retail Subscriptions:** Predictable monthly recurring revenue (MRR) from users paying for priority matching and zero surge caps.
- **Driver Financing Referral Fees:** Earning affiliate margins or risk-sharing margins from banks for passing highly-rated drivers to lease-to-own vehicle programs.

### 4. The Aggregation Model (Sprint 5)
*Used to capture high-value travel spending.*
- **Multi-Leg Coordination Fees:** Charging a premium convenience fee for bundling rides with intercity bus or flight tickets.
- **Ticketing Commissions:** Earning 5-15% on long-distance bus tickets and 1-5% on flights without owning the buses or planes.

---
## Summary Focus
For the next 30 days, the absolute priority is **Sprint 1 and the Liquidity Model**. Technical development on new verticals must pause while operational resources are deployed to onboard drivers, run the Lagos pilot, and achieve the 5-minute ETA threshold.
