# 🚕 App-Feature: Ride Service

The Ride Service is the transactional "Heart" of the platform, managing the full lifecycle of rides and courier deliveries.

## 核心功能 (Core Features)

### 1. 🏁 Ride Lifecycle Management
- **Status Engine**: Orchestrates transitions between `SEARCHING`, `ACCEPTED`, `STARTED`, and `COMPLETED`.
- **OTP Verification**: Secure ride starts and completions via 4-digit verification codes.
- **Cancelation Logic**: Handles user/driver cancellations with reason tracking for AI OS auditing.

### 2. 📍 Real-time Telemetry
- **GPS Broadcasting**: Emits high-frequency location updates via RabbitMQ for the Sentinel Agent.
- **Geo-fencing**: Detects when a driver has "Arrived" at the pickup point.

### 3. 📦 Multi-Category Dispatch
- **Taxi Mode**: Standard passenger transport with tiered categories (Economy, Swift, Luxury).
- **Courier Mode**: Logistics-focused dispatch for package deliveries with `delivery_meta` tracking.

### 4. 💰 Fare & Payment
- **Dynamic Pricing**: Calculates fares based on distance, duration, and demand.
- **Split-Payment Ready**: Supports cash, wallet, and coin-based deductions.
