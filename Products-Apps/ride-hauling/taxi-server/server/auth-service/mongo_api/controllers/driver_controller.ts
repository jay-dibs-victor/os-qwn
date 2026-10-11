import { Request, Response } from 'express';
import { DriverService } from '../../../ride-service/mongo_api/services/driver_services';
import { DriverRedFlagService } from '../../../ride-service/mongo_api/services/sos_service_drivers';

export default class DriverController {
  static signup(request: Request, response: Response) {
    return DriverService.signup(request, response);
  }

  static login(request: Request, response: Response) {
    return DriverService.login(request, response);
  }

  static confirmationPost(request: Request, response: Response) {
    return DriverService.confirmationPost(request, response);
  }

  static resendTokenPost(request: Request, response: Response) {
    return DriverService.resendTokenPost(request, response);
  }

  static passwordForgot(request: Request, response: Response) {
    return DriverService.passwordForgot(request, response);
  }

  static confirmResetPassword(request: Request, response: Response) {
    return DriverService.confirmResetPassword(request, response);
  }

  static changePasswordTrigger(request: Request, response: Response) {
    return DriverService.changePasswordTrigger(request, response);
  }

  static updateProfile(request: Request, response: Response) {
    return DriverService.updateProfile(request, response);
  }

  static showProfile(request: Request, response: Response) {
    return DriverService.showProfile(request, response);
  }

  static createRedFlag(request: Request, response: Response) {
    return DriverRedFlagService.createRedFlag(request, response);
  }

  static allRedFlags(request: Request, response: Response) {
    return DriverRedFlagService.allRedFlags(request, response);
  }

  static redFlagId(request: Request, response: Response) {
    return DriverRedFlagService.redFlagId(request, response);
  }

  static sendNotifications(request: Request, response: Response) {
    return DriverRedFlagService.sendNotifications(request, response);
  }

  static getNotifications(request: Request, response: Response) {
    return DriverRedFlagService.getNotifications(request, response);
  }

  static editRedFlag(request: Request, response: Response) {
    return DriverRedFlagService.editRedFlag(request, response);
  }

  static editRedFlagComment(request: Request, response: Response) {
    return DriverRedFlagService.editRedFlagComment(request, response);
  }

  static deleteRedFlag(request: Request, response: Response) {
    return DriverRedFlagService.deleteRedFlag(request, response);
  }

  static updateRedFlagStatus(request: Request, response: Response) {
    return DriverRedFlagService.updateRedFlagStatus(request, response);
  }
  
  static usersRedflags(request: Request, response: Response) {
    DriverRedFlagService.usersRedflags(request, response);
  }

  static getDriversAssignedTrips(request: Request, response: Response) {
    DriverService.getDriversAssignedTrips(request, response);
  }

  static getAssignedDriverToCars(request: Request, response: Response) {
    DriverService.getAssignedDriverToCars(request, response);
  }

  static driverConfirmBooking(request: Request, response: Response) {
    return DriverService.driverConfirmBooking(request, response);
  }

  static updateAvailability(request: Request, response: Response) {
    return DriverService.updateAvailability(request, response);
  }

  static verifyCode(request: Request, response: Response) {
    return DriverService.verifyCode(request, response);
  }

  static resendCode(request: Request, response: Response) {
    return DriverService.resendCode(request, response);
  }
}
