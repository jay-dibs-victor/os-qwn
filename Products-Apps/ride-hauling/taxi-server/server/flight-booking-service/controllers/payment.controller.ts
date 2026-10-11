import { Request, Response } from 'express';
import Cart from '../models/Cart.model';
import FlightPayment, { PaymentStatus } from '../models/Payment.model';
import Booking, { BookingStatus } from '../models/Booking.model';
import { MultiPaymentService } from '../services/multi_payment_service';
import { BookingService } from '../services/booking_service';

export default class FlightPaymentController {
  /**
   * Add a flight offer to the user's cart
   */
  static async addToCart(req: Request, res: Response) {
    try {
      const { userId, flightOffer } = req.body;
      let cart = await Cart.findOne({ where: { user_id: userId } });
      
      if (!cart) {
        cart = await Cart.create({ user_id: userId, items: [flightOffer], total_amount: parseFloat(flightOffer.price.total) });
      } else {
        const items = [...cart.items, flightOffer];
        const total = items.reduce((acc: number, item: any) => acc + parseFloat(item.price.total), 0);
        cart.items = items;
        cart.total_amount = total;
        await cart.save();
      }
      
      return res.status(200).json({ status: 200, data: cart });
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  /**
   * Initiate checkout and payment with global gateways
   */
  static async checkout(req: Request, res: Response) {
    try {
      const { userId, gateway, email, currency = 'USD' } = req.body;
      const cart = await Cart.findOne({ where: { user_id: userId } });
      
      if (!cart || cart.items.length === 0) {
        return res.status(400).json({ status: 400, message: 'Cart is empty' });
      }

      // Initiate payment via MultiPaymentService
      const paymentData = await MultiPaymentService.initiatePayment(
        gateway, 
        cart.total_amount, 
        currency, 
        email, 
        { cartId: cart.id, userId }
      );

      // Create Payment Record
      await FlightPayment.create({
        user_id: userId,
        amount: cart.total_amount,
        currency,
        gateway,
        gateway_reference: paymentData.data.reference || paymentData.data.id,
        status: PaymentStatus.PENDING,
        metadata: { cartId: cart.id }
      });

      return res.status(200).json({ status: 200, data: paymentData.data });
    } catch (error) {
      console.error('Checkout Error:', error.message);
      return res.status(500).json({ status: 500, error: error.message });
    }
  }

  /**
   * Handle payment verification and booking creation
   */
  static async verifyPayment(req: Request, res: Response) {
    try {
      const { reference, gateway } = req.query;
      if (!reference || !gateway) return res.status(400).json({ status: 400, message: 'Reference and Gateway required' });

      const payment = await FlightPayment.findOne({ where: { gateway_reference: reference as string } });
      if (!payment) return res.status(404).json({ status: 404, message: 'Payment record not found' });
      
      // Verify with MultiPaymentService
      const isSuccess = await MultiPaymentService.verifyPayment(gateway as string, reference as string);

      if (isSuccess) {
         payment.status = PaymentStatus.SUCCESS;
         await payment.save();
         
         // Create Bookings for each item in cart
         const cart = await Cart.findByPk(payment.metadata.cartId);
         if (cart) {
           for (const item of cart.items) {
              await BookingService.fulfillBooking(
                payment.user_id,
                item, // item contains flight details
                1,
                parseFloat(item.price.total),
                'User', // TODO: Get username from user service or metadata
                payment.user_id // email/userId
              );
           }
           // Clear Cart after successful booking
           cart.items = [];
           cart.total_amount = 0;
           await cart.save();
         }
         
         return res.status(200).json({ status: 200, message: 'Payment successful, bookings created' });
      } else {
         payment.status = PaymentStatus.FAILED;
         await payment.save();
         return res.status(400).json({ status: 400, message: 'Payment verification failed' });
      }
    } catch (error) {
      return res.status(500).json({ status: 500, error: error.message });
    }
  }
}
