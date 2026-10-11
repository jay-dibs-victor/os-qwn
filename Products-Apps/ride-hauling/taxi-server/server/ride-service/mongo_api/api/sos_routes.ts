import { Router } from 'express';
import RedFlagController from '../controllers/sos_controller';
import TokenVerification from '../middlewares/token_validator';

class RedFlagRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/sos',
      TokenVerification.userAuthentication,
      (req, res) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Create a new SOS alert'
        return RedFlagController.createRedFlag(req, res);
      },
    );

    this.router.get(
      '/sos/:id/users',
      TokenVerification.userAuthentication,
      (req, res) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Get SOS alerts for a specific user'
        return RedFlagController.usersRedflags(req,res);
      },
    );

    this.router.post(
      '/notifications',
      TokenVerification.userAuthentication,
      (req, res) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Send a custom notification'
        return RedFlagController.sendNotifications(req, res);
      },
    );

    this.router.get(
      '/notifications/:id',
      TokenVerification.userAuthentication,
      (req, res) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Get notifications for a user'
        return RedFlagController.getNotifications(req, res);
      },
    );

    return this.router;
  }
}

export default RedFlagRoutes;
