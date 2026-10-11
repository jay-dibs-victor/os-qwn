# Flight Notification Service

## The Idea
The Flight Notification Service is a dedicated communication engine that keeps travelers updated on their flight status, gate changes, delays, and boarding times.

## Business Model Contribution
- **Premium User Experience:** Providing reliable, timely updates prevents missed flights and builds high customer loyalty.
- **Proactive Support:** Reduces customer support overhead by automatically informing users of disruptions before they have to ask.

## Core Features
- **Real-Time Alerting:** Listens to webhook events from airline APIs and pushes critical updates (e.g., delays) to the user's mobile app.
- **Multi-Channel Delivery:** Sends notifications via Push, SMS (Termii), and Email (Mailjet).
- **Automated Reminders:** Schedules 24-hour and 3-hour check-in and departure reminders using Agenda jobs.
