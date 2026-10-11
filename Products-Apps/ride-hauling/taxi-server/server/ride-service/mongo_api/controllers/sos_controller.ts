import { Request, Response } from 'express';
// @ts-ignore
import { RedFlagService } from '../services/sos_service';

export default class SOSController {
  static createRedFlag(request: Request, response: Response) {
    RedFlagService.createRedFlag(request, response);
  }

  static allRedFlags(request: Request, response: Response) {
    RedFlagService.allRedFlags(request, response);
  }

  static redFlagId(request: Request, response: Response) {
    RedFlagService.redFlagId(request, response);
  }

  static sendNotifications(request: Request, response: Response) {
    RedFlagService.sendNotifications(request, response);
  }

  static getNotifications(request: Request, response: Response) {
    RedFlagService.getNotifications(request, response);
  }

  static editRedFlag(request: Request, response: Response) {
    RedFlagService.editRedFlag(request, response);
  }

  static editRedFlagComment(request: Request, response: Response) {
    RedFlagService.editRedFlagComment(request, response);
  }

  static deleteRedFlag(request: Request, response: Response) {
    RedFlagService.deleteRedFlag(request, response);
  }

  static updateRedFlagStatus(request: Request, response: Response) {
    RedFlagService.updateRedFlagStatus(request, response);
  }

  static usersRedflags(request: Request, response: Response) {
    RedFlagService.usersRedflags(request, response);
  }
}
