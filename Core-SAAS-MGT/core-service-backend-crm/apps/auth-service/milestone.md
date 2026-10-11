# Auth Service — Milestone

## Port
`3001`

## What Has Been Done
- Complete authentication system: register, login, JWT token generation/refresh/logout
- Multi-factor authentication: TOTP setup/enable, SMS OTP send/verify, backup codes
- Email verification via OTP flow
- Password reset via forgot-password/reset-password flow
- Google OAuth 2.0 SSO integration
- OAuth 2.0 authorization server (client registration, authorization code, client credentials, token introspection)
- Tenant management: create, list, get, suspend, activate
- Platform user management (root-admin, tenant-admin, account_officer, staff roles)
- Customer management (drivers, riders, partners): full CRUD with status lifecycle
- Scope-based access control: system scopes, tenant scopes, user scopes, custom scopes
- Role management: system roles, custom tenant roles, role-to-user assignment
- Staff management: listing, details with scopes, scope management
- File upload with adapter pattern: Cloudinary (default) or AWS S3
- Analytics dashboard: KPI metrics, revenue charts, customer/driver/partner charts
- GL-sourced financial metrics (gross volume, commission, escrow, subscriptions)
- Tenant platform settings: currencies, exchange rates, IP-based currency detection
- Swagger documentation with real payload examples across all endpoints

## Feature Enhancements
- **Pagination:** All list endpoints (customers, users) support `pageNumber`/`pageSize` and legacy `skip`/`take`
- **Customer search:** Broad search + field-specific filters on customer type listings
- **Paginated responses:** Wrapped in `{ data, total, pageNumber, pageSize, totalPages }`
- **Swagger examples:** Every POST/PUT body includes multiple named examples (driver, rider, partner)
- **Partial updates:** `PUT /customers/:id` merges only provided fields
- **Scope management:** 28 scope/role endpoints covering all CRUD + assign/unassign/toggle/bulk operations
- **Step-up auth:** MFA step-up verification for sensitive operations

## Stability
- Global `ValidationPipe` on all inputs
- JwtAuthGuard on all protected endpoints
- Database seeder runs idempotently on startup (root-admin, tenant-admin, account-officer, staff users)
- Unique constraints on email, phone, customerId with proper error handling
- `deletedAt: IsNull()` filter on all customer count queries (soft-delete aware)

## Use Cases
- **Rider/Driver/Partner Onboarding:** Create and manage all customer types with document uploads
- **Admin Dashboard:** GL-sourced KPI metrics showing real-time financial position
- **Staff Access Control:** Fine-grained scopes per user and per tenant
- **Multi-Tenant Platform:** Tenant admins manage their workspace; root-admin oversees all
- **SSO Login:** Google OAuth for streamlined authentication
- **Third-Party API Access:** OAuth 2.0 auth code and client credentials flows

## Available Endpoints

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/register` | Register new user account |
| POST | `/auth/login` | Authenticate with email/password, returns JWT |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/logout` | Revoke current token |
| GET | `/auth` | Auth service health check |
| GET | `/auth/me` | Get current authenticated user profile |
| POST | `/auth/verify-account` | Verify account after registration |
| POST | `/auth/send-verification-otp` | Send OTP to email |
| POST | `/auth/verify-email-otp` | Verify email with OTP |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### Multi-Factor Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/mfa/totp/setup` | Initialize TOTP setup |
| POST | `/auth/mfa/totp/enable` | Verify and enable TOTP |
| POST | `/auth/mfa/sms/send` | Send SMS OTP |
| POST | `/auth/mfa/sms/verify` | Verify SMS OTP |
| POST | `/auth/mfa/backup-codes/regenerate` | Generate new backup codes |
| POST | `/auth/mfa/backup-codes/use` | Use backup recovery code |
| POST | `/auth/mfa/step-up/verify` | Step-up auth for sensitive operations |

### OAuth 2.0
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/oauth/clients` | Register OAuth client |
| GET | `/auth/oauth/authorize` | Initiate authorization flow |
| POST | `/auth/oauth/token` | Exchange code/credentials for token |
| POST | `/auth/oauth/introspect` | Validate and inspect token |

### Tenant Management
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/tenants` | List all tenants (root-admin) |
| GET | `/auth/tenants/:tenantId` | Get tenant by ID |
| POST | `/auth/tenants` | Create new tenant (root-admin) |
| PATCH | `/auth/tenants/:tenantId/suspend` | Suspend tenant (root-admin) |
| PATCH | `/auth/tenants/:tenantId/activate` | Activate tenant (root-admin) |
| GET | `/auth/tenants/:tenantId/validate` | Validate tenant ID exists |

### User Management
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/users` | List users (paginated, `?pageNumber=1&pageSize=50&tenantId=`) |
| GET | `/auth/users/:id` | Get user by ID |
| POST | `/auth/users` | Create platform user |
| PATCH | `/auth/users/:id` | Update user profile/status/role |
| DELETE | `/auth/users/:id` | Delete user |

**POST /auth/users payload:**
```json
{
  "email": "staff@tenant.com",
  "phone": "+2348099887766",
  "password": "Staff@123456",
  "firstName": "Alice",
  "lastName": "Johnson",
  "role": "staff",
  "status": "active",
  "isVerified": true
}
```

### Customer Management
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/customers` | Create customer (driver/rider/partner) |
| GET | `/customers` | List customers (`?pageNumber=1&pageSize=50`) |
| GET | `/customers/type/:type` | List by type with search filters |
| GET | `/customers/status/:status` | List by status |
| GET | `/customers/stats` | Customer statistics |
| GET | `/customers/:id` | Get customer by ID |
| GET | `/customers/:id/dashboard` | Driver aggregated dashboard |
| PUT | `/customers/:id` | Partial update customer |
| POST | `/customers/:id/verify` | Verify customer → active |
| POST | `/customers/:id/suspend` | Suspend customer |
| DELETE | `/customers/:id` | Delete customer |

**POST /customers payload (driver example):**
```json
{
  "customerType": "driver",
  "email": "driver@tenant.com",
  "phone": "+2348012345679",
  "firstName": "James",
  "lastName": "Okafor",
  "address": "45 Broad Street",
  "city": "Lagos",
  "country": "Nigeria",
  "licenseNumber": "DL998877",
  "vehicleModel": "Toyota Camry",
  "vehicleRegistration": "LND-445-KW",
  "metadata": {
    "tier": "Swift",
    "vettingStatus": "PENDING",
    "docs": {
      "licenseFront": "https://res.cloudinary.com/...",
      "idProof": "https://res.cloudinary.com/..."
    }
  }
}
```

### Analytics
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/analytics/dashboard/metrics` | KPI metrics (revenue, commission, escrow, etc.) |
| GET | `/analytics/charts/revenue` | Revenue chart data |
| GET | `/analytics/charts/loans` | Chama escrow loans chart |
| GET | `/analytics/charts/customers` | Customer acquisition trends |
| GET | `/analytics/charts/drivers` | Driver acquisition/vetting |
| GET | `/analytics/charts/partners` | Partner cleared yield |
| GET | `/analytics/transactions/recent` | Recent GL journal entries |

### File Upload
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/upload/config` | Get upload provider config |
| POST | `/upload` | Upload file (multipart) |
| DELETE | `/upload/:publicId` | Delete file by public ID |

### Scope Management
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/scopes` | All available scopes |
| GET | `/scopes/category/:category` | Scopes by category |
| GET | `/scopes/available/tenant/:id` | Scopes available for tenant |
| GET | `/scopes/tenant/:id` | Scopes assigned to tenant |
| POST | `/scopes/tenant/:id/assign/:scopeId` | Assign scope to tenant |
| DELETE | `/scopes/tenant/:id/remove/:scopeId` | Remove scope from tenant |
| PUT | `/scopes/tenant/:id/toggle/:scopeId` | Enable/disable tenant scope |
| GET | `/scopes/custom/root` | Root custom scopes |
| GET | `/scopes/custom/tenant/:id` | Tenant custom scopes |
| POST | `/scopes/create` | Create custom scope |
| PUT | `/scopes/update/:id` | Update custom scope |
| DELETE | `/scopes/delete/:id` | Delete custom scope |
| GET | `/scopes/user/:userId` | User's assigned scopes |
| POST | `/scopes/user/:userId/assign/:scopeId` | Assign scope to user |
| DELETE | `/scopes/user/:userId/remove/:scopeId` | Remove scope from user |
| PUT | `/scopes/user/:userId/toggle/:scopeId` | Enable/disable user scope |
| POST | `/scopes/user/:userId/assign-role/:roleId` | Assign role scopes to user |
| POST | `/scopes/user/:userId/bulk-assign` | Bulk assign scopes |
| POST | `/scopes/user/:userId/bulk-remove` | Bulk remove scopes |
| GET | `/scopes/roles/all` | All available roles |
| GET | `/scopes/roles/tenant/:id` | Tenant roles |
| POST | `/scopes/roles/create` | Create custom role |
| PUT | `/scopes/roles/:roleId` | Update custom role |
| DELETE | `/scopes/roles/:roleId` | Delete custom role |
| GET | `/scopes/staff/tenant/:id` | Staff members in tenant |
| GET | `/scopes/staff/:userId/details` | Staff details with scopes |
| POST | `/scopes/staff/:userId/manage-scopes` | Manage staff scopes |
| GET | `/scopes/user/:userId/usage-stats` | User scope usage stats |

### Tenant Settings
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/settings` | Get platform settings |
| PATCH | `/auth/settings` | Update platform settings |
| GET | `/auth/settings/currencies` | List supported currencies |
| GET | `/auth/settings/exchange-rates` | Live exchange rates |
| GET | `/auth/settings/detect-currency` | IP-based currency detection |

### Google OAuth
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/auth/google` | Initiate Google login |
| GET | `/auth/google/callback` | Google OAuth callback |
