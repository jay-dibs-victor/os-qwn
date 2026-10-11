import { Router } from 'express';
import GamificationController from '../controllers/gamification_controller';
import TokenVerification from '../middlewares/token_validator';

class GamificationRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.get(
      '/gamification/stats',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Gamification']
        // #swagger.summary = 'Get gamification stats for the authenticated user'
        // #swagger.description = 'Returns taxi_coins, streak_count, completed_trips, referral counts, and coin history'
        next();
      },
      GamificationController.getStats
    );

    this.router.post(
      '/gamification/exchange',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Gamification']
        // #swagger.summary = 'Exchange taxi coins for wallet balance'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Amount of coins to exchange',
          schema: { $ref: '#/definitions/CoinExchange' }
        } */
        next();
      },
      GamificationController.exchangeBalance
    );

    this.router.post(
      '/gamification/buy-coins',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Gamification']
        // #swagger.summary = 'Purchase additional taxi coins'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Coin purchase details',
          schema: { amount: 1000 }
        } */
        next();
      },
      GamificationController.buyCoins
    );

    return this.router;
  }
}

export default GamificationRoutes;
