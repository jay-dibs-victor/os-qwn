# Shipping Service

## The Idea
The Shipping Service orchestrates complex, multi-leg logistics and package delivery. It is built specifically to handle courier dispatching, complex itineraries, and proof-of-delivery protocols.

## Business Model Contribution
- **B2B Revenue Stream:** Enables enterprise logistics by allowing business accounts to bulk-dispatch packages to multiple locations.
- **High Margin Operations:** Courier dispatches (especially via scooter) often carry higher profit margins per mile than passenger transport in urban centers.

## Core Features
- **Multi-Stop Itinerary Logic:** Calculates optimal routing and pricing for trips with multiple delivery waypoints.
- **OTP Handshake Verification:** Generates and validates unique codes required at pickup and drop-off to ensure package chain-of-custody.
- **Progressive Batching:** Groups deliveries dynamically based on courier capacity and trajectory.
- **Scheduled Logistics:** Manages future-dated delivery requests via Agenda background jobs.
