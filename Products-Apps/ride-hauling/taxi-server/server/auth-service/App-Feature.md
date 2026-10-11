# 🔐 App-Feature: Auth Service

The Auth Service is the "Gatekeeper," managing identity and secure delegation.

## 核心功能 (Core Features)

### 1. 🆔 Identity Management
- **Role-Based Access (RBAC)**: Distinct permissions for `Users`, `Drivers`, and `Admins`.
- **MFA Ready**: Support for multi-factor authentication and phone verification.

### 2. 🛰️ AI Delegation
- **Scoped AI Tokens**: Issues specialized JWTs that allow the AI OS to perform actions (e.g., booking a ride) securely on behalf of a user.
- **Session Lifecycle**: Manages the duration and validity of AI-driven sessions.

### 3. 🛡️ Security
- **Token Rotation**: Implements secure refresh/access token patterns.
- **Audit Trails**: Logs all login attempts and sensitive identity changes.
