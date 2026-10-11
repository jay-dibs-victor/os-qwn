# 🧠 RunIt: AI Operating System Kernel

## 📦 Deployment Options

### 1. Independent Microservice (Distributed)
Run the AI OS and its worker on a dedicated server:
```bash
# In the taxi-server root
docker-compose -f docker-compose.dist.yml up ai-os ai-os-worker
```

### 2. Manual Native Run (No Docker)
Run the AI OS directly on your machine using `npm`:
```bash
# 1. Enter directory
cd server/operating-system

# 2. Configure environment
cp .env.template .env
# Important: Update .env with your local MongoDB/RabbitMQ/Temporal addresses

# 3. Install dependencies
npm install

# 4. Start API (Terminal 1)
npm run dev

# 5. Start Worker (Terminal 2)
npm run dev:worker
```

## 🔍 Critical Components
- **Sentinel**: Safety monitoring agent.
- **Oracle**: Terrain & Traffic awareness agent.
- **Guardian**: Empathy & Panic detection agent.

## 🔗 Peer Dependencies
Ensure the following are reachable:
- **Temporal**: `TEMPORAL_ADDRESS`
- **RabbitMQ**: `RABBITMQ_URL`
- **LiveKit**: `LIVEKIT_HOST`
