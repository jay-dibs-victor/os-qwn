# 🌐 App-Feature: API Gateway

The API Gateway is the "Nervous System" that aggregates all microservices into a single, secure entry point.

## 核心功能 (Core Features)

### 1. 🚥 Request Routing
- **Unified Endpoints**: Maps all frontend requests to internal microservice IPs.
- **Path Resolution**: Handles the complex routing between `/auth`, `/rides`, `/os`, and `/shipping`.

### 2. 🛡️ Security Aggregation
- **Global CORS**: Manages cross-origin resource sharing for all frontends.
- **Request Proxying**: Masks internal microservice infrastructure from public exposure.

### 3. 🛰️ Gateway Intelligence
- **Service Discovery**: Dynamically resolves service locations via environment variables.
- **Load Balancing Ready**: Built to handle multiple backend instances for high availability.
