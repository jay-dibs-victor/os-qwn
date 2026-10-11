# 🚀 RunIt: Driver Frontend (Standalone)

## 📦 Deployment Options

### 1. Docker Standalone (Recommended)
Launch the driver dashboard on a separate instance:
```bash

docker compose --env-file .env -f docker-compose.standalone.yml up --build
# Build and start with default localhost gateway
docker-compose -f docker-compose.standalone.yml up -d

# Build and start pointing to a specific Production Gateway
PROD_GATEWAY_URL=https://api.yourdomain.com docker-compose -f docker-compose.standalone.yml up -d

```

### 2. Manual Native Run
```bash
# 1. Install dependencies
npm install

# 2. Build (Specify your Gateway URL here)
VITE_API_URL=http://localhost:12000/api/v1 npm run build

# 3. Start static server
node server_react.cjs
```

## 🛰️ Integration
- **OS Real-time**: Ensure this instance has network access to the LiveKit server for safety alerts.
