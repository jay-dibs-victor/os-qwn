# Auth Service

## The Idea
The Auth Service manages all user, driver, and administrative identities within the Queens platform. It handles secure registration, login, role-based access control (RBAC), and token lifecycle management.

## Business Model Contribution
- **Trust & Security:** A robust authentication system ensures that passenger data and driver earnings are protected, which is critical for user trust and regulatory compliance.
- **Seamless Onboarding:** Fast, OTP-based login systems lower the barrier to entry, increasing user acquisition rates in markets where email usage may be low.

## Core Features
- **Multi-Role Authentication:** Dedicated login flows for Riders, Drivers, and Admins.
- **Token Management:** Issuance and validation of JWTs, including refresh token rotation.
- **OTP Verification:** SMS and Email-based OTP generation for passwordless login and account verification (integrated with Termii/Mailjet).
- **Profile Management:** Secure storage of hashed credentials and basic user profile metadata.
