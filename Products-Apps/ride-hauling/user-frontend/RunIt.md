# 🚀 RunIt: User Frontend (Standalone)

## 📦 Deployment Options

### 1. Docker Standalone (Recommended)
Launch the frontend on a separate instance using Docker Compose:
```bash
# Build and start with default localhost gateway
docker-compose -f docker-compose.standalone.yml up -d

# Build and start pointing to a specific Production Gateway
PROD_GATEWAY_URL=https://api.yourdomain.com docker-compose -f docker-compose.standalone.yml up -d
```

### 2. Manual Native Run
Run the frontend locally without Docker:
```bash
# 1. Install dependencies
npm install

# 2. Build (Specify your Gateway URL here)
VITE_API_URL=http://localhost:12000/api/v1 npm run build

# 3. Start static server
node server_react.cjs
```

## 🛠 Troubleshooting
- **CORS Errors**: Ensure the `VITE_API_URL` exactly matches the Gateway endpoint.
- **Port Conflict**: Change the default `4002` port in `docker-compose.standalone.yml`.
