# Customer Service — Milestone

## Port
`3014`

## What Has Been Done
- Customer account CRUD with tenant isolation
- Account kind enum (driver, rider, partner) for customer categorization
- Profile type enum for subclassification within each kind
- Search functionality with pagination and field filtering
- Tenant isolation via `x-tenant-id` header
- Soft-delete support on removal

## Feature Enhancements
- Broad search across multiple customer fields
- Kind and profileType filters for targeted queries
- Paginated list responses for large customer bases
- Soft-delete preserves data integrity

## Stability
- ValidationPipe globally applied
- Tenant-isolated queries via `x-tenant-id` header
- Unique constraint enforcement on customer identifiers
- Soft-delete filter on all list queries

## Use Cases
- **Customer Directory:** Central repository for all customer accounts across types
- **Tenant Isolation:** Each tenant sees only their customers
- **Search & Discovery:** Find customers by name, email, phone, or ID
- **Profile Management:** Update customer profiles and subclassifications

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/customer-accounts` | Create customer account |
| GET | `/customer-accounts` | List customer accounts (with tenantId, kind, profileType, search) |
| GET | `/customer-accounts/:id` | Get customer account by ID |
| PATCH | `/customer-accounts/:id` | Update customer account |
| DELETE | `/customer-accounts/:id` | Delete customer account (soft-delete) |

**POST /customer-accounts payload:**
```json
{
  "tenantId": "tenant-001",
  "kind": "driver",
  "profileType": "swift",
  "email": "driver@tenant.com",
  "phone": "+2348012345678",
  "firstName": "Chidi",
  "lastName": "Okonkwo",
  "address": "12 Marina Road",
  "city": "Lagos",
  "country": "Nigeria",
  "metadata": { "licenseNumber": "DL998877" }
}
```
