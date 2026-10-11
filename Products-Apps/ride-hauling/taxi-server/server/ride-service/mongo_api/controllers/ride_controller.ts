import { Request, Response } from 'express';
import { RideService } from '../services/ride_service';

export default class RideController {
  static createRideRequest(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Create a new ride request'
      #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/RideRequest' }
      }
    */
    return RideService.createRideRequest(request, response);
  }

  static getRideHistory(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Get ride history for the authenticated user'
    */
    return RideService.getRideHistory(request as any, response as any);
  }

  static getRideDetails(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Get single ride details by ID'
    */
    return RideService.getRideDetails(request, response);
  }

  static acceptRide(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Driver accepts a ride'
      #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/RideAccept' }
      }
    */
    return RideService.acceptRide(request, response);
  }

  static updateRideStatus(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Update ride status'
      #swagger.parameters['body'] = {
        in: 'body',
        schema: { $ref: '#/definitions/RideStatusUpdate' }
      }
    */
    return RideService.updateRideStatus(request, response);
  }

  static getLogisticsStats(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Get logistics stats'
    */
    return RideService.getLogisticsStats(request as any, response as any);
  }

  static submitRideFeedback(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Submit user feedback for a completed ride'
    */
    return RideService.submitRideFeedback(request as any, response as any);
  }

  static getMultiStopQuote(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Get price quote for multi-stop itinerary'
    */
    return RideService.calculateMultiStopQuote(request, response);
  }

  static verifyCompletionCode(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Verify the 4-digit completion code'
    */
    return RideService.verifyCompletionCode(request, response);
  }

  static initiateHandshake(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Courier']
      #swagger.summary = 'Initiate handshake between user and courier rider'
    */
    return RideService.initiateHandshake(request, response);
  }

  static updateStopStatus(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Courier']
      #swagger.summary = 'Update status of a specific stop (Rider done or User vet)'
    */
    return RideService.updateStopStatus(request, response);
  }

  static getCurrencyInfo(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Get currency and exchange rate for a location'
    */
    return RideService.getCurrencyInfo(request, response);
  }

  static settlePayment(request: Request, response: Response) {
    /* 
      #swagger.tags = ['Rides']
      #swagger.summary = 'Finalize payment and complete the ride'
    */
    return RideService.settlePayment(request, response);
  }
}

