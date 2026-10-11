import { Request, Response } from 'express';
import { UserService } from '../services/user_service';
import UserModel from '../models/User.model';

export default class UserController {
  static signup(request: Request, response: Response) {
    return UserService.signup(request, response);
  }

  static getAllNotification(request: Request, response: Response) {
    return UserService.getAllNotification(request, response);
  }

  static userExists(request: Request, response: Response) {
    return UserService.userExists(request, response);
  }

  static testEmail(request: Request, response: Response) {
    UserService.testEmail(request, response);
  }

  static login(request: Request, response: Response) {
    return UserService.login(request, response);
  }

  static confirmationPost(request: Request, response: Response) {
    return UserService.confirmationPost(request, response);
  }

  static resendTokenPost(request: Request, response: Response) {
    return UserService.resendTokenPost(request, response);
  }

  static passwordForgot(request: Request, response: Response) {
    return UserService.passwordForgot(request, response);
  }

  static confirmResetPassword(request: Request, response: Response) {
    return UserService.confirmResetPassword(request, response);
  }

  static changePasswordTrigger(request: Request, response: Response) {
    return UserService.changePasswordTrigger(request, response);
  }

  static changePasswordTriggerMobile(request: Request, response: Response) {
    return UserService.changePasswordTriggerMobile(request, response);
  }

  static deleteItinerary(request: Request, response: Response) {
    return UserService.deleteItinerary(request, response);
  }

  static walletUpgradeViaMobile(request: Request, response: Response) {
    return UserService.walletUpgradeViaMobile(request, response);
  }

  static setPlanIdForUser(request: Request, response: Response) {
    return UserService.setPlanIdForUser(request, response);
  }

  static getPlanIdForUser(request: Request, response: Response) {
    return UserService.getPlanIdForUser(request, response);
  }

  static initializeGoogleLogin(request: Request, response: Response) {
    return UserService.initializeGoogleLogin(request, response);
  }

  static updateProfile(request: Request, response: Response) {
    return UserService.updateProfile(request, response);
  }

  static showProfile(request: Request, response: Response) {
    return UserService.showProfile(request, response);
  }

  static showProfileRights(request: Request, response: Response) {
    return UserService.showProfileRights(request, response);
  }

  static individualPlans(request: Request, response: Response) {
    return UserService.individualPlans(request, response);
  }

  static coperatePlans(request: Request, response: Response) {
    return UserService.coperatePlans(request, response);
  }

  static addNewPlans(request: Request, response: Response) {
    return UserService.addNewPlans(request, response);
  }

  static getAllUsersPlans(request: Request, response: Response) {
    return UserService.getAllUsersPlans(request, response);
  }

  static getAllUsersQuotations(request: Request, response: Response) {
    return UserService.getAllUsersQuotations(request, response);
  }

  static debitWallet(request: Request, response: Response) {
    return UserService.debitWallet(request, response);
  }

  static updatePlanStatus(request: Request, response: Response) {
    return UserService.updatePlanStatus(request, response);
  }

  static updateItinStatus(request: Request, response: Response) {
    return UserService.updateItinStatus(request, response);
  }

  static updateQuoteStatus(request: Request, response: Response) {
    return UserService.updateQuoteStatus(request, response);
  }

  static getUserCars(request: Request, response: Response) {
    return UserService.getUserCars(request, response);
  }

  static getOnePlanById(request: Request, response: Response) {
    return UserService.getOnePlanById(request, response);
  }

  static updateItem(request: Request, response: Response) {
    return UserService.updateItem(request, response);
  }

  static deleteItem(request: Request, response: Response) {
    return UserService.deleteItem(request, response);
  }

  static saveUsersItinerary(request: Request, response: Response) {
    return UserService.saveUsersItinerary(request, response);
  }

  static updateItineraryStatusAdmin(request: Request, response: Response) {
    return UserService.updateItineraryStatusAdmin(request, response);
  }

  static updateItineraryStatus(request: Request, response: Response) {
    return UserService.updateItineraryStatus(request, response);
  }

  static updateUsersPlanStatusAdmin(request: Request, response: Response) {
    return UserService.updateUsersPlanStatusAdmin(request, response);
  }

  static paystackPayMeMoney(req: Request, res: Response) {
    return UserService.paystackPayMeMoney(req, res);
  }

  static paystackCallBack(req: Request, res: Response) {
    return UserService.paystackCallBack(req, res);
  }

  static initiatePayment(req: Request, res: Response) {
    return UserService.initiatePayment(req, res);
  }

  static verifyPayment(req: Request, res: Response) {
    return UserService.verifyPayment(req, res);
  }

  static paystackReceipt(req: Request, res: Response) {
    return UserService.paystackReceipt(req, res);
  }

  static paystackHistory(req: Request, res: Response) {
    return UserService.paystackHistory(req, res);
  }

  static paystackPayments(req: Request, res: Response) {
    return UserService.paystackPayments(req, res);
  }

  static paystackQuotations(req: Request, res: Response) {
    return UserService.paystackQuotations(req, res);
  }

  static editViewUsersItinerary(request: Request, response: Response) {
    return UserService.editViewUsersItinerary(request, response);
  }

  static updateUsersItinerary(request: Request, response: Response) {
    return UserService.updateUsersItinerary(request, response);
  }

  static getUsersItinerary(request: Request, response: Response) {
    return UserService.getUsersItinerary(request, response);
  }

  static makeNotification(request: Request, response: Response) {
    return UserService.makeNotification(request, response);
  }

  static getUserNotification(request: Request, response: Response) {
    return UserService.getUserNotification(request, response);
  }

  static adminDashboard(request: Request, response: Response) {
    return UserService.adminDashboard(request, response);
  }

  static getAnalytics(request: Request, response: Response) {
    return UserService.getAnalytics(request, response);
  }

  static adminDashboardTodaySales(request: Request, response: Response) {
    return UserService.adminDashboardTodaySales(request, response);
  }

  static adminDashboardYesterdaySales(request: Request, response: Response) {
    return UserService.adminDashboardYesterdaySales(request, response);
  }

  static adminDashboardWeeklySales(request: Request, response: Response) {
    return UserService.adminDashboardWeeklySales(request, response);
  }

  static adminDashboardMonthlySales(request: Request, response: Response) {
    return UserService.adminDashboardMonthlySales(request, response);
  }

  static manageUsers(request: Request, response: Response) {
    return UserService.manageUsers(request, response);
  }

  static deleteUser(request: Request, response: Response) {
    return UserService.deleteUser(request, response);
  }

  static addUserByAdmin(request: Request, response: Response) {
    return UserService.createNewUser(request, response);
  }

  static manageUsersDetail(request: Request, response: Response) {
    return UserService.manageUsersDetail(request, response);
  }

  static manageUsersDetailVerification(request: Request, response: Response) {
    return UserService.manageUsersDetailVerification(request, response);
  }

  static manageAdmins(request: Request, response: Response) {
    return UserService.manageAdmins(request, response);
  }

  static deleteAdmin(request: Request, response: Response) {
    return UserService.deleteAdmin(request, response);
  }

  static manageAdminsDetail(request: Request, response: Response) {
    return UserService.manageAdminsDetail(request, response);
  }

  static manageAdminsDetailVerification(request: Request, response: Response) {
    return UserService.manageAdminsDetailVerification(request, response);
  }

  static addAdminByAdmin(request: Request, response: Response) {
    return UserService.createNewAdmin(request, response);
  }

  static manageDrivers(request: Request, response: Response) {
    return UserService.manageDrivers(request, response);
  }

  static addDriverByAdmin(request: Request, response: Response) {
    return UserService.createNewDriver(request, response);
  }

  static deleteDriver(request: Request, response: Response) {
    return UserService.deleteDriver(request, response);
  }

  static manageDriversDetail(request: Request, response: Response) {
    return UserService.manageDriversDetail(request, response);
  }

  static manageDriversDetailVerification(request: Request, response: Response) {
    return UserService.manageDriversDetailVerification(request, response);
  }

  static managePartners(request: Request, response: Response) {
    return UserService.managePartners(request, response);
  }

  static deletePartner(request: Request, response: Response) {
    return UserService.deletePartner(request, response);
  }

  static addPartnerByAdmin(request: Request, response: Response) {
    return UserService.createNewPartner(request, response);
  }

  static managePartnersDetail(request: Request, response: Response) {
    return UserService.managePartnersDetail(request, response);
  }

  static managePartnersDetailVerification(request: Request, response: Response) {
    return UserService.managePartnersDetailVerification(request, response);
  }

  static managePartnersEarnings(request: Request, response: Response) {
    return UserService.managePartnersEarnings(request, response);
  }

  static deletePartnersEarnings(request: Request, response: Response) {
    return UserService.deletePartnersEarnings(request, response);
  }

  static addPartnersEarningsByAdmin(request: Request, response: Response) {
    return UserService.createNewPartnerEarnings(request, response);
  }

  static managePartnersEarningsDetail(request: Request, response: Response) {
    return UserService.managePartnersEarningsDetail(request, response);
  }

  static managePlanPackage(request: Request, response: Response) {
    return UserService.managePlanPackage(request, response);
  }

  static managePlanPackageCorporate(request: Request, response: Response) {
    return UserService.managePlanPackageCorporate(request, response);
  }

  static createNewPlan(request: Request, response: Response) {
    return UserService.createNewPlan(request, response);
  }

  static deletePlanPackage(request: Request, response: Response) {
    return UserService.deletePlanPackage(request, response);
  }

  static managePlanPackageDetail(request: Request, response: Response) {
    return UserService.managePlanPackageDetail(request, response);
  }

  static manageSOS(request: Request, response: Response) {
    return UserService.manageSOS(request, response);
  }

  static manageSOSDetail(request: Request, response: Response) {
    return UserService.manageSOSDetail(request, response);
  }

  static deleteSOS(request: Request, response: Response) {
    return UserService.deleteSOS(request, response);
  }

  static manageGoogleSettings(request: Request, response: Response) {
    return UserService.manageGoogleSettings(request, response);
  }

  static manageFacebookSettings(request: Request, response: Response) {
    return UserService.manageFacebookSettings(request, response);
  }

  static managePaystackSettings(request: Request, response: Response) {
    return UserService.managePaystackSettings(request, response);
  }

  static manageEmailSettings(request: Request, response: Response) {
    return UserService.manageEmailSettings(request, response);
  }

  static manageS3BucketSettings(request: Request, response: Response) {
    return UserService.manageS3BucketSettings(request, response);
  }

  static manageInstagramSettings(request: Request, response: Response) {
    return UserService.manageInstagramSettings(request, response);
  }

  static manageSettingsDetail(request: Request, response: Response) {
    return UserService.manageSettingsDetail(request, response);
  }

  static manageTickets(request: Request, response: Response) {
    return UserService.manageTickets(request, response);
  }

  static manageTicketsDetail(request: Request, response: Response) {
    return UserService.manageTicketsDetail(request, response);
  }

  static deleteTicket(request: Request, response: Response) {
    return UserService.deleteTicket(request, response);
  }

  static createNewTicket(request: Request, response: Response) {
    return UserService.createNewTicket(request, response);
  }

  static manageFaqs(request: Request, response: Response) {
    return UserService.manageFaqs(request, response);
  }

  static showUserInfo(request: Request, response: Response) {
    return UserService.showUserInfo(request, response);
  }

  static setOldBalance(request: Request, response: Response) {
    return UserService.setOldBalance(request, response);
  }

  static manageFaqsDetail(request: Request, response: Response) {
    return UserService.manageFaqsDetail(request, response);
  }

  static createNewFAQ(request: Request, response: Response) {
    return UserService.createNewFAQ(request, response);
  }

  static manageProfile(request: Request, response: Response) {
    return UserService.manageProfile(request, response);
  }

  static manageProfileDetail(request: Request, response: Response) {
    return UserService.manageProfileDetail(request, response);
  }

  static manageProfileDetailVerification(request: Request, response: Response) {
    return UserService.manageProfileDetailVerification(request, response);
  }

  static manageItineraries(request: Request, response: Response) {
    return UserService.manageItineraries(request, response);
  }

  static manageUsersPlan(request: Request, response: Response) {
    return UserService.manageUsersPlan(request, response);
  }

  static manageItineraryDetail(request: Request, response: Response) {
    return UserService.manageItineraryDetail(request, response);
  }

  static manageUserNotificationCounter(request: Request, response: Response) {
    return UserService.manageUserNotificationCounter(request, response);
  }

  static paystackHistoryAdmin(req: Request, res: Response) {
    return UserService.paystackHistoryAdmin(req, res);
  }

  static paystackPaymentsAdmin(req: Request, res: Response) {
    return UserService.paystackPaymentsAdmin(req, res);
  }

  static paystackQuotationsAdmin(req: Request, res: Response) {
    return UserService.paystackQuotationsAdmin(req, res);
  }

  static deleteQuotation(req: Request, res: Response) {
    return UserService.deleteQuotation(req, res);
  }

  static deleteWallet(req: Request, res: Response) {
    return UserService.deleteWallet(req, res);
  }

  static deletePayment(req: Request, res: Response) {
    return UserService.deletePayment(req, res);
  }

  static manageInspection(request: Request, response: Response) {
    return UserService.manageInspection(request, response);
  }

  static manageInspectionDetail(request: Request, response: Response) {
    return UserService.manageInspectionDetail(request, response);
  }

  static createNewInspection(request: Request, response: Response) {
    return UserService.createNewInspection(request, response);
  }

  static deleteInspection(request: Request, response: Response) {
    return UserService.deleteInspection(request, response);
  }

  static manageDriveTest(request: Request, response: Response) {
    return UserService.manageDriveTest(request, response);
  }

  static manageDriveTestDetail(request: Request, response: Response) {
    return UserService.manageDriveTestDetail(request, response);
  }

  static createNewDriveTest(request: Request, response: Response) {
    return UserService.createNewDriveTest(request, response);
  }

  static addDriveTestFromItinerary(request: Request, response: Response) {
    return UserService.addDriveTestFromItinerary(request, response);
  }

  static deleteDriveTest(request: Request, response: Response) {
    return UserService.deleteDriveTest(request, response);
  }

  static manageUsersDriveTestCenterUpdate(request: Request, response: Response) {
    return UserService.manageUsersDriveTestCenterUpdate(request, response);
  }

  static getUserPreviledges(request: Request, response: Response) {
    return UserService.getUserPreviledges(request, response);
  }

  static managePreviledges(request: Request, response: Response) {
    return UserService.managePreviledges(request, response);
  }

  static managePreviledgesDetail(request: Request, response: Response) {
    return UserService.managePreviledgesDetail(request, response);
  }

  static createNewPreviledges(request: Request, response: Response) {
    return UserService.createNewPreviledges(request, response);
  }

  static deletePreviledges(request: Request, response: Response) {
    return UserService.deletePreviledges(request, response);
  }

  static adminPreviledgesEdit(request: Request, response: Response) {
    UserService.adminPreviledgesEdit(request, response);
  }

  static manageCars(request: Request, response: Response) {
    return UserService.manageCars(request, response);
  }

  static getCarsInfo(request: Request, response: Response) {
    return UserService.getCarsInfo(request, response);
  }

  static manageCarsDetail(request: Request, response: Response) {
    return UserService.manageCarsDetail(request, response);
  }

  static createNewCar(request: Request, response: Response) {
    return UserService.createNewCar(request, response);
  }

  static makeQuotation(request: Request, response: Response) {
    return UserService.makeQuotation(request, response);
  }

  static manageBookings(request: Request, response: Response) {
    return UserService.manageBookings(request, response);
  }

  static manageBookingsDetail(request: Request, response: Response) {
    return UserService.manageBookingsDetail(request, response);
  }

  static createNewItinerary(request: Request, response: Response) {
    return UserService.createNewItinerary(request, response);
  }

  static createNewPlanBooking(request: Request, response: Response) {
    return UserService.createNewPlanBooking(request, response);
  }

  static createPaymentDetail(request: Request, response: Response) {
    return UserService.createPaymentDetail(request, response);
  }

  static updateNotificationStatus(request: Request, response: Response) {
    return UserService.updateNotificationStatus(request, response);
  }

  static updateDriverRatings(request: Request, response: Response) {
    return UserService.updateDriverRatings(request, response);
  }

  static manageManualBooking(request: Request, response: Response) {
    return UserService.manageManualBooking(request, response);
  }

  static manageTechSupport(request: Request, response: Response) {
    return UserService.manageTechSupport(request, response);
  }

  static adminGetAllUsers(request: Request, response: Response) {
    return UserService.adminGetAllUsers(request, response);
  }

  static getTrails(request: Request, response: Response) {
    return UserService.getTrails(request, response);
  }

  static createTrail(request: Request, response: Response) {
    return UserService.createTrail(request, response);
  }

  static revokecar(request: Request, response: Response) {
    return UserService.revokecar(request, response);
  }

  static revokecarstatus(request: Request, response: Response) {
    return UserService.revokecarstatus(request, response);
  }

  static getrevokecars(request: Request, response: Response) {
    return UserService.getrevokecars(request, response);
  }

  static driverConfirmBooking(request: Request, response: Response) {
    return UserService.driverConfirmBooking(request, response);
  }

  static getAllRepairs(request: Request, response: Response) {
    return UserService.getAllRepairs(request, response);
  }

  static changeRepairStatus(request: Request, response: Response) {
    return UserService.changeRepairStatus(request, response);
  }

  static getActivityLogs(request: Request, response: Response) {
    return UserService.getActivityLogs(request, response);
  }

  static updateSavedPlaces(request: Request, response: Response) {
    return UserService.updateSavedPlaces(request as any, response as any);
  }

  static updateEmergencyContacts(request: Request, response: Response) {
    return UserService.updateEmergencyContacts(request as any, response as any);
  }

  static applyReferralCode(request: Request, response: Response) {
    return UserService.applyReferralCode(request as any, response as any);
  }

  static redeemVoucher(request: Request, response: Response) {
    return UserService.redeemVoucher(request as any, response as any);
  }

  static getVoucherByHash(request: Request, response: Response) {
    return UserService.getVoucherByHash(request as any, response as any);
  }

  static assignRoleToUser(request: Request, response: Response) {
    return UserService.assignRoleToUser(request, response);
  }

  static verifyCode(request: Request, response: Response) {
    return UserService.verifyCode(request, response);
  }

  static resendCode(request: Request, response: Response) {
    return UserService.resendCode(request, response);
  }

  static signupMobile(request: Request, response: Response) {
    return UserService.signupMobile(request, response);
  }

  static loginMobile(request: Request, response: Response) {
    return UserService.loginMobile(request, response);
  }

  static async me(request: Request, response: Response) {
    try {
      const user = (request as any).user;
      if (!user) {
        return response.status(401).json({ status: 401, error: 'Not authenticated' });
      }
      
      const freshUser = await UserModel.findOne({ email: user.email }).exec();
      if (!freshUser) {
         return response.status(404).json({ status: 404, error: 'User not found' });
      }

      return response.status(200).json({
        status: 200,
        token: request.header('Authorization')?.replace('Bearer ', ''),
        user: {
           id: freshUser.id,
           _id: freshUser._id,
           email: freshUser.email,
           isAdmin: freshUser.is_admin,
           firstname: freshUser.firstname,
           username: freshUser.username,
           profile: freshUser.avatar,
           roles: freshUser.roles
        }
      });
    } catch (err: any) {
      return response.status(500).json({ status: 500, error: err.message });
    }
  }
}
