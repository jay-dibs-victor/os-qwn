import { Request, Response } from 'express';
import Booking, { BookingStatus } from '../models/Booking.model';
import axios from 'axios';
import { MQService } from '../../shared/rabbitmq';
import AmadeusService from '../../flight-inventory-service/services/amadeus_service';
import Flight from '../../flight-inventory-service/models/Flight.model';
import { BookingService } from '../services/booking_service';

const FLIGHT_SERVICE_URL = process.env.FLIGHT_SERVICE_URL || 'http://localhost:12003';

export default class BookingController {
  static async createBooking(req: Request, res: Response) {
    try {
      const { flightId, userId, userEmail, username, noOfSeats, rawOffer } = req.body;
      
      let flight;
      let finalFlightId: any = flightId;

      // 1. Handle External Flights (Amadeus)
      if (flightId.toString().startsWith('ext-')) {
         if (!rawOffer) return res.status(400).json({ status: 400, message: 'Raw offer required for external flights' });
         
         // Confirm price with Amadeus
         const confirmed = await AmadeusService.confirmPrice(rawOffer);
         const offer = confirmed.flightOffers[0];
         
         // Persist to local DB so we have a record
         const localFlight = await Flight.create({
            flight_number: offer.itineraries[0].segments[0].number,
            departure_airport_id: offer.itineraries[0].segments[0].departure.iataCode,
            arrival_airport_id: offer.itineraries[0].segments[0].arrival.iataCode,
            departure_time: offer.itineraries[0].segments[0].departure.at,
            arrival_time: offer.itineraries[0].segments[0].arrival.at,
            price: parseFloat(offer.price.total),
            source: 'amadeus',
            raw_data: offer
         });
         
         flight = localFlight;
         finalFlightId = localFlight.id;
      } else {
         // Fetch from local Inventory Service
         const flightResponse = await axios.get(`${FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}`);
         flight = flightResponse.data.data;
      }
      
      if (!flight) {
        return res.status(404).json({ status: 404, message: 'Flight not found' });
      }
      
      if (flight.total_seats < noOfSeats) {
        return res.status(400).json({ status: 400, message: 'Not enough seats available' });
      }
      
      const totalCost = flight.price * noOfSeats;
      
      // 2. Fulfill Booking & Notify
      const booking = await BookingService.fulfillBooking(
        userId, 
        flight, 
        noOfSeats, 
        totalCost, 
        username, 
        userEmail
      );
      
      return res.status(201).json({ status: 201, data: booking });
    } catch (error) {
      console.error('Booking Error:', error.message);
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getBooking(req: Request, res: Response) {
    try {
      const booking = await Booking.findByPk(req.params.id as any);
      if (!booking) return res.status(404).json({ status: 404, message: 'Booking not found' });
      return res.status(200).json({ status: 200, data: booking });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async cancelBooking(req: Request, res: Response) {
    try {
      const booking = await Booking.findByPk(req.params.id as any);
      if (!booking) return res.status(404).json({ status: 404, message: 'Booking not found' });
      
      booking.status = BookingStatus.CANCELLED;
      await booking.save();
      
      return res.status(200).json({ status: 200, data: booking });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getUserBookings(req: Request, res: Response) {
    try {
      const bookings = await Booking.findAll({ 
        where: { user_id: req.params.userId },
        order: [['createdAt', 'DESC']]
      });
      return res.status(200).json({ status: 200, data: bookings });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  static async getAllBookings(req: Request, res: Response) {
    try {
      const bookings = await Booking.findAll({ order: [['createdAt', 'DESC']] });
      return res.status(200).json({ status: 200, data: bookings });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }
}
