import Booking, { BookingStatus } from '../models/Booking.model';
import { MQService } from '../../shared/rabbitmq';

export class BookingService {
  static async fulfillBooking(userId: string, flight: any, noOfSeats: number, totalCost: number, username?: string, userEmail?: string) {
    // 1. Create Booking
    const booking = await Booking.create({
      flight_id: flight.id,
      user_id: userId,
      no_of_seats: noOfSeats,
      total_cost: totalCost,
      status: BookingStatus.BOOKED
    });

    // 2. Publish Notification Event
    await MQService.publish('flight_events', 'FLIGHT_BOOKED', {
      bookingId: booking.id,
      userEmail,
      username,
      flightNumber: flight.flight_number,
      departure: flight.departure_airport_id,
      arrival: flight.arrival_airport_id,
      time: flight.departure_time
    });

    return booking;
  }
}
