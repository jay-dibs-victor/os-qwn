const BASE_URL = 'https://api.queens-lagos.com/v1';

const delay = (ms = 800) => new Promise(r => setTimeout(r, ms));

const mockUser = {
  id: 'u-001',
  name: 'Brian Oshinbolu',
  email: 'brian@queenslagos.app',
  phone: '+234 812 345 6789',
  rating: 4.95,
  savedPlaces: [
    { id: 'home', label: 'Home', location: 'Lekki Phase 1, Lagos', lat: 6.4281, lon: 3.4215 },
    { id: 'work', label: 'Work', location: 'Victoria Island, Lagos', lat: 6.4281, lon: 3.4215 },
  ],
  paymentMethods: [
    { id: 'wallet', type: 'wallet', label: 'Digital Wallet', balance: 6500, default: true },
    { id: 'card_1', type: 'card', label: 'Mastercard • 1234', last4: '1234', default: false },
    { id: 'cash', type: 'cash', label: 'Cash', default: false },
  ],
};

const mockTransactions = [
  { id: 'txn_1', type: 'payment', merchant: 'Ride to Ikeja Mall', amount: -4200, date: '2026-05-28', status: 'completed' },
  { id: 'txn_2', type: 'topup', merchant: 'Wallet Top Up', amount: 10000, date: '2026-05-27', status: 'completed' },
  { id: 'txn_3', type: 'payment', merchant: 'Ride to Victoria Island', amount: -1800, date: '2026-05-26', status: 'completed' },
  { id: 'txn_4', type: 'bonus', merchant: 'Referral Bonus', amount: 1500, date: '2026-05-25', status: 'completed' },
  { id: 'txn_5', type: 'payment', merchant: 'Ride to Airport', amount: -3500, date: '2026-05-24', status: 'completed' },
];

const mockRides = [
  { id: 'ride_1', date: '2026-05-28', pickup: 'Lekki Phase 1', dropoff: 'Ikeja City Mall', fare: 4200, status: 'completed', driver: 'Tunde', rating: 5, distance: '18.4km', duration: '35min' },
  { id: 'ride_2', date: '2026-05-26', pickup: 'Adekunle Lawal Road', dropoff: 'Victoria Island', fare: 1800, status: 'completed', driver: 'Emeka', rating: 4, distance: '6.2km', duration: '15min' },
  { id: 'ride_3', date: '2026-05-24', pickup: 'Ikeja Along', dropoff: 'MMA Terminal 2', fare: 3500, status: 'completed', driver: 'Yusuf', rating: 5, distance: '14.1km', duration: '28min' },
  { id: 'ride_4', date: '2026-05-30', pickup: 'Lekki Phase 1', dropoff: 'Trinity House', fare: 1200, status: 'upcoming', driver: null, rating: null, distance: '3.5km', duration: '8min' },
];

const mockNotifications = [
  { id: 'notif_1', type: 'promo', title: 'Weekend Deal!', body: '25% off all rides to the Island. Use code LAGOS25.', read: false, timestamp: '2026-05-28T10:00:00Z' },
  { id: 'notif_2', type: 'ride', title: 'Trip Completed', body: 'Your ride to Ikeja Mall was ₦4,200. Rate Tunde!', read: false, timestamp: '2026-05-28T09:45:00Z' },
  { id: 'notif_3', type: 'bonus', title: '₦1,500 Bonus Earned!', body: 'Brian O. joined Queens using your referral code. Thanks!', read: true, timestamp: '2026-05-27T14:30:00Z' },
  { id: 'notif_4', type: 'warning', title: 'Surge Pricing Active', body: 'Lekki & VI are experiencing high demand. Fares are 1.2x.', read: true, timestamp: '2026-05-27T08:00:00Z' },
];

const mockFaqs = [
  { question: 'How do I book a ride?', answer: 'Open the app, enter your destination, select a vehicle type, and confirm. A nearby driver will be assigned.' },
  { question: 'Can I pay with cash?', answer: 'Yes. Select "Cash" as your payment method before booking. Pay the driver directly after the ride.' },
  { question: 'How does surge pricing work?', answer: 'During high demand, prices may increase by 1.2x. You can use Surge-Free Tokens to skip the surge.' },
  { question: 'How do I cancel a ride?', answer: 'Tap Cancel in the active trip sheet. If the driver has already started moving, a ₦500 fee may apply.' },
  { question: 'What is a Surge-Free Token?', answer: 'Earn 1 token per completed ride. Redeem 1 token to skip surge pricing on your next trip.' },
  { question: 'How do I refer a friend?', answer: 'Go to Profile → Referral Code. Share your code — you and your friend each get ₦1,500.' },
  { question: 'Is Queens safe?', answer: 'All drivers are licensed and background-checked. You can share your trip live and access our SOS emergency toolkit.' },
  { question: 'What is the cancellation fee?', answer: '₦500 if the driver is already en route. No fee if cancelled within the first 10 seconds of matching.' },
];

const mockTickets = [
  { id: 'TK-001', subject: 'Lost item in ride', status: 'resolved', date: '2026-05-20' },
  { id: 'TK-002', subject: 'Fare discrepancy', status: 'pending', date: '2026-05-28' },
];

export const api = {
  /* ── Auth ── */
  login: async (data) => {
    await delay();
    if (!data.username || !data.password) throw new Error('Invalid credentials');
    return { token: 'qtk_' + Math.random().toString(36).slice(2), user: mockUser };
  },
  register: async (data) => {
    await delay(1000);
    return { user: { ...mockUser, name: data.fullName, email: data.email, phone: data.phone } };
  },
  verifyOtp: async (code) => {
    await delay();
    if (code !== '123456') throw new Error('Invalid verification code');
    return { valid: true };
  },
  forgotPassword: async (email) => {
    await delay();
    return { message: 'Recovery link sent to ' + email };
  },

  /* ── User Profile ── */
  getUser: async () => {
    await delay();
    return mockUser;
  },
  updateUser: async (data) => {
    await delay();
    return { ...mockUser, ...data };
  },
  getUserWallet: async () => {
    await delay();
    return { balance: 6500, coins: 12, transactions: mockTransactions };
  },
  topUpWallet: async (amount) => {
    await delay(1200);
    return { newBalance: 6500 + amount };
  },
  getUserRides: async (page = 1, limit = 10) => {
    await delay();
    return {
      rides: mockRides.slice((page - 1) * limit, page * limit),
      total: mockRides.length,
      page,
      hasMore: page * limit < mockRides.length,
    };
  },
  getNotifications: async () => {
    await delay();
    return mockNotifications;
  },
  markNotificationsRead: async () => {
    await delay();
    return { message: 'All marked as read' };
  },

  /* ── Trips ── */
  estimateFare: async (pickup, dropoff, vehicleType) => {
    await delay();
    const base = vehicleType === 'luxury' ? 5000 : vehicleType === 'standard' ? 2500 : 1200;
    return { fares: [{ type: vehicleType, price: base, eta: '3 min' }] };
  },
  requestRide: async (data) => {
    await delay(2000);
    return { tripId: 'trip_' + Date.now(), driver: { name: 'Tunde', car: 'Silver Toyota Corolla', plate: 'ABC-123-XY', rating: 4.9 } };
  },
  cancelRide: async (tripId, reason) => {
    await delay();
    return { fee: reason === 'driver_delay' ? 0 : 500, message: 'Trip cancelled' };
  },
  rateTrip: async (tripId, rating, tip, review) => {
    await delay();
    return { message: 'Thank you for your feedback!' };
  },
  getTripStatus: async (tripId) => {
    await delay();
    return { id: tripId, status: 'accepted', driver: { name: 'Tunde', rating: 4.8, lat: 6.438, lon: 3.435 } };
  },

  /* ── Support ── */
  getFaqs: async () => {
    await delay();
    return mockFaqs;
  },
  createTicket: async (data) => {
    await delay(1000);
    return { ticketId: 'TK-' + String(mockTickets.length + 1).padStart(3, '0'), status: 'pending' };
  },
  getTickets: async () => {
    await delay();
    return mockTickets;
  },
};
