# AI Operating System (taxi-ai-os-worker)

## The Idea
The AI Operating System (OS) is the intelligent backend worker that monitors fleet health, optimizes dispatch matching, and acts as the "brain" of the Queens platform. It sits above individual microservices to orchestrate complex background tasks.

## Business Model Contribution
- **Operational Automation:** Reduces the need for human dispatchers by automating anomaly detection, driver re-assignment, and surge pricing logic.
- **Predictive Analytics:** Analyzes historical ride data to predict high-demand zones, allowing operators to proactively position fleets and maximize revenue.

## Core Features
- **Background Job Processing:** Utilizes Agenda/RabbitMQ to execute delayed and recurring tasks (e.g., expiring unaccepted ride requests, executing scheduled multi-stop deliveries).
- **Fleet Anomaly Detection:** Monitors driver telemetry to detect stalled vehicles, off-route drivers, or potential safety issues.
- **Dynamic Dispatch Optimization:** Uses machine learning heuristics to match drivers not just on straight-line distance, but on ETA, driver rating, and current trajectory.
- **Surge Engine Controller:** Continuously evaluates supply vs. demand in specific geofences to trigger dynamic pricing multipliers across the Ride and Shipping services.
