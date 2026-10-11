import cron from 'node-cron';
import { FlightLottery, LotteryPaymentStatus } from '../models/FlightLottery.model';

export class LotteryCron {
  public static init(): void {
    // Run at 23:55 on the last day of every month
    cron.schedule('55 23 28-31 * *', async () => {
      // Check if tomorrow is the first day of the month
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (tomorrow.getDate() === 1) {
        console.log('[LotteryCron] Running monthly draw...');
        await LotteryCron.drawWinners();
      }
    });
    console.log('[LotteryCron] Initialized');
  }

  private static async drawWinners(): Promise<void> {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7);

      // Check if winners already exist for this month
      const existingWinners = await FlightLottery.findAll({
        where: { month: currentMonth, is_winner: true }
      });

      if (existingWinners.length > 0) {
        console.log('[LotteryCron] Winners already drawn for this month.');
        return;
      }

      // Get all successful entries for the month
      const entries = await FlightLottery.findAll({
        where: { month: currentMonth, payment_status: LotteryPaymentStatus.SUCCESS }
      });

      if (entries.length < 3) {
        console.log('[LotteryCron] Not enough participants to draw 3 winners.');
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
        console.log(`[LotteryCron] ${prizeLevels[i]} Winner: User ID ${winners[i].user_id} with Ticket ${winners[i].lottery_number}`);
      }

      // Emit to notification service if RabbitMQ is hooked up
      // MQService.publish('notification.email', { to: winners, subject: 'You won the Flight Bonanza!' });

    } catch (error) {
      console.error('[LotteryCron] Error running draw:', error);
    }
  }
}
