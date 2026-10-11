# Retry Service — Milestone

## Port
`3009`

## What Has Been Done
- Retry record management with exponential backoff scheduling
- Retry lifecycle: SCHEDULED → RETRYING → SUCCEEDED / FAILED → DEAD_LETTERED
- Saga compensation pattern for reversing failed operations
- Maximum 5 attempts before dead-lettering
- Exponential backoff: `2^(attemptCount+1) * 10` seconds

## Architecture
- **Event-driven only** — no HTTP controllers
- Consumes retry events from RabbitMQ message bus
- Publishes lifecycle events: scheduled, retrying, succeeded, failed, dead_lettered, compensating, compensated, compensation_failed
- Dashboard provides operational visibility (totals, due count, dead-lettered count)

## Feature Enhancements
- Saga compensation: automatic reversal of partially-completed operations after final failure
- Exponential backoff prevents thundering herd on downstream services
- Dead-letter queue isolates permanently failed operations for manual review
- Compensation failure event triggers alerting

## Stability
- Self-healing: retry with backoff reduces pressure on failing services
- Dead-letter cap at 5 attempts prevents infinite retry loops
- Compensation ensures eventual consistency for multi-step operations
- Event-driven for async durability

## Use Cases
- **Transient Failure Recovery:** Retry failed operations with backoff
- **Distributed Saga:** Compensate (rollback) when all retries are exhausted
- **Operational Dashboard:** Monitor retry queue health and dead-lettered items
- **Alerting:** Failed compensation triggers notification for manual intervention

## Exposed Methods (no HTTP endpoints; consumed via service-to-service calls)

| Method | Description |
|--------|-------------|
| `createRetryRecord(dto)` | Create a retry record with backoff schedule |
| `recordFailure(id, error)` | Record failure — auto-backoff or dead-letter |
| `compensate(id, reason)` | Trigger saga compensation on final failure |
| `getDashboard(tenantId)` | Get retry dashboard totals and status |
