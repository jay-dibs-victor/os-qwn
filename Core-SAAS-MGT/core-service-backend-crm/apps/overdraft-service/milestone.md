# Overdraft Service — Milestone

## Port
`3015`

## What Has Been Done
- Skeleton/stub service with NestJS module scaffolding
- `ConfigModule` integrated for environment configuration
- PostgreSQL database connection configured via `.env`
- No controllers, no providers, no business logic yet

## Architecture
- **Stub service** — no HTTP controllers, no providers
- Module only imports `ConfigModule`
- Ready for overdraft management business logic implementation

## Status
- **Under development** — this is a placeholder for future overdraft capabilities
- Database connection is configured (`overdraft-db` PostgreSQL)
- Service registers in the monorepo build pipeline but has no runtime endpoints

## Planned Use Cases (to be implemented)
- Overdraft limit configuration per account/customer
- Overdraft authorization and tracking
- Overdraft fee/interest calculation
- Overdraft repayment processing
- Overdraft limit alerts and notifications
