# 🚕 RunIt: Ride Service

## 📦 Deployment Options

### 1. Independent Microservice
```bash
# In the taxi-server root
docker-compose -f docker-compose.dist.yml up ride-service
```

### 2. Manual Native Run (No Docker)
```bash
# 1. Enter directory
cd server/ride-service

# 2. Configure environment
cp .env.template .env

# 3. Install dependencies
npm install

# 4. Start API (Terminal 1)
npm run dev

# 5. Start Worker (Terminal 2)
npm run dev:worker
```

## ⚙️ Core Responsibilities
- Ride lifecycle management (Searching -> Completed).
- GPS telemetry broadcasting (consumed by AI OS).
- Temporal activity execution for ride booking.
