import { Request, Response } from 'express';
import { GamificationService } from '../services/gamification_service';

export default class GamificationController {
  static async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const { lat, lng } = req.query;
      const stats = await GamificationService.getStats(
        userId, 
        lat ? Number(lat) : undefined, 
        lng ? Number(lng) : undefined
      );
      return res.status(200).json({ status: 200, data: stats });
    } catch (err: any) {
      return res.status(400).json({ status: 400, error: err.message });
    }
  }

  static async exchangeBalance(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id || (req as any).user._id;
      const { amount } = req.body;
      if (!amount || amount <= 0) throw new Error('Invalid amount');
      
      const result = await GamificationService.exchangeNairaToCoins(userId, amount);
      return res.status(200).json({ status: 200, message: 'Exchange successful', data: result });
    } catch (err: any) {
      return res.status(400).json({ status: 400, error: err.message });
    }
  }

  static async buyCoins(req: Request, res: Response) {
     // Placeholder for direct coin purchase via gateway
     return res.status(200).json({ status: 200, message: 'Redirecting to payment gateway...' });
  }
}
