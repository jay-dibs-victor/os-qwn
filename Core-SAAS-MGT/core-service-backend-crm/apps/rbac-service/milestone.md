# RBAC Service — Milestone

## Port
`3000` (proxied on API GW port `3000`)

## What Has Been Done
- Permission CRUD with tenant scoping
- Role CRUD with permission assignments
- User-to-role assignment (single and bulk)
- Aggregated permission lookup for users (union of all assigned roles)
- Attribute-Based Access Control (ABAC) policy engine
- Policy CRUD with evaluation against context data
- Full Swagger documentation with payload examples

## Feature Enhancements
- Bulk role assignment for efficiency
- Policy evaluation returns allow/deny with matched rules
- ABAC supports complex conditions beyond simple RBAC (role+attributes+context)
- Tenant-isolated permissions, roles, and policies

## Stability
- PermissionsGuard integration
- Role-permission relationship integrity
- Tenant-scoped queries prevent cross-tenant leakage
- Policy evaluation handles missing conditions gracefully

## Use Cases
- **Fine-Grained Access Control:** Define permissions for every operation
- **Role Management:** Group permissions into roles for easy assignment
- **Bulk Onboarding:** Assign multiple roles to a user in one call
- **Dynamic Authorization:** Evaluate policies based on request attributes and context
- **Compliance Auditing:** Query all permissions assigned to a user

## Available Endpoints

### Permissions
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/rbac/permissions` | Create a permission |
| GET | `/rbac/permissions` | Get all permissions for a tenant |
| PUT | `/rbac/permissions/:id` | Update a permission |
| DELETE | `/rbac/permissions/:id` | Delete a permission |

### Roles
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/rbac/roles` | Create a role with permission list |
| GET | `/rbac/roles` | Get all roles for a tenant |
| PUT | `/rbac/roles/:id` | Update a role |
| DELETE | `/rbac/roles/:id` | Delete a role |

### User Assignment
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/rbac/users/:userId/roles/:roleId` | Assign user to a single role |
| POST | `/rbac/users/:userId/roles` | Assign multiple roles to a user |
| GET | `/rbac/users/:userId/permissions` | Get aggregated permissions for a user |

### Policies (ABAC)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/rbac/policies` | Create a policy with conditions |
| GET | `/rbac/policies` | Get all policies for a tenant |
| POST | `/rbac/policies/evaluate` | Evaluate policy against context |

**POST /rbac/roles payload:**
```json
{
  "name": "Branch Manager",
  "description": "Manages branch-level operations",
  "tenantId": "tenant-001",
  "permissions": ["accounts.create", "accounts.view", "accounts.post"]
}
```

**POST /rbac/policies/evaluate payload:**
```json
{
  "principal": { "id": "user-uuid", "roles": ["branch-manager"] },
  "resource": "accounts.post",
  "action": "debit",
  "context": { "amount": 50000, "country": "NG" }
}
```
