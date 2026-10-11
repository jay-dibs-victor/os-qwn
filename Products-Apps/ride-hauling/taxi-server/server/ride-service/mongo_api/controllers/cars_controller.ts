import { Request, Response } from 'express';
import { CarsService } from '../services/cars_services';

export default class CarsController {
  static createCarProfile(request: Request, response: Response) {
    return CarsService.createCarProfile(request, response);
  }

  static getAllCars(request: Request, response: Response) {
    return CarsService.getAllCars(request, response);
  }

  static carsId(request: Request, response: Response) {
    return CarsService.carsId(request, response);
  }

  static editCars(request: Request, response: Response) {
    return CarsService.editCars(request, response);
  }

  static usersCars(request: Request, response: Response) {
    return CarsService.usersSelectedCars(request, response);
  }
}
