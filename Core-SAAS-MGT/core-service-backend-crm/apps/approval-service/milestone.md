# Approval Service — Milestone

## Port
`3000` (proxied on API GW port `3000`)

## What Has Been Done
- Multi-level approval workflow configuration (level 1, level 2, etc.)
- Approval configs tied to specific HTTP methods and API paths
- Approval request creation with config-based routing
- Approval request lifecycle: PENDING → APPROVED / REJECTED
- Role-based and user-based approver assignment per level
- Step-by-step approval chain execution

## Feature Enhancements
- Flexible configuration: map any endpoint/method to an approval workflow
- Approval steps execute sequentially; each approval advances the level
- Rejection at any step terminates the workflow
- PermissionsGuard with `@Permissions('approval.create')` decorators

## Stability
- Config validation ensures approver assignments exist before request creation
- Workflow state machine prevents duplicate or out-of-order approvals
- Tenant-isolated configs and requests

## Use Cases
- **Sensitive Operations:** Require multi-level approval for high-value transactions
- **Compliance Workflows:** Enforce separation of duties (maker-checker)
- **Flexible Routing:** Different endpoints can have different approval hierarchies
- **Audit Trail:** Every approval/rejection step is recorded

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/approval/configs` | Create approval workflow configuration |
| GET | `/approval/configs` | Get approval configs (by tenant, optional method/path) |
| POST | `/approval/requests` | Create an approval request |
| GET | `/approval/requests` | List approval requests by tenant |
| POST | `/approval/requests/:id/approve` | Approve current step in workflow |
| POST | `/approval/requests/:id/reject` | Reject approval request |

**POST /approval/configs payload:**
```json
{
  "tenantId": "tenant-001",
  "method": "POST",
  "path": "/payments",
  "levels": [
    { "level": 1, "approverType": "role", "approverValue": "supervisor" },
    { "level": 2, "approverType": "user", "approverValue": "manager-uuid" }
  ]
}
```

**POST /approval/requests payload:**
```json
{
  "tenantId": "tenant-001",
  "configId": "config-uuid",
  "payload": { "amount": 500000, "destination": "ACC-003" },
  "requestedBy": "user-uuid"
}
```
