import { Router } from 'express';
import MechController from '../controllers/mech_controller';
import TokenVerification from '../middlewares/token_validator';

class MechanicRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/mechanic-request',
      TokenVerification.userAuthentication,
      MechController.create,
    );

    this.router.get(
      '/mechanic-request/:id/users',
      TokenVerification.userAuthentication,
      MechController.users,
    );

    this.router.get('/mechanic-request', TokenVerification.userAuthentication, MechController.all);

    this.router.patch(
      '/mech-request/:id/update',
      TokenVerification.userAuthentication,
      MechController.update,
    );

    return this.router;
  }
}

export default MechanicRoutes;
