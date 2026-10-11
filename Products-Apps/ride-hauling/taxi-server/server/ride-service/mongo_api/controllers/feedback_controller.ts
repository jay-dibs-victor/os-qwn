import { Request, Response } from 'express';
// @ts-ignore
import { InterventonService } from '../services/feedback_service';

export default class FeedBackController {
  static createIntervention(request: Request, response: Response) {
    InterventonService.createIntervention(request, response);
  }

  static allInterventions(request: Request, response: Response) {
    InterventonService.allInterventions(request, response);
  }

  static interventionId(request: Request, response: Response) {
    InterventonService.interventionId(request, response);
  }

  static interventionLocation(request: Request, response: Response) {
    InterventonService.interventionLocation(request, response);
  }

  static editInterventionComment(request: Request, response: Response) {
    InterventonService.editInterventionComment(request, response);
  }

  static deleteIntervention(request: Request, response: Response) {
    InterventonService.deleteIntervention(request, response);
  }

  static updateInterventionStatus(request: Request, response: Response) {
    InterventonService.updateInterventionStatus(request, response);
  }

  static activateSearch(request: Request, response: Response) {
    InterventonService.activateSearch(request, response);
  }

  static usersInterventions(request: Request, response: Response) {
    InterventonService.usersInterventions(request, response);
  }
}
