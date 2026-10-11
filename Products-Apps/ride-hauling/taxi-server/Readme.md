# Queens Backend API

A high-performance, enterprise-grade backend infrastructure for the Queens ecosystem, built with Node.js, TypeScript, and MongoDB.

## 🚀 Core Features

### 1. Ride & Logistics Engine
- **Versatile Booking**: Supports `QUICK` (on-demand) and `PLANNED` (scheduled) ride types.
- **Ride Categories**: Segmented into `Taxi` and `Courier` services.
- **Shared Rides**: Intelligent seat allocation and stop-point management for pooled trips.
- **Dynamic Pricing**: Algorithmic fare calculation with support for distance, duration, and seat-based pricing.

### 2. Gamification & Rewards (TaxiCoins)
- **TaxiCoin (TXC) Economy**: Custom internal currency for payments and rewards.
- **Streak System**: Logic for rewarding daily active usage.
- **Milestone Rewards**: Automated awarding of coins based on trip count and referral successes.
- **Trip Locks**: Progressive feature unlocking (e.g., 3 trips for users, 5 trips for drivers to enable coin spending).

### 3. Referral Ecosystem
- **Multi-Role Referrals**: Specific reward structures for referring new Users (500 TXC per 5) and Drivers (700 TXC per 5).
- **Milestone Tracking**: Real-time tracking of successful signups and verifications.

### 4. Advanced Payments
- **Multi-Gateway Support**: Integrated with Paystack, Stripe, PayPal, and Flutterwave.
- **Wallet System**: In-app wallet for seamless transactions.
- **Split Payments**: Logic to augment primary payment methods (Cash, Wallet, Voucher) with TaxiCoins.
- **Driver Remittance**: Automated platform fee surcharges and coin-based commission deductions.

### 5. Authentication & Security
- **JWT-Based Auth**: Secure Authorization using Bearer tokens.
- **Verification Flow**: Email OTP verification for all onboarded users and drivers.
- **Role-Based Access**: Granular control for Users, Drivers, Dispatchers, and Admins.

### 6. Real-time Communication & VOIP
- **Socket.io Integration**: Real-time ride requests, status updates, and location tracking.
- **WebRTC VOIP Signaling**: Specialized signaling for in-app calls (`initiate`, `accept`, `ice-candidate`, `end-call`).
- **Call-Ringing Signaling**: Automated event broadcasting for audible ringing/beeping feedback.
- **Notification Engine**: Integration with SendGrid for e-receipts and SMS for OTPs (Nexmo).

### 7. Microservice Architecture
- **Decoupled Services**: Orchestrated via Docker Compose (Auth, Ride, Flight Inventory, Flight Booking, Notification).
- **API Gateway**: Centralized entry point (Port 12000) with intelligent proxy routing and WebSocket support.
- **Inter-service Communication**: Event-driven architecture using **RabbitMQ** for asynchronous tasks (e.g., e-receipts, flight notifications).
- **Centralized Health Monitoring**: Global health checks across all microservices and database engines.

### 8. Global Flight Booking System
- **Multi-Provider Orchestrator**: Aggregates real-time data from **Amadeus** (GDS/Booking) and **AviationStack** (Live Status).
- **Normalization Engine**: Standardizes diverse 3rd party API responses into a unified "Standard Flight" object.
- **Hybrid Inventory**: Seamlessly merges manual flight inventory (PostgreSQL) with global real-time search results.
- **Automated Metadata Sync**: Agenda-scheduled jobs to sync global airport/city databases weekly.
- **Advanced Flight Features**: Live gate/terminal tracking, baggage allowance details, and real-time pricing confirmation.

## 🛠 Tech Stack
- **Runtime**: Node.js (>= 18.x)
- **Language**: TypeScript (tsc for builds)
- **Primary Databases**: MongoDB (Ride/Auth), PostgreSQL (Flight)
- **ORM/ODM**: Mongoose, Sequelize
- **Messaging**: RabbitMQ (amqplib)
- **API Management**: Express Gateway Pattern
- **Scheduling**: Agenda (MongoDB-backed)
- **Testing**: Mocha & Chai

## 🏗 System Orchestration
The system is fully containerized and managed via Docker Compose:
- **API Gateway (12000)**: Unified entry point.
- **Auth Service (12001)**: User identity and MFA.
- **Ride Service (12002)**: Taxi/Courier core logic.
- **Flight Inventory (12003)**: Global flight search & aggregation.
- **Flight Booking (12004)**: Reservation & Payment lifecycle.
- **Notification (12005)**: Async email/SMS dispatch.

## 📦 Getting Started
1. **Prerequisites**: Install Docker & Docker Compose.
2. **Build & Start**: 
   ```bash
   docker-compose build
   docker-compose up -d
   ```
3. **Local Development**:
   - `npm install`
   - `npm run start` (Runs all services concurrently via concurrently)

---
*Maintained by the Queens Engineering Team.*
node --max-old-space-size=8192 ./node_modules/typescript/bin/tsc --incremental