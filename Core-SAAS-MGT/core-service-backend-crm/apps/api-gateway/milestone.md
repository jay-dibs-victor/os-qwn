# API Gateway — Milestone

## Port
`3000`

## What Has Been Done
- Central API gateway proxying all microservice requests
- Global CORS middleware with explicit origin allowlisting (localhost, queens-*.netlify.app, queens-os-crm.com)
- Request-level CORS headers (Access-Control-Allow-Origin, Credentials, Methods, Headers)
- Preflight (OPTIONS) handling at the HTTP middleware level — never forwarded upstream
- Swagger UI at `/api/docs` with full OpenAPI 3.0 spec combining all service tags
- JWT Bearer auth support with Authorize button in Swagger
- Health check endpoints for service monitoring

## Feature Enhancements
- Swagger `persistAuthorization` enabled so tokens survive page reloads
- `tryItOutEnabled` by default for quick endpoint testing
- Tags organized by domain: Authentication, Customers, Drivers, Partners, General Ledger, Payments, etc.
- Documentation covers seeded credentials, GL account code ranges, and reference prefix key

## Stability
- CORS handling at raw Express level (before NestJS pipeline) ensures preflight responses for all routes including proxied ones
- ValidationPipe globally applied
- No direct database dependency — purely routing layer

## Use Cases
- **Single Entry Point:** All frontend traffic routes through this gateway
- **API Documentation:** Swagger UI serves as the authoritative API reference for all downstream services
- **Health Monitoring:** `/health/approval` checks downstream approval-service availability

## Available Endpoints

### `GET /`
**Health check** — Returns welcome message confirming the API is running.

**Response:**
```json
{ "message": "Queens OS API is running", "version": "2.0.0" }
```

### `GET /health/approval`
**Approval service health** — Checks if the downstream approval-service is reachable.

**Response:**
```json
{ "status": "ok", "service": "approval-service" }
```
