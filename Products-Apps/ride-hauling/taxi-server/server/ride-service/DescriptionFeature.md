# Ride Service

## The Idea
The Ride Service is the core engine for passenger mobility. It handles the lifecycle of point-to-point taxi and scooter rides, from initial request and pricing calculation to driver matching and trip completion.

## Business Model Contribution
- **Primary Revenue Driver:** Handles the core transaction logic for ride-hailing, calculating the fare matrix and applying commission rates.
- **Dynamic Pricing Engine:** Implements surge pricing algorithms based on demand density to maximize revenue during peak hours.

## Core Features
- **Ride Lifecycle Management:** State machine handling states: Requested, Accepted, Arrived, In-Transit, and Completed.
- **Geospatial Matching:** Queries driver locations to find the nearest optimal vehicle for a dispatch.
- **Fare Calculation Engine:** Computes base fare, distance rate, time rate, and dynamic multipliers.
- **Event Sourcing:** Emits RabbitMQ events for status changes to update frontends in real-time.
