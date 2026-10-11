import { Request, Response } from 'express';
import { MechService } from '../../../ride-service/mongo_api/services/mech_service';

export default class MechController {
  static create(request: Request, response: Response) {
    return MechService.create(request, response);
  }

  static all(request: Request, response: Response) {
    return MechService.all(request, response);
  }

  static users(request: Request, response: Response) {
    return MechService.users(request, response);
  }

  static update(request: Request, response: Response) {
    return MechService.update(request, response);
  }
}
