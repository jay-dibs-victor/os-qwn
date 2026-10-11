# Web App Compose Options

These compose files let you run each web app independently while keeping the existing compose setups intact.

From [Products-Apps](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/Products-Apps):

## User Web App

```bash
docker compose -f compose/docker-compose.user-frontend.yml up -d --build
```

Optional environment overrides:
- `USER_FRONTEND_PORT` (default `4002`)
- `VITE_API_URL` (default `http://localhost:12000/api/v1`)

## Driver Web App

```bash
docker compose -f compose/docker-compose.driver-frontend.yml up -d --build
```

Optional environment overrides:
- `DRIVER_FRONTEND_PORT` (default `4004`)
- `VITE_API_URL` (default `http://localhost:12000/api/v1`)

