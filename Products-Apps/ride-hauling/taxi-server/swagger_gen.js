const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Queens Booking API',
    description: 'API documentation for the Queens Taxi Booking system, including user management, cab booking, ride hailing, driver onboarding, flight bookings, shipping, and AI-powered assistance.',
    version: '2.0.0',
    contact: {
      email: 'juwavictor@gmail.com'
    }
  },
  host: 'localhost:12000',
  basePath: '/api/v1',
  schemes: ['http', 'https'],
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Add your JWT token here (e.g., Bearer <token>)'
    }
  },
  tags: [
    { name: 'Auth', description: 'User registration, login, email verification, password management, OAuth (Google)' },
    { name: 'Drivers', description: 'Driver authentication, profile, SOS, availability, and assigned trips' },
    { name: 'Rides', description: 'Ride requests, acceptance, status updates, history, feedback, multi-stop quotes, payment settlement' },
    { name: 'Courier', description: 'Courier handshake and stop-status management for package delivery' },
    { name: 'User Profile', description: 'User profile updates, saved places, emergency contacts, referral codes, vouchers' },
    { name: 'Wallet', description: 'Wallet balance, payments via Paystack, payment history, quotations' },
    { name: 'Admin', description: 'Admin dashboard: manage users, drivers, partners, cars, inspections, drive tests, roles, audit logs, SOS alerts, tickets, FAQs, settings, analytics' },
    { name: 'Gamification', description: 'Gamification stats, taxi-coin exchange, buying coins' },
    { name: 'Onboarding', description: 'User preferences and driver onboarding with document uploads' },
    { name: 'Cars', description: 'Car profile management (CRUD)' },
    { name: 'FAQs', description: 'Frequently Asked Questions management' },
    { name: 'Feedback', description: 'User feedback/submissions (intervention reports) CRUD' },
    { name: 'Flights', description: 'Flight booking, inventory search, payment orchestration, gamification lottery' },
    { name: 'Shipping', description: 'Shipment creation, tracking, status updates' },
    { name: 'AI OS', description: 'AI operating system: health check, natural language AI commands, LiveKit sessions, Temporal workflows' },
    { name: 'Chat', description: 'Chat message retrieval' }
  ],
  definitions: {
    signup: {
      firstname: 'John',
      lastname: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phoneNumber: '08012345678',
      password: 'password123',
      user_type: 'Individual User'
    },
    login: {
      email: 'john@example.com',
      password: 'password123'
    },
    user: {
      id: 1,
      _id: '507f191e810c19729de860ea',
      firstname: 'John',
      lastname: 'Doe',
      email: 'john@example.com',
      username: 'johndoe',
      phone_number: '08012345678',
      roles: 'user',
      isVerified: true,
      balance: '1000.00',
      avatar: 'https://example.com/avatar.jpg',
      user_type: 'Individual'
    },
    RideRequest: {
      pickup_lat: 6.45,
      pickup_lng: 3.39,
      dest_lat: 6.52,
      dest_lng: 3.37,
      pickup_address: '123 Example Street, Lagos',
      dest_address: '456 Sample Road, VI',
      is_shared: false,
      passengers: 1,
      ride_type: 'Regular',
      scheduled_time: '2026-06-12T14:30:00Z'
    },
    RideAccept: {
      ride_id: '507f191e810c19729de860ea',
      driver_id: 42,
      estimated_arrival_minutes: 8
    },
    RideStatusUpdate: {
      ride_id: '507f191e810c19729de860ea',
      status: 'in_progress',
      completion_code: '4829'
    },
    RideFeedback: {
      ride_id: '507f191e810c19729de860ea',
      rating: 5,
      comment: 'Great ride, very professional driver!'
    },
    MultiStopQuote: {
      stops: [
        { lat: 6.45, lng: 3.39 },
        { lat: 6.52, lng: 3.37 },
        { lat: 6.60, lng: 3.35 }
      ],
      ride_type: 'Regular'
    },
    CourierHandshake: {
      ride_id: '507f191e810c19729de860ea',
      courier_code: 'CR-001',
      receiver_phone: '08099887766'
    },
    CourierStopStatus: {
      ride_id: '507f191e810c19729de860ea',
      stop_index: 0,
      status: 'completed'
    },
    PaymentSettlement: {
      ride_id: '507f191e810c19729de860ea',
      amount: 4500,
      method: 'cash'
    },
    ScheduledTrip: {
      start_location: 'Ikeja',
      destination: 'Victoria Island',
      pickup_time: '2026-04-20 10:00 AM',
      travel_option: 'intracity',
      drive_option: 'Driver Required'
    },
    PlanTrip: {
      plan_id: 'PLAN-123',
      user_id: 1,
      plan_name: 'Saver',
      price: 5000,
      duration: '15 hours'
    },
    Quote: {
      full_name: 'John Doe',
      email: 'john@example.com',
      amount: 4500,
      plan_id: 'PLAN-123',
      reference: 'REF-998877'
    },
    Checkout: {
      amount: 5000,
      email: 'john@example.com',
      plan_id: 'PLAN-123',
      callback_url: 'https://myapp.com/callback'
    },
    Payment: {
      status: 'Successful',
      amount: 5000,
      reference: 'PAY-123456',
      email: 'john@example.com'
    },
    Courier: {
      pickup_address: '123 Lagos St',
      delivery_address: '456 Ikeja Way',
      receiver_name: 'Jane Doe',
      receiver_phone: '08099887766',
      package_type: 'Documents',
      weight: '1kg'
    },
    Car: {
      manufacturer: 'Toyota',
      carModel: 'Camry',
      plateNo: 'ABC-123-DE',
      vehicleColor: 'Black',
      carYear: '2020',
      seats: 4
    },
    GamificationStats: {
      taxi_coins: 1500,
      streak_count: 5,
      completed_trips: 12,
      referred_users_count: 3,
      referred_drivers_count: 1,
      history: [
        { amount: 50, type: 'REWARD', reason: 'Streak Bonus', created_at: '2026-04-18T10:00:00Z' }
      ],
      exchange_rate: 2
    },
    CoinExchange: {
      amount: 500
    },
    OnboardingPreferences: {
      userId: 'USER-123',
      preferences: {
        music: 'Jazz',
        temperature: 'Cool',
        conversation: 'Quiet'
      }
    },
    DriverVettingDetails: {
      driverId: 'DRIVER-123',
      ssn: '123-456-789',
      licenseNumber: 'L-1234567',
      licenseExpiry: '2028-12-31',
      address: '123 Taxi Way, Lagos',
      isPartner: false,
      partnerDetails: {
        companyName: 'FleetCo',
        registrationNumber: 'RC-123456',
        fleetSize: 10
      }
    },
    googleIdToken: {
      idToken: 'eyJhbGciOiJSUzI1NiIs...',
      role: 'user'
    },
    forgotPassword: {
      email: 'john@example.com'
    },
    resetPassword: {
      password: 'newPassword123',
      token: 'reset-token-abc-123'
    },
    verifyCode: {
      email: 'john@example.com',
      code: '123456'
    },
    DriverSignup: {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane@example.com',
      phoneNumber: '08098765432',
      password: 'driverPass123',
      user_type: 'Individual Driver'
    },
    DriverLogin: {
      email: 'jane@example.com',
      password: 'driverPass123'
    },
    DriverOnlineStatus: {
      is_online: true
    },
    DriverLocationUpdate: {
      latitude: '6.45',
      longitude: '3.39',
      socketId: 'socket-abc-123'
    },
    SOSAlert: {
      type: 'emergency',
      latitude: 6.45,
      longitude: 3.39,
      message: 'I need help!'
    },
    Notification: {
      user_id: 'USER-123',
      title: 'Ride reminder',
      message: 'Your driver is arriving in 5 minutes',
      type: 'ride_alert'
    },
    FeedbackCreate: {
      title: 'Road issue',
      type: 'intervention',
      comment: 'There is heavy traffic on Third Mainland Bridge',
      location: '6.45, 3.39'
    },
    CreateCar: {
      manufacturer: 'Toyota',
      carModel: 'Camry',
      plateNo: 'ABC-123-DE',
      vehicleColor: 'Black',
      carYear: '2020',
      seats: 4,
      ownerId: 'USER-123'
    },
    FlightSearch: {
      origin: 'LOS',
      destination: 'ABV',
      departure_date: '2026-07-15',
      passengers: 1,
      cabin_class: 'economy'
    },
    CreateBooking: {
      flight_id: '507f191e810c19729de860ea',
      user_id: 'USER-123',
      passengers: [
        { firstname: 'John', lastname: 'Doe', date_of_birth: '1990-01-15' }
      ],
      cabin_class: 'economy'
    },
    AddToCart: {
      flight_id: '507f191e810c19729de860ea',
      user_id: 'USER-123',
      quantity: 1,
      cabin_class: 'economy'
    },
    CheckoutCart: {
      user_id: 'USER-123',
      callback_url: 'https://myapp.com/payment/callback',
      gateway: 'paystack'
    },
    CreateShipment: {
      origin: 'Lagos',
      destination: 'Abuja',
      weight: 5.0,
      dimensions: { length: 30, width: 20, height: 15 },
      description: 'Electronics',
      sender_name: 'John Doe',
      sender_phone: '08012345678',
      receiver_name: 'Jane Smith',
      receiver_phone: '08098765432'
    },
    UpdateShipmentStatus: {
      status: 'in_transit',
      location: 'Kaduna'
    },
    AICommand: {
      message: 'Book me a ride from Lagos Island to Ikeja',
      sessionId: 'optional-uuid',
      userId: 'user-123'
    },
    WorkflowStart: {
      ride_id: '507f191e810c19729de860ea',
      user_id: 'USER-123',
      driver_id: 42
    },
    WorkflowSignal: {
      action: 'cancel',
      reason: 'User cancelled'
    }
  }
};

const outputFile = './swagger.json';
const endpointsFiles = [
  './server/ride-service/mongo_api/api/routes.ts',
  './server/ride-service/mongo_api/api/onboarding_routes.ts',
  './server/ride-service/mongo_api/api/sos_routes.ts',
  './server/ride-service/mongo_api/api/faqs_routes.ts',
  './server/ride-service/mongo_api/api/intervention_routes.ts',
  './server/ride-service/mongo_api/api/cars_routes.ts',
  './server/ride-service/mongo_api/api/feedback_routes.ts',
  './server/ride-service/mongo_api/api/ride_routes.ts',
  './server/ride-service/mongo_api/api/user_routes.ts',
  './server/ride-service/mongo_api/api/gamification_routes.ts',
  './server/ride-service/mongo_api/api/driver_routes.ts',
  './server/ride-service/mongo_api/route/chatroute.ts',
  './server/auth-service/mongo_api/api/routes.ts',
  './server/auth-service/mongo_api/api/auth_routes.ts',
  './server/auth-service/mongo_api/route/chatroute.ts',
  './server/flight-booking-service/api/routes.ts',
  './server/flight-inventory-service/api/routes.ts',
  './server/shipping-service/src/routes/shipment.routes.ts'
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  console.log('Swagger documentation generated successfully!');
});
