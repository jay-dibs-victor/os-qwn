import { Request, Response } from 'express';
import { FaqsService } from '../services/faqs_service';

export default class FaqsController {
  static createQnA(request: Request, response: Response) {
    return FaqsService.createQnA(request, response);
  }

  static getAllQnA(request: Request, response: Response) {
    return FaqsService.getAllQnA(request, response);
  }
}
