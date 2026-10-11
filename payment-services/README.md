# Payment Services: NestJS Backend & React Validation Dashboard

This project is a clean, modern implementation of a subscription checkout validation system. It includes a NestJS backend and a React + Vite frontend covering:
- **Paystack** (Cards, Bank Transfer)
- **Moniepoint** (Bank Transfer checkout)
- **OPay** (OPay wallet cashier checkout)
- **PayPal** (OAuth order creation & capture validation)
- **Apple Pay** & **Google Pay** (Dynamic browser checkout sheets with FaceID/fingerprint biometrics)

---

## Directory Structure

- `backend/`: NestJS application running on port `5050`
- `frontend/`: React + Vite application running on port `5173`
- `docker-compose.yml`: Easily launches backend, frontend, and MongoDB services together.

---

## Getting Started

### Option A: Running with Docker Compose (Recommended)

To start the database, backend, and frontend together in one command:
```bash
docker-compose up --build
```
- Frontend will be live on [http://localhost:5173](http://localhost:5173)
- Backend will be live on [http://localhost:5050/api](http://localhost:5050/api)

---

### Option B: Running Locally

#### 1. Start MongoDB
Ensure MongoDB is running locally on your computer on port `27017` (e.g. `mongodb://localhost:27017/payment_service`).

#### 2. Configure Backend `.env`
Ensure credentials in `backend/.env` are set. (If default placeholder credentials are left, the application enters **Sandbox Simulation Mode**, allowing you to test everything in the UI via the Developer Console without requiring real keys).

#### 3. Start Backend (NestJS)
```bash
cd backend
npm run start:dev
```

#### 4. Start Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Webhook Verification & Testing

Mexican/Nigerian gateways (Paystack, OPay, Moniepoint) require server-side webhooks to verify transactions.

1. Switch active user context (e.g. **John Doe** or **Jane Smith**).
2. Choose a pricing plan (e.g. **Pro Plan**) and select a payment gateway.
3. In the simulated modal cashier, review details and hit submit.
4. Open the **Sandbox Console Drawer** on the bottom-right of the screen.
5. Select your active pending reference, choose the gateway, and click **Send Webhook Callback**.
6. The frontend polls for status updates, receives the confirmation in real-time, displays confetti, and updates active subscription plan states!
