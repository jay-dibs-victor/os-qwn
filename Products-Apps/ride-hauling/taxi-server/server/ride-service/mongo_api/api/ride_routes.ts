import { Router } from 'express';
import RideController from '../controllers/ride_controller';
import RideTypeController from '../controllers/ridetype_controller';
import TokenVerification from '../middlewares/token_validator';

class RideRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/rides/request',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Create a new ride request'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Ride request details with pickup/dropoff coordinates',
          schema: { $ref: '#/definitions/RideRequest' }
        } */
        next();
      },
      RideController.createRideRequest,
    );

    this.router.get(
      '/rides/history',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get ride history for the authenticated user'
        next();
      },
      RideController.getRideHistory,
    );

    this.router.get(
      '/rides/currency-info',
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get supported currencies and exchange rates'
        next();
      },
      RideController.getCurrencyInfo,
    );

    this.router.post(
      '/rides/accept',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Driver accepts a ride request'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Ride acceptance payload with driver ID',
          schema: { $ref: '#/definitions/RideAccept' }
        } */
        next();
      },
      RideController.acceptRide,
    );

    this.router.put(
      '/rides/status',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Update ride status (in_progress, completed, cancelled)'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Status update payload',
          schema: { $ref: '#/definitions/RideStatusUpdate' }
        } */
        next();
      },
      RideController.updateRideStatus,
    );

    this.router.get(
      '/rides/logistics-stats',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get logistics/ride statistics for the user'
        next();
      },
      RideController.getLogisticsStats,
    );

    this.router.post(
      '/rides/feedback',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Submit feedback and rating for a completed ride'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Feedback with rating and comment',
          schema: { $ref: '#/definitions/RideFeedback' }
        } */
        next();
      },
      RideController.submitRideFeedback,
    );

    this.router.post(
      '/rides/multi-stop-quote',
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get a price quote for a multi-stop itinerary'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Multi-stop route with coordinates',
          schema: { $ref: '#/definitions/MultiStopQuote' }
        } */
        next();
      },
      RideController.getMultiStopQuote,
    );

    this.router.get(
      '/rides/types',
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'List all available ride types'
        next();
      },
      RideTypeController.getAllRideTypes,
    );

    this.router.get(
      '/rides/types/:id',
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get a specific ride type by ID'
        /* #swagger.parameters['id'] = { description: 'Ride type ID' } */
        next();
      },
      RideTypeController.getRideType,
    );

    this.router.post(
      '/rides/types',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Create a new ride type'
        next();
      },
      RideTypeController.createRideType,
    );

    this.router.put(
      '/rides/types/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Update a ride type by ID'
        /* #swagger.parameters['id'] = { description: 'Ride type ID' } */
        next();
      },
      RideTypeController.updateRideType,
    );

    this.router.delete(
      '/rides/types/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Delete a ride type by ID'
        /* #swagger.parameters['id'] = { description: 'Ride type ID' } */
        next();
      },
      RideTypeController.deleteRideType,
    );

    this.router.post(
      '/rides/verify-completion',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Verify the 4-digit completion code to end a ride'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Completion code verification',
          schema: { ride_id: '507f191e810c19729de860ea', code: '4829' }
        } */
        next();
      },
      RideController.verifyCompletionCode,
    );

    this.router.post(
      '/courier/handshake',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Courier']
        // #swagger.summary = 'Initiate handshake between user and courier rider'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Handshake with courier code and receiver details',
          schema: { $ref: '#/definitions/CourierHandshake' }
        } */
        next();
      },
      RideController.initiateHandshake,
    );

    this.router.post(
      '/courier/stop-status',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Courier']
        // #swagger.summary = 'Update status of a specific courier stop'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Stop index and new status',
          schema: { $ref: '#/definitions/CourierStopStatus' }
        } */
        next();
      },
      RideController.updateStopStatus,
    );

    this.router.get(
      '/rides/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Get single ride details by ID'
        /* #swagger.parameters['id'] = { description: 'Ride ID' } */
        next();
      },
      RideController.getRideDetails,
    );

    this.router.post(
      '/rides/settle-payment',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Finalize payment settlement for cash or bank transfer trips'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Payment settlement details',
          schema: { $ref: '#/definitions/PaymentSettlement' }
        } */
        next();
      },
      RideController.settlePayment,
    );

    return this.router;
  }
}

export default RideRoutes;
