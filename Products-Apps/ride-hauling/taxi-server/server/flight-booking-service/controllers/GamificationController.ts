import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { FlightLottery, LotteryPaymentStatus } from '../models/FlightLottery.model';

export class GamificationController {

  public static async initiateLottery(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id || 'guest';
      const { amount, currency, gateway } = req.body;

      // Ensure amount is at least 1000
      if (!amount || amount < 1000) {
        res.status(400).json({ success: false, message: 'Minimum amount for lottery is 1000' });
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7); // e.g., "2026-04"

      // Mocking payment gateway initialization (would call Stripe/Paystack API here)
      const reference = `LOTTERY_${uuidv4()}`;

      const lotteryEntry = await FlightLottery.create({
        user_id: userId,
        amount_paid: amount,
        currency: currency || 'NGN',
        payment_status: LotteryPaymentStatus.PENDING,
        month: currentMonth
      });

      res.status(200).json({
        success: true,
        message: 'Payment initiated',
        data: {
          lottery_id: lotteryEntry.id,
          reference: reference,
          authorization_url: 'https://mock.payment.gateway/checkout/' + reference // Mock URL
        }
      });
    } catch (error) {
      console.error('Error in initiateLottery:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public static async verifyLotteryPayment(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?._id || 'guest';
      const { reference } = req.body;

      if (!reference) {
        res.status(400).json({ success: false, message: 'Payment reference is required' });
        return;
      }

      // Mock verify payment success
      // In reality, call Stripe/Paystack API to verify status
      
      // Find a pending entry for this user (simplification, since we mock reference)
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lotteryEntry = await FlightLottery.findOne({
        where: { user_id: userId, payment_status: LotteryPaymentStatus.PENDING, month: currentMonth },
        order: [['createdAt', 'DESC']]
      });

      if (!lotteryEntry) {
        res.status(404).json({ success: false, message: 'Pending lottery entry not found' });
        return;
      }

      // Generate 16-digit lottery number
      const lotteryNumber = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();

      lotteryEntry.payment_status = LotteryPaymentStatus.SUCCESS;
      lotteryEntry.lottery_number = lotteryNumber;
      await lotteryEntry.save();

      res.status(200).json({
        success: true,
        message: 'Payment verified and ticket generated',
        data: {
          lottery_number: lotteryNumber,
          payment_status: lotteryEntry.payment_status
        }
      });
    } catch (error) {
      console.error('Error in verifyLotteryPayment:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  public static async drawWinners(req: Request, res: Response): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Check if winners already exist for this month
      const existingWinners = await FlightLottery.findAll({
        where: { month: currentMonth, is_winner: true }
      });

      if (existingWinners.length > 0) {
        res.status(400).json({ success: false, message: 'Winners already drawn for this month', data: existingWinners });
        return;
      }

      // Get all successful entries for the month
      const entries = await FlightLottery.findAll({
        where: { month: currentMonth, payment_status: LotteryPaymentStatus.SUCCESS }
      });

      if (entries.length < 3) {
        res.status(400).json({ success: false, message: 'Not enough participants to draw 3 winners' });
        return;
      }

      // Shuffle and pick top 3
      const shuffled = entries.sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, 3);

      const prizeLevels = ['1st Prize', '2nd Prize', '3rd Prize'];

      for (let i = 0; i < winners.length; i++) {
        winners[i].is_winner = true;
        winners[i].prize_level = prizeLevels[i];
        await winners[i].save();
      }

      // In real scenario: trigger RabbitMQ notification here
      // MQService.publish('notification.email', { to: winners, subject: 'You won the Flight Bonanza!' });

      res.status(200).json({
        success: true,
        message: 'Winners drawn successfully',
        data: winners
      });
    } catch (error) {
      console.error('Error in drawWinners:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}
