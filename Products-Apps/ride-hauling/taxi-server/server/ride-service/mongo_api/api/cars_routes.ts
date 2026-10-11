import { Router } from 'express';
import CarsController from '../controllers/cars_controller';
import TokenVerification from '../middlewares/token_validator';

class CarsRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/cars',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Cars']
        // #swagger.summary = 'Create a new car profile'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Car details',
          schema: { $ref: '#/definitions/CreateCar' }
        } */
        next();
      },
      CarsController.createCarProfile,
    );

    this.router.get(
      '/cars',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Cars']
        // #swagger.summary = 'List all car profiles'
        next();
      },
      CarsController.getAllCars,
    );

    return this.router;
  }
}

export default CarsRoutes;
