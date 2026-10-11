# Queens Backend - Feature Inventory (Enterprise Edition)

The Queens Core Server manages real-time logistics, user identity, and financial transactions at enterprise scale.

## 🚠 Real-Time Orchestration
- **Socket.io Signaling Server**: High-concurrency management of location telemetry, signaling, and live ride logs.
- **Voice Call Signaling**: SIP-like signaling flow (`incoming-call`, `accept`, `end`) for bridging communication between driver and passenger.
- **Location Telemetry**: Optimized ingestion of driver GPS data with geo-spatial indexing (2dsphere) for proximity matching.

## 📈 Ride & Financial Services
- **Intelligent Fare Engine**: Real-time fare recalculation based on actual trip duration and traffic delays.
- **Referral Reward Engine**: Automated logic for generating unique user codes and crediting both referrer and passenger wallets upon first-trip completion.
- **Multi-Passenger Support**: Core models support shared ride pooling and multi-stop itinerary management.
- **Automated E-Receipts**: Instant generation and dispatch of HTML trip receipts via integrated email services.

## 🛡️ Safety & Quality Control
- **Inactivity Watchdog**: 3-minute immobility check that triggers security alerts for unexpectedly stopped vehicles.
- **Safety Circle Hooks**: Automatic notification triggers for Emergency Contacts during trip initiation and SOS events.
- **Driver Performance Aggregator**: Automated rating aggregation engine that maintains driver `ratings_average` based on post-trip feedback loops.

## 📊 Administration & Insights
- **Global Activity Matrix**: Unified ledger capturing rides, payments, and security alerts for user transparency.
- **Analytics API**: Real-time sales reporting (Today/Weekly/Monthly) and user growth metrics.
- **Secure Authentication**: Multi-layered JWT authentication, password hashing, and role-based access control (RBAC).

## 🔑 Seeded Credentials (Development)

### Super Admin
- **Email**: `juwavictor@gmail.com`
- **Password**: `secret`

### Demo User
- **Email**: `demouser@gmail.com`
- **Password**: `secret`

### Seeded Drivers (Individual)
- **Email**: `adewale.driver@queens.com` / `Driver@123`
- **Email**: `emeka.driver@queens.com` / `Driver@123`
- **Email**: `fatima.driver@queens.com` / `Driver@123`

### Seeded Couriers (Dispatch)
- **Email**: `kunle.courier@queens.com` / `Driver@123`
- **Email**: `blessing.courier@queens.com` / `Driver@123`

---

---
*Built with Node.js, Express, TypeScript, MongoDB (Mongoose), and Socket.io.*


docker compose build --no-cache && docker compose up


docker compose down --rmi all -v && docker compose up --build
