# Flight Inventory Service

## The Idea
The Flight Inventory Service is responsible for maintaining and querying the availability of flights, routes, and pricing. It acts as an abstraction layer between the Queens frontend and external Global Distribution Systems (GDS).

## Business Model Contribution
- **Data Monetization & Caching:** Reduces expensive external API calls by caching popular routes locally, lowering operational costs.
- **Dynamic Packaging:** Allows the business to combine flight inventory with local hotel or ride inventory for packaged deals.

## Core Features
- **GDS Integration:** Polls external airline databases for real-time seat availability and pricing.
- **Inventory Caching Engine:** Uses Redis to store highly queried routes to provide instant search results to users.
- **Pricing Normalization:** Converts complex airline pricing matrices into a simplified format for the User App.
