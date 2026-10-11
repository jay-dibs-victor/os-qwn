# API Gateway Service

## The Idea
The API Gateway acts as the single point of entry for all external traffic (User App, Driver App, Admin Dashboard) into the Queens microservices architecture. It routes requests, orchestrates API calls, and acts as a security perimeter for the internal network.

## Business Model Contribution
- **Scalability & Security:** Protects core business logic from direct exposure to the internet, handling rate limiting and DDoS mitigation to ensure high availability.
- **Unified Client Experience:** Aggregates responses from multiple microservices (e.g., fetching a user profile and active rides simultaneously), reducing latency on mobile networks.

## Core Features
- **Reverse Proxy Routing:** Dynamically forwards RESTful and WebSocket traffic to the appropriate downstream microservice (Auth, Ride, Shipping, etc.).
- **Authentication Termination:** Validates JWTs and session tokens before requests reach internal services.
- **Rate Limiting & Throttling:** Protects the platform from abuse by capping API requests per user/IP.
- **Request Aggregation:** Combines multiple microservice calls into single GraphQL or REST responses for frontend optimization.
