# 🌐 RunIt: API Gateway (Central Orchestrator)

## 📦 Deployment Options

### 1. Independent Instance
The Gateway should ideally run on a public-facing instance.
```bash
# In the taxi-server root
docker-compose -f docker-compose.dist.yml up api-gateway
```

### 2. Manual Native Run (No Docker)
```bash
# 1. Enter directory
cd server/api-gateway

# 2. Configure environment
cp .env.template .env

# 3. Install dependencies
npm install

# 4. Start Gateway
npm run dev
```

## 🚥 Routing Config
The Gateway maps the following paths:
- `/api/v1/auth/*` -> Auth Service
- `/api/v1/rides/*` -> Ride Service
- `/api/v1/os/*` -> AI OS
- `/api/v1/shipping/*` -> Shipping Service
