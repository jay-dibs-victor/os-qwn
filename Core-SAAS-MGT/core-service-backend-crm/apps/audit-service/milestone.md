# Audit Service — Milestone

## Port
`3012`

## What Has Been Done
- Tamper-proof append-only audit log with cryptographic hash chaining (SHA-256)
- Merkle-chain style verification: each entry contains `previousHash`
- `GENESIS` hash for the first entry in the chain
- Forensic replay by resource type + resource ID
- Actor trace by actor ID across all actions
- CSV export capability for external auditing
- Hash chain integrity verification to detect tampering
- Event-driven architecture — ingests audit events via RabbitMQ messages

## Architecture
- **Event-driven only** — no HTTP controllers
- Listens for audit events on RabbitMQ message bus
- Processes `routingKey` pattern for targeted routing
- All operations are service-layer calls from other microservices

## Feature Enhancements
- Cryptographic chain ensures tamper-evident logs
- Forensic replay reconstructs complete lifecycle of any resource
- Actor trace provides full audit trail per user
- CSV export for regulatory submissions
- Chain verification detects any historical tampering

## Stability
- Append-only design prevents deletion or modification
- SHA-256 hashing ensures chain integrity
- GENESIS anchor prevents chain substitution
- RabbitMQ event ingestion ensures async durability

## Use Cases
- **Regulatory Compliance:** Meet audit trail requirements (SOX, GDPR, etc.)
- **Fraud Investigation:** Replay entire resource lifecycle for forensic analysis
- **User Monitoring:** Trace all actions performed by a specific actor
- **Data Integrity:** Verify log chain has not been tampered with
- **External Audit:** Export CSV for third-party auditors

## Exposed Methods (no HTTP endpoints; consumed via service-to-service calls)

| Method | Description |
|--------|-------------|
| `appendLog(dto)` | Append a new audit log entry with hash chaining |
| `ingestEvent(dto)` | Ingest audit event from message bus |
| `list(query)` | Query audit logs with filters |
| `forensicReplay(resourceType, resourceId, tenantId)` | Full chain replay for a resource |
| `actorTrace(actorId, tenantId)` | Trace all actions by an actor |
| `verifyHashChain(tenantId)` | Verify chain integrity |
| `exportCsv(tenantId)` | Export all logs as CSV |
