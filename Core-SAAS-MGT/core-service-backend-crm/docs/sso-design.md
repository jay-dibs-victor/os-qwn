# SSO Architecture: taxi-server → SaaS Backend

## Overview

The taxi-server (Express/MongoDB) authenticates users (drivers, riders). The SaaS backend (NestJS/PostgreSQL microservices) holds financial data (wallet, earnings, trips). SSO allows taxi-server to act on behalf of authenticated users by presenting a token that the SaaS backend validates.

## Architecture

```
User → taxi-server (authenticates)
         ↓
    [SSO Gateway] → POST /auth/oauth/token (client_credentials)
         ↓
    SaaS Auth Service issues access_token (JWT with sub=userUUID)
         ↓
    taxi-server calls SaaS APIs with Bearer token
         ↓
    API Gateway validates JWT, proxies to microservice
         ↓
    Microservice reads x-user-id header, filters data by user
```

## Components

### 1. OAuth Client for taxi-server

Register taxi-server as a confidential OAuth client in the SaaS auth-service:

```json
{
  "client_id": "taxi-server",
  "client_secret": "<generated-secret>",
  "grant_types": ["client_credentials", "authorization_code"],
  "scopes": ["wallet:read", "earnings:read", "trips:read"],
  "token_endpoint_auth_method": "client_secret_basic"
}
```

This is already supported by the existing OAuth infrastructure.

### 2. Token Exchange Flow

```
taxi-server                          SaaS Auth Service
    |                                       |
    |-- POST /auth/oauth/token ----------->|
    |   grant_type=client_credentials       |
    |   client_id=taxi-server               |
    |   client_secret=<secret>              |
    |   subject_token=<user-jwt-or-id>      |   ← user context
    |                                       |
    |<-- { access_token, refresh_token } ---|
    |   access_token = JWT                  |
    |   sub = user-uuid                     |
    |   scope = wallet:read earnings:read   |
    |                                       |
```

The `subject_token` parameter carries the authenticated user's identity from taxi-server. The SaaS auth-service validates that taxi-server is authorized to act for this user, then issues a scoped access token.

### 3. JWT Token Structure

```json
{
  "iss": "queens-saas-auth",
  "sub": "<user-uuid>",
  "aud": "taxi-server",
  "scope": "wallet:read earnings:read trips:read",
  "client_id": "taxi-server",
  "tenant_id": "<tenant-id>",
  "iat": 1717000000,
  "exp": 1717003600
}
```

Already supported by `JwtStrategy` in the auth-service.

### 4. API Gateway Validation

The existing `AuthProxyMiddleware` chain already:
1. Validates JWT via `JwtAuthGuard`
2. Extracts `x-user-id`, `x-tenant-id` headers
3. Proxies to the appropriate microservice

**No changes needed** to the gateway — it already extracts user context from the JWT.

### 5. User Data Isolation

Each microservice filters by the authenticated user:

- **Wallet**: `wallet-service` returns wallet balance for `x-user-id`
- **Earnings**: `ledger-service` filters journal entries by `subLedgerId` matching user UUID
- **Trips**: `payment-service` filters trip financial records by `driverCustomerId`

This is the existing behavior — the user UUID in the JWT `sub` claim flows through to each service.

## Setup Steps

1. Generate OAuth client credentials for taxi-server:
   ```sql
   INSERT INTO oauth_clients (client_id, client_secret_hash, grant_types, scopes, ...)
   VALUES ('taxi-server', '<sha256-of-secret>', 'client_credentials,authorization_code', 'wallet:read earnings:read trips:read', ...);
   ```

2. Configure taxi-server environment:
   ```
   SAAS_AUTH_URL=http://gateway:3000/auth
   SAAS_CLIENT_ID=taxi-server
   SAAS_CLIENT_SECRET=<secret>
   SAAS_SCOPES=wallet:read earnings:read trips:read
   ```

3. Add token exchange endpoint to auth-service if needed:
   ```
   POST /auth/oauth/token-exchange
   Body: { grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
           subject_token: "<taxi-server-user-jwt>",
           client_id: "taxi-server", client_secret: "..." }
   ```

## Security Considerations

- taxi-server's `client_secret` is stored securely and not exposed to browsers
- Access tokens have short TTL (1 hour); refresh tokens for longer sessions
- Scopes are restricted to read-only for wallet, earnings, and trips
- API endpoints enforce both authentication and authorization (scope checks)
- Audit logging tracks which client accessed whose data
