# Enterprise Shipping Logistics Microservice Implementation Plan

Building a robust, scalable, and enterprise-grade shipping logistics microservice integrated into the existing `taxi-server` architecture.

## User Review Required

> [!IMPORTANT]
> **Authentication & Roles**: We will use the existing `auth-service` and `Driver` model. We will introduce new roles: `Truck Driver` and `Sea Navigator`.
> **Shared Database**: The service will use the shared `taxi_service` MongoDB database, maintaining consistency across the platform.
> **Real Carrier Integration**: This plan includes real integration with **FedEx** and **DHL**. You will need to provide production API credentials (`FEDEX_CLIENT_ID`, `FEDEX_CLIENT_SECRET`, `DHL_API_KEY`) in the `.env` file.

## Analysis of Cargo-Tracker Reference Apps

### Features Found
- Basic shipment creation (Origin, Destination, Checkpoints).
- Tracking by tracking number.
- Location updates (simulated).
- Simple distance/ETA calculation.

### Shortcomings & Enterprise Enhancements
- **No Real-time Messaging**: We will integrate **RabbitMQ** for event-driven updates (e.g., notifying customers, updating inventory).
- **JS vs TS**: We will use **TypeScript** for type safety and better developer experience.
- **Shared DB & Roles**: Using `taxi_service` DB and extending roles to include `Truck Driver` and `Sea Navigator`.
- **Real Carrier Integration**: Implementation of FedEx and DHL API clients.
- **Basic State Machine**: We will implement a strict state machine for shipment transitions.
- **Lack of Audit Logs**: We will implement an `AuditLog` model to track every change.
- **Scalability**: The new service will be containerized and integrated into the `api-gateway`.

## Proposed Changes

### [NEW] Shipping Microservice (`taxi-server/server/shipping-service`)
A dedicated microservice handling all logistics logic.

#### [NEW] [package.json](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/package.json)
- Dependencies: `express`, `mongoose`, `amqplib`, `cors`, `dotenv`, `winston`, `express-validator`.
- DevDependencies: `typescript`, `@types/*`, `nodemon`.

#### [NEW] [tsconfig.json](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/tsconfig.json)
Standard TS configuration for Node.js.

#### [NEW] [models/shipment.model.ts](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/src/models/shipment.model.ts)
Enhanced schema including:
- `ownerId`: Reference to the user who created it.
- `assignedDriverId`: Reference to a driver (with `Truck Driver` or `Sea Navigator` roles).
- `carrier`: Enum (Internal, FedEx, DHL).
- `externalTrackingNumber`: For FedEx/DHL shipments.
- `packageDetails`: Detailed item breakdown (weight, dimensions required for carriers).
- `status`: Enum (Draft, Pending, In_Transit, Arrived_At_Terminal, Out_For_Delivery, Delivered, Exception, Cancelled).
- `auditLog`: Embedded or separate collection for state changes.

#### [NEW] [services/carrier.service.ts](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/src/services/carrier.service.ts)
Abstraction layer for:
- **FedExClient**: Handles OAuth and shipment creation.
- **DHLClient**: Handles API key authentication and shipment booking.

#### [NEW] [controllers/shipment.controller.ts](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/src/controllers/shipment.controller.ts)
Logic for CRUD, status transitions, carrier booking, and publishing events to RabbitMQ.

#### [NEW] [services/rabbitmq.service.ts](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/src/services/rabbitmq.service.ts)
Producer to publish `shipment.created`, `shipment.status.updated`, etc.

#### [NEW] [Dockerfile](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/shipping-service/Dockerfile)
Multi-stage build for the TS service.

---

### API Gateway Integration

#### [MODIFY] [index.ts](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/server/api-gateway/index.ts)
- Add `SHIPPING_SERVICE_URL`.
- Add proxy middleware for `/api/v1/shipping`.

#### [MODIFY] [docker-compose.yml](file:///Users/test1/Desktop/DemoProjects/Taxi-Hauling/taxibooking-userapp/taxi-server/docker-compose.yml)
- Add `shipping-service` definition.
- Link it to `mongodb`, `rabbitmq`, and `api-gateway`.

## Verification Plan

### Automated Tests
- Integration tests using `supertest` to verify CRUD operations via the API Gateway.
- Mock RabbitMQ to verify events are published correctly.

### Manual Verification
1. Start the microservices using `docker-compose up`.
2. Use Postman/Curl to create a shipment through the gateway (`:12000/api/v1/shipping`).
3. Verify status updates trigger log entries and (optionally) check RabbitMQ management UI for messages.
