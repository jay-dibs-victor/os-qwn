The fare computation across the Home and Plan pages follows a unified, location-aware logic designed for global consistency. Here is exactly how the math works:

1. The Global Base Logic (In USD)
To ensure fairness regardless of local currency volatility, all fares are first calculated using a USD base model. We use the following constants:

Base Fare: $0.50
Rate per KM: $0.15
Rate per Minute: $0.05
The Formula: USD_Fare = 0.50 + (Distance_KM * 0.15) + (Estimated_Minutes * 0.05)

2. Real-Time Currency Conversion
Once the USD fare is calculated, the system performs a conversion using the real-time exchange rate for the user's current location:

The backend detects the user's country (e.g., Nigeria) via reverse geocoding of the pickup coordinates.
It fetches the current exchange rate (e.g., 1 USD = 1,500 NGN).
Final_Price = USD_Fare * Exchange_Rate.
3. Execution on Different Pages
Home Page (Instant Feedback)
Local Prediction: As you type, the frontend uses the haversineKm utility to calculate distance instantly.
Live Rate: It fetches the current exchange rate via a new /rides/currency-info API as soon as you pick a location.
Result: The "Live" price you see is (Local_Math_USD * Live_Exchange_Rate). This ensures there is zero lag in the UI.
Plan Page (Final Quote)
Backend Quote: When you move to the Plan page, the frontend sends the coordinates to the /rides/multi-stop-quote API.
Precise Route: The backend uses professional Map APIs to get the actual driving distance (not just straight-line).
Final Result: The API returns the precise total_fare and currency_symbol already processed through the USD -> Local conversion logic.
Summary of the Flow
Step	Action	Responsibility
Distance	Calculates KM (Straight-line or Road-mapped)	Frontend (Home) / API (Plan)
Math	Base + (KM * 0.15) + (Min * 0.05)	Unified USD Logic
Localization	Price * RealTime_ExchangeRate	Location-Aware Service
Display	Shows symbol (e.g., ₦) + rounded total	Frontend Component
This approach ensures that whether a user is in Lagos, London, or New York, the underlying pricing model is consistent, but the price they pay is always in their familiar local currency.