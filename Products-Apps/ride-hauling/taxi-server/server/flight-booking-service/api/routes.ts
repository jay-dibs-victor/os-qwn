import { Router } from 'express';
import BookingController from '../controllers/booking.controller';
import FlightPaymentController from '../controllers/payment.controller';
import { GamificationController } from '../controllers/GamificationController';


export default class BookingRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post('/', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Create a new flight booking'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Booking details with passenger info',
        schema: { $ref: '#/definitions/CreateBooking' }
      } */
      next();
    }, BookingController.createBooking);
    this.router.get('/:id', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Get a specific booking by ID'
      /* #swagger.parameters['id'] = { description: 'Booking ID' } */
      next();
    }, BookingController.getBooking);
    this.router.patch('/:id', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Cancel a flight booking'
      /* #swagger.parameters['id'] = { description: 'Booking ID' } */
      next();
    }, BookingController.cancelBooking);
    
    this.router.post('/cart', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Add a flight to the cart'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Cart item details',
        schema: { $ref: '#/definitions/AddToCart' }
      } */
      next();
    }, FlightPaymentController.addToCart);
    this.router.post('/checkout', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Checkout and initiate payment for cart items'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Checkout payload with callback URL',
        schema: { $ref: '#/definitions/CheckoutCart' }
      } */
      next();
    }, FlightPaymentController.checkout);
    this.router.get('/verify', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Verify a flight payment transaction'
      next();
    }, FlightPaymentController.verifyPayment);
    this.router.get('/user/:userId', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Get all bookings for a specific user'
      /* #swagger.parameters['userId'] = { description: 'User ID' } */
      next();
    }, BookingController.getUserBookings);
    this.router.get('/admin/all', (req, res, next) => {
      // #swagger.tags = ['Admin']
      // #swagger.summary = 'Admin: List all flight bookings'
      next();
    }, BookingController.getAllBookings);
    
    this.router.post('/lottery/initiate', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Initiate a flight lottery entry'
      next();
    }, GamificationController.initiateLottery);
    this.router.post('/lottery/verify', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Verify a lottery payment'
      next();
    }, GamificationController.verifyLotteryPayment);
    this.router.post('/lottery/draw', (req, res, next) => {
      // #swagger.tags = ['Flights']
      // #swagger.summary = 'Draw winners for a completed lottery'
      next();
    }, GamificationController.drawWinners);
    
    return this.router;
  }
}
