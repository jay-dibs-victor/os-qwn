# Local Compose Options

This repository keeps the existing root compose setup, and adds extra compose files so each backend service (and each web app) can be started independently for a more “distributed” workflow.

## Backend: shared infra

From [taxi-server](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/Products-Apps/taxi-server):

```bash
docker compose -f compose/docker-compose.infra.yml up -d
```

This starts:
- MongoDB (mongodb)
- Redis (redis)
- RabbitMQ (rabbitmq)
- Postgres (postgres)

It also creates a shared Docker network named `taxi-net` that the per-service compose files attach to.

## Backend: run a single service

From [taxi-server](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/Products-Apps/taxi-server):

```bash
docker compose -f compose/docker-compose.auth-service.yml up -d --build
docker compose -f compose/docker-compose.ride-service.yml up -d --build
docker compose -f compose/docker-compose.shipping-service.yml up -d --build
docker compose -f compose/docker-compose.flight-inventory.yml up -d --build
docker compose -f compose/docker-compose.flight-booking.yml up -d --build
docker compose -f compose/docker-compose.flight-notification.yml up -d --build
docker compose -f compose/docker-compose.ai-os.yml up -d --build
```

## Backend: run the API gateway (reverse proxy)

The gateway needs the other service containers reachable on `taxi-net`.

```bash
docker compose -f compose/docker-compose.api-gateway.yml up -d --build
```

Environment overrides (optional):
- `AUTH_SERVICE_URL` (default `http://auth-service:12001`)
- `RIDE_SERVICE_URL` (default `http://ride-service:12002`)
- `FLIGHT_INVENTORY_URL` (default `http://flight-inventory-service:12003`)
- `FLIGHT_BOOKING_URL` (default `http://flight-booking-service:12004`)
- `SHIPPING_SERVICE_URL` (default `http://shipping-service:12006`)
- `AI_OS_URL` (default `http://ai-os:12010`)

