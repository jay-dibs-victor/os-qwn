# Batch Service — Milestone

## Port
`3000` (proxied on API GW port `3000`)

## What Has Been Done
- Batch job creation with configurable payload
- Batch job execution and item processing
- Retry of failed batch items
- Batch lifecycle: created → executing → completed/failed
- PermissionsGuard with granular permissions (`batch.create`, `batch.view`, `batch.execute`, `batch.retry`)

## Feature Enhancements
- Granular permission control at the endpoint level
- Job item tracking for partial success scenarios
- Retry isolates only failed items for reprocessing

## Stability
- PermissionsGuard protects all endpoints
- Job execution state machine prevents double execution
- Failed items tracked individually for targeted retry

## Use Cases
- **Bulk Operations:** Process large sets of operations (e.g., mass account updates)
- **Scheduled Processing:** Queue operations for later batch execution
- **Error Recovery:** Retry only failed items without reprocessing successes

## Available Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/batch` | Create a new batch job |
| GET | `/batch/:id` | Get batch job status and items |
| POST | `/batch/:id/execute` | Start processing a batch job |
| POST | `/batch/:id/retry` | Retry failed items in a batch job |

**POST /batch payload:**
```json
{
  "type": "bulk-account-update",
  "tenantId": "tenant-001",
  "items": [
    { "operation": "update-status", "accountNumber": "ACC-001", "status": "ACTIVE" },
    { "operation": "update-status", "accountNumber": "ACC-002", "status": "SUSPENDED" }
  ],
  "metadata": { "initiatedBy": "admin-uuid" }
}
```
