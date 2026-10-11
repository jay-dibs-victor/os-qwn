# Queens Driver Application

A high-performance interface for drivers, providing advanced logistics, earning management, and gamification features.

## 🚀 Key Features

### 1. Operations Hub
- **Real-time Dispatch**: Instant ride requests with detailed pickup/destination info.
- **Live Navigation**: Integrated map tracking for active trips.
- **Availability Toggle**: Simple switch for "Online/Offline" status with auto-dispatch logic.

### 2. Earnings & Remittance
- **Direct Payouts**: Automated tracking of trip earnings.
- **Commission Split Preferences**: Toggle the use of TaxiCoins to pay platform remittance surcharges (50 TXC per trip).
- **Cash Management Wizard**: Advanced acknowledgment interface for physical and bank transfer payments, ensuring settlement before completion.
- **Balance Transparency**: Clear breakdown of cash to collect vs. digital wallet earnings.

### 3. Communication & Security
- **In-App VOIP Signaling**: Real-time voice calls with audible ringing alerts and WebRTC stability.
- **Trip Security OTP**: Native verification input for 4-digit passenger completion codes to prevent fraudulent trip ending.
- **Audio Feedback**: Calling beeps and success chimes for various operational milestones.

### 4. Rewards & Performance
- **Driver Scorecard**: Real-time tracking of completed trips and ratings.
- **Verification Portal**: Upload and manage vetting documents (Licenses, Certificates).
- **Driver Referral Rewards**: Earn 700 TXC for every 5 successfully verified drivers referred.
- **Feature Unlocking**: Unlock coin-based remittance payments after completing the first 5 trips.

### 5. Smart Notifications
- **Status Sync**: Real-time socket updates for "Passenger Arrived", "Ride Started", and "Ride Completed".
- **Augmentation Alerts**: Visual cues for trips where passengers used coin augmentation (indicating adjusted cash balances).

## 🔑 Driver Test Credentials

### Individual Driver
- **Email**: `adewale.driver@queens.com`
- **Password**: `Driver@123`

### Courier Driver
- **Email**: `kunle.courier@queens.com`
- **Password**: `Driver@123`

## 🛠 Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Styling**: SCSS / Custom CSS
- **Real-time**: Socket.io Client

## 📦 Getting Started
1. Run `npm install`
2. Start dev server: `npm run dev`
3. Build production bundle: `npm run build`
