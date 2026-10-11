import { Router, Request, Response, NextFunction } from 'express';
import UserController from '../controllers/user_controller';
import UserSanitizer from '../middlewares/user_sanitizer';
import TokenVerification from '../middlewares/token_validator';
import SubmitEventValidator from '../middlewares/post_sanitizer';
import DriverModel from '../models/Driver.model';

import * as controllerWallet from '../controllers/ewallet.controller';

class UserRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.get('/test-email', (req, res, next) => {
      // #swagger.tags = ['Admin']
      // #swagger.summary = 'Test email configuration'
      next();
    }, UserController.testEmail);

    this.router.post('/userexists', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Check if a user already exists by email'
      next();
    }, UserController.userExists);

    this.router.post(
      '/transaction/upgrade-amount',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Upgrade wallet via mobile transaction'
        next();
      },
      UserController.walletUpgradeViaMobile,
    );

    this.router.delete(
      '/itinerary/delete/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Delete a saved itinerary/plan'
        /* #swagger.parameters['id'] = { description: 'Itinerary ID' } */
        next();
      },
      UserController.deleteItinerary,
    );

    this.router.post(
      '/payplan-get/',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Set the active plan for a user'
        next();
      },
      UserController.setPlanIdForUser,
    );

    this.router.get(
      '/payplan-set/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get the active plan details for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.getPlanIdForUser,
    );

    this.router.get(
      '/profile/update/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get user profile by ID'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.showProfile,
    );

    this.router.post(
      '/profile/update/:id',
      TokenVerification.userAuthentication,
      UserSanitizer.validateSignUp,
      (request: Request, response: Response) => {
        // #swagger.tags = ['User Profile']
        // #swagger.description = 'Update user profile information'
        return UserController.updateProfile(request, response);
      },
    );

    this.router.get(
      '/get-cars-info-user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get car information for a user'
        next();
      },
      UserController.getCarsInfo,
    );

    this.router.get(
      '/individual/plans/view',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'View individual subscription plans'
        next();
      },
      UserController.individualPlans,
    );

    this.router.get(
      '/coperate/plans/view',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'View corporate subscription plans'
        next();
      },
      UserController.coperatePlans,
    );

    this.router.post(
      '/plans/:id/user',
      TokenVerification.userAuthentication,
      UserController.addNewPlans,
    );

    this.router.get(
      '/plans/:id/user',
      TokenVerification.userAuthentication,
      UserController.getAllUsersPlans,
    );

    this.router.get(
      '/quotations/:id/user',
      TokenVerification.userAuthentication,
      UserController.getAllUsersQuotations,
    );

    this.router.get(
      '/plans/:id',
      TokenVerification.userAuthentication,
      UserController.getOnePlanById,
    );

    this.router.patch(
      '/plans/:id',
      TokenVerification.userAuthentication,
      UserController.updateItem,
    );

    this.router.delete(
      '/plans/:id',
      TokenVerification.userAuthentication,
      UserController.deleteItem,
    );

    this.router.put(
      '/debit-wallet-transactions/:id/user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Debit wallet for a user transaction'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.debitWallet,
    );

    this.router.put(
      '/plan-status/:id/update',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update plan/booking status'
        /* #swagger.parameters['id'] = { description: 'Plan ID' } */
        next();
      },
      UserController.updatePlanStatus,
    );

    this.router.put(
      '/itin-status/:id/update',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update itinerary status'
        /* #swagger.parameters['id'] = { description: 'Itinerary ID' } */
        next();
      },
      UserController.updateItinStatus,
    );

    this.router.put(
      '/quote-status/:id/update',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update quotation status'
        /* #swagger.parameters['id'] = { description: 'Quotation ID' } */
        next();
      },
      UserController.updateQuoteStatus,
    );

    this.router.post(
      '/add-drive-test-for-user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Add a drive test from an itinerary'
        next();
      },
      UserController.addDriveTestFromItinerary,
    );

    this.router.get(
      '/cars/:id/user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Cars']
        // #swagger.summary = 'Get cars associated with a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.getUserCars,
    );

    this.router.post(
      '/itinerary/:id/user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Save a new itinerary/trip plan for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.saveUsersItinerary,
    );

    this.router.get(
      '/itinerary/:id/user',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get all itinerary/trip plans for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.getUsersItinerary,
    );

    this.router.put(
      '/itinerary/:id/status',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update itinerary status'
        /* #swagger.parameters['id'] = { description: 'Itinerary ID' } */
        next();
      },
      UserController.updateItineraryStatus,
    );

    this.router.put(
      '/user/:id/ratings',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Rides']
        // #swagger.summary = 'Update driver rating for a completed trip'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.updateDriverRatings,
    );

    this.router.get(
      '/itinerary/:id/user/edit',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get itinerary data for editing'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.editViewUsersItinerary,
    );

    this.router.post(
      '/itinerary/:id/user/edit',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update an existing itinerary/trip plan'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.updateUsersItinerary,
    );

    this.router
      .route('/balance/:id')
      .get(TokenVerification.userAuthentication, (request: Request, response: Response) => {
        // #swagger.tags = ['Wallet']
        // #swagger.description = 'Get user wallet balance'
        return controllerWallet.getBalance(request, response);
      });

    this.router.post(
      '/paystack/pay',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Make a payment via Paystack'
        next();
      },
      UserController.paystackPayMeMoney,
    );

    this.router.post(
      '/payments/:gateway/initiate',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Initiate payment via a specified gateway (paystack, flutterwave, etc.)'
        /* #swagger.parameters['gateway'] = { description: 'Payment gateway name (e.g. paystack)' } */
        next();
      },
      UserController.initiatePayment,
    );

    this.router.get(
      '/payments/:gateway/verify/:reference',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Verify a payment transaction by reference'
        /* #swagger.parameters['gateway'] = { description: 'Payment gateway name' } */
        /* #swagger.parameters['reference'] = { description: 'Payment reference' } */
        next();
      },
      UserController.verifyPayment,
    );

    this.router.get('/paystack/callback', (req, res, next) => {
      // #swagger.tags = ['Wallet']
      // #swagger.summary = 'Paystack payment callback/webhook'
      next();
    }, UserController.paystackCallBack);

    this.router.get('/receipt/:id', (req, res, next) => {
      // #swagger.tags = ['Wallet']
      // #swagger.summary = 'Get payment receipt by ID'
      /* #swagger.parameters['id'] = { description: 'Receipt ID' } */
      next();
    }, UserController.paystackReceipt);

    this.router.get(
      '/payment-history/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Get payment history for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.paystackHistory,
    );

    this.router.get(
      '/payment-payments/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Get payment details for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.paystackPayments,
    );

    this.router.post(
      '/makepayments',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Create a payment detail record'
        next();
      },
      UserController.createPaymentDetail,
    );

    this.router.get(
      '/payment-quotations/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Get payment quotations for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.paystackQuotations,
    );

    this.router.post(
      '/notification',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Create a notification for a user'
        next();
      },
      UserController.makeNotification,
    );

    this.router.get(
      '/notification/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get notifications for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.getUserNotification,
    );

    // Admin: users routes
    this.router.post(
      '/admin-add-user',
      TokenVerification.adminAuthentication,
      UserSanitizer.checkIfUserExists,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Admin: Add a new user manually'
        return UserController.addUserByAdmin(request, response);
      },
    );

    this.router.get(
      '/admin-users',
      TokenVerification.adminAuthentication,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Admin: List all users'
        return UserController.manageUsers(request, response);
      },
    );

    this.router.put(
      '/admin-users-detail/:id',
      TokenVerification.adminAuthentication,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Admin: Update user details by ID'
        /* #swagger.parameters['id'] = { description: 'The unique ID of the user' } */
        return UserController.manageUsersDetail(request, response);
      },
    );

    this.router.put(
      '/admin-users-detail-verification/:id',
      TokenVerification.adminAuthentication,
      UserController.manageUsersDetailVerification,
    );

    this.router.delete(
      '/users/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteUser,
    );

    this.router.post(
      '/add-admin',
      TokenVerification.adminAuthentication,
      UserSanitizer.checkIfUserExists,
      UserController.addAdminByAdmin,
    );

    this.router.get(
      '/admin-admins',
      TokenVerification.adminAuthentication,
      UserController.manageAdmins,
    );

    this.router.put(
      '/admin-admins-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageAdminsDetail,
    );

    this.router.put(
      '/admin-admins-detail-verification/:id',
      TokenVerification.adminAuthentication,
      UserController.manageAdminsDetailVerification,
    );

    this.router.post(
      '/add-driver',
      TokenVerification.adminAuthentication,
      UserSanitizer.checkIfDriverExists,
      UserController.addDriverByAdmin,
    );

    this.router.get(
      '/admin-drivers',
      TokenVerification.adminAuthentication,
      UserController.manageDrivers,
    );

    this.router.put(
      '/admin-drivers-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageDriversDetail,
    );

    this.router.put(
      '/admin-drivers-detail-verification/:id',
      TokenVerification.adminAuthentication,
      UserController.manageDriversDetailVerification,
    );

    this.router.delete(
      '/drivers/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteDriver,
    );

    this.router.get(
      '/admin-partners',
      TokenVerification.adminAuthentication,
      UserController.managePartners,
    );

    this.router.delete(
      '/partners/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deletePartner,
    );

    this.router.put(
      '/admin-partners-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.managePartnersDetail,
    );

    this.router.put(
      '/admin-partners-detail-verification/:id',
      TokenVerification.adminAuthentication,
      UserController.managePartnersDetailVerification,
    );

    this.router.post(
      '/add-partner',
      TokenVerification.adminAuthentication,
      UserSanitizer.checkIfPartnerExists,
      UserController.addPartnerByAdmin,
    );

    this.router.get(
      '/admin-earnings',
      TokenVerification.adminAuthentication,
      UserController.managePartnersEarnings,
    );

    this.router.delete(
      '/partners-earnings/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deletePartnersEarnings,
    );

    this.router.put(
      '/partners-earnings-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.managePartnersEarningsDetail,
    );

    this.router.post(
      '/add-partner-earnings',
      TokenVerification.adminAuthentication,
      UserController.addPartnersEarningsByAdmin,
    );

    this.router.get(
      '/admin-profile/:id',
      TokenVerification.adminAuthentication,
      UserController.manageProfile,
    );

    this.router.put(
      '/admin-profile-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageProfileDetail,
    );

    this.router.put(
      '/admin-profile-detail-verification/:id',
      TokenVerification.adminAuthentication,
      UserController.manageProfileDetailVerification,
    );

    this.router.get(
      '/admin-plan-package',
      TokenVerification.adminAuthentication,
      UserController.managePlanPackage,
    );

    this.router.get(
      '/admin-plan-package-corporate',
      TokenVerification.adminAuthentication,
      UserController.managePlanPackageCorporate,
    );

    this.router.post(
      '/add-plan',
      TokenVerification.adminAuthentication,
      UserController.createNewPlan,
    );

    this.router.put(
      '/admin-plan-package-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.managePlanPackageDetail,
    );

    this.router.delete(
      '/plan-package/:id/delete/:delete_type',
      TokenVerification.adminAuthentication,
      UserController.deletePlanPackage,
    );

    this.router.get(
      '/admin-sos',
      TokenVerification.adminAuthentication,
      UserController.manageSOS,
    );

    this.router.put(
      '/admin-sos-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageSOSDetail,
    );

    this.router.delete(
      '/redflag-sos/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteSOS,
    );

    this.router.get(
      '/admin-tickets',
      TokenVerification.adminAuthentication,
      UserController.manageTickets,
    );

    this.router.put(
      '/admin-ticket-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageTicketsDetail,
    );

    this.router.delete(
      '/tickets/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteTicket,
    );

    this.router.post(
      '/add-ticket',
      TokenVerification.adminAuthentication,
      UserController.createNewTicket,
    );

    this.router.get(
      '/admin-faqs',
      TokenVerification.adminAuthentication,
      UserController.manageFaqs,
    );

    this.router.put(
      '/admin-faqs-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageFaqsDetail,
    );

    this.router.post(
      '/add-faq',
      TokenVerification.adminAuthentication,
      UserController.createNewFAQ,
    );

    this.router.get(
      '/admin-settings-google',
      TokenVerification.adminAuthentication,
      UserController.manageGoogleSettings,
    );

    this.router.get(
      '/admin-settings-facebook',
      TokenVerification.adminAuthentication,
      UserController.manageFacebookSettings,
    );

    this.router.get(
      '/admin-settings-paystack',
      TokenVerification.adminAuthentication,
      UserController.managePaystackSettings,
    );

    this.router.get(
      '/admin-settings-email',
      TokenVerification.adminAuthentication,
      UserController.manageEmailSettings,
    );

    this.router.get(
      '/admin-settings-bucket',
      TokenVerification.adminAuthentication,
      UserController.manageS3BucketSettings,
    );

    this.router.get(
      '/admin-settings-instagram',
      TokenVerification.adminAuthentication,
      UserController.manageInstagramSettings,
    );

    this.router.put(
      '/admin-settings-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageSettingsDetail,
    );

    this.router.get(
      '/admin-itineraries',
      TokenVerification.adminAuthentication,
      UserController.manageItineraries,
    );

    this.router.get(
      '/admin-users-plan',
      TokenVerification.adminAuthentication,
      UserController.manageUsersPlan,
    );

    this.router.put(
      '/admin-itinerary-details/:id',
      TokenVerification.adminAuthentication,
      UserController.manageItineraryDetail,
    );

    this.router.put(
      '/notification-update/:id',
      TokenVerification.adminAuthentication,
      UserController.manageUserNotificationCounter,
    );

    this.router.get(
      '/admin-analytics',
      TokenVerification.adminAuthentication,
      UserController.getAnalytics,
    );
    this.router.get(
      '/admin-bookings',
      TokenVerification.adminAuthentication,
      UserController.manageBookings,
    );

    this.router.put(
      '/admin-bookings-detail',
      TokenVerification.adminAuthentication,
      UserController.manageBookingsDetail,
    );

    this.router.post(
      '/make-quotation',
      TokenVerification.adminAuthentication,
      UserController.makeQuotation,
    );

    this.router.post(
      '/admin-manual-booking',
      TokenVerification.adminAuthentication,
      UserController.manageManualBooking,
    );

    this.router.get('/admin', TokenVerification.adminAuthentication, UserController.adminDashboard);

    this.router.get(
      '/admin-sales-today',
      TokenVerification.adminAuthentication,
      UserController.adminDashboardTodaySales,
    );

    this.router.get(
      '/admin-sales-yesterday',
      TokenVerification.adminAuthentication,
      UserController.adminDashboardYesterdaySales,
    );

    this.router.get(
      '/admin-sales-lastweek',
      TokenVerification.adminAuthentication,
      UserController.adminDashboardWeeklySales,
    );

    this.router.get(
      '/admin-users-month-ago',
      TokenVerification.adminAuthentication,
      UserController.adminDashboardMonthlySales,
    );

    this.router.get(
      '/payment-history',
      TokenVerification.adminAuthentication,
      UserController.paystackHistoryAdmin,
    );

    this.router.get(
      '/payment-payments',
      TokenVerification.adminAuthentication,
      UserController.paystackPaymentsAdmin,
    );

    this.router.get(
      '/payment-quotations',
      TokenVerification.adminAuthentication,
      UserController.paystackQuotationsAdmin,
    );

    this.router.delete(
      '/payment/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deletePayment,
    );

    this.router.delete(
      '/wallet/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteWallet,
    );

    this.router.delete(
      '/quotation/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteQuotation,
    );

    this.router.put(
      '/userplan-status-update/:id',
      TokenVerification.adminAuthentication,
      UserController.updateUsersPlanStatusAdmin,
    );

    this.router.put(
      '/user-itinerary-status-update/:id',
      TokenVerification.adminAuthentication,
      UserController.updateItineraryStatusAdmin,
    );

    this.router.post(
      '/admin-itinerary-add',
      TokenVerification.adminAuthentication,
      UserSanitizer.checkIfUserDoesntExists,
      UserController.createNewItinerary,
    );

    this.router.post(
      '/admin-plan-add',
      TokenVerification.adminAuthentication,
      UserController.createNewPlanBooking,
    );

    this.router.post(
      '/add-cars',
      TokenVerification.adminAuthentication,
      UserController.createNewCar,
    );

    this.router.get(
      '/admin-cars-mgt',
      TokenVerification.adminAuthentication,
      UserController.manageCars,
    );

    this.router.get(
      '/get-cars-info',
      TokenVerification.adminAuthentication,
      UserController.getCarsInfo,
    );

    this.router.put(
      '/admin-cars-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageCarsDetail,
    );

    this.router.get(
      '/admin-inspection',
      TokenVerification.adminAuthentication,
      UserController.manageInspection,
    );

    this.router.post(
      '/add-inspection',
      TokenVerification.adminAuthentication,
      UserController.createNewInspection,
    );

    this.router.put(
      '/admin-inspection-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageInspectionDetail,
    );

    this.router.delete(
      '/inspection/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteInspection,
    );

    this.router.get('/admin-drive-test', UserController.manageDriveTest);

    this.router.put(
      '/admin-drive-test-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.manageDriveTestDetail,
    );

    this.router.post(
      '/add-drive-test',
      TokenVerification.adminAuthentication,
      UserController.createNewDriveTest,
    );

    this.router.delete(
      '/drive-test/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deleteDriveTest,
    );

    this.router.put(
      '/update-testcenter/:id',
      TokenVerification.adminAuthentication,
      UserController.manageUsersDriveTestCenterUpdate,
    );

    this.router.get(
      '/admin-previledges',
      TokenVerification.adminAuthentication,
      UserController.managePreviledges,
    );

    this.router.post(
      '/add-roles',
      TokenVerification.adminAuthentication,
      UserController.createNewPreviledges,
    );

    this.router.put(
      '/admin-previledges-update/:id',
      TokenVerification.adminAuthentication,
      UserController.adminPreviledgesEdit,
    );

    this.router.post(
      '/admin-assign-role',
      TokenVerification.adminAuthentication,
      UserController.assignRoleToUser,
    );

    this.router.get(
      '/get-admin-previledges/:id',
      TokenVerification.adminAuthentication,
      UserController.getUserPreviledges,
    );

    this.router.get(
      '/fetchuserinfo/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get user info by ID'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.showUserInfo,
    );

    this.router.get(
      '/activity-logs/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get activity logs for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.getActivityLogs,
    );

    this.router.put(
      '/users/saved-places',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update saved places for a user'
        next();
      },
      UserController.updateSavedPlaces,
    );

    this.router.put(
      '/users/emergency-contacts',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Update emergency contacts for a user'
        next();
      },
      UserController.updateEmergencyContacts,
    );

    this.router.post(
      '/users/referral/apply',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Apply a referral code'
        next();
      },
      UserController.applyReferralCode,
    );

    this.router.post(
      '/vouchers/redeem',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Redeem a voucher code'
        next();
      },
      UserController.redeemVoucher,
    );

    this.router.get(
      '/vouchers/link/:hash',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['User Profile']
        // #swagger.summary = 'Get voucher details by link hash'
        /* #swagger.parameters['hash'] = { description: 'Voucher hash/link identifier' } */
        next();
      },
      UserController.getVoucherByHash,
    );

    this.router.put(
      '/old_balance/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Wallet']
        // #swagger.summary = 'Set old/legacy balance for a user'
        /* #swagger.parameters['id'] = { description: 'User ID' } */
        next();
      },
      UserController.setOldBalance,
    );

    this.router.put(
      '/admin-role-detail/:id',
      TokenVerification.adminAuthentication,
      UserController.managePreviledgesDetail,
    );

    this.router.delete(
      '/roles/:id/delete',
      TokenVerification.adminAuthentication,
      UserController.deletePreviledges,
    );

    this.router.get(
      '/profile-admin-rights/update/:id/permission/:roles',
      TokenVerification.userAuthentication,
      UserController.showProfileRights,
    );

    this.router.get(
      '/get-trails',
      TokenVerification.adminAuthentication,
      UserController.getTrails,
    );

    this.router.post(
      '/log-audit',
      TokenVerification.adminAuthentication,
      UserController.createTrail,
    );

    this.router.get(
      '/get-all-notification',
      TokenVerification.adminAuthentication,
      UserController.getAllNotification,
    );

    this.router.get(
      '/get-all-cars-repair-request',
      TokenVerification.adminAuthentication,
      UserController.getAllRepairs,
    );

    this.router.put(
      '/admin-mech-status/:id',
      TokenVerification.adminAuthentication,
      UserController.changeRepairStatus,
    );

    this.router.get('/confirm-booking-request', UserController.driverConfirmBooking);

    this.router.post(
      '/admin-new-car-revoke',
      TokenVerification.adminAuthentication,
      UserController.revokecar,
    );

    this.router.put(
      '/admin-new-car-revoke-status/:id',
      TokenVerification.adminAuthentication,
      UserController.revokecarstatus,
    );

    this.router.get(
      '/admin-get-revoke-details',
      TokenVerification.adminAuthentication,
      UserController.getrevokecars,
    );

    this.router.put(
      '/notification/:id',
      TokenVerification.userAuthentication,
      UserController.updateNotificationStatus,
    );

    // Update driver socket id
    this.router.put('/driverLocationSocket/:id', async (req: Request, res: Response) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Update driver socket connection ID'
      /* #swagger.parameters['id'] = { description: 'Driver ID' } */
      if (!req.body) {
        return res.status(400).json({ error: 'Bad Data' });
      }
      try {
        const updateDetails = await DriverModel.updateOne(
          { id: req.params.id },
          { $set: { socketId: req.body.socketId } },
        ).exec();
        res.send(updateDetails);
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Get nearby driver
    this.router.get('/driverLocation/:latitude/:longitude', async (req: Request, res: Response) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Find nearby drivers by coordinates (max 1km)'
      /* #swagger.parameters['latitude'] = { description: 'Current latitude' } */
      /* #swagger.parameters['longitude'] = { description: 'Current longitude' } */
      try {
        const location = await DriverModel.find({
          location: {
            $near: {
              $maxDistance: 1000,
              $geometry: {
                type: 'Point',
                coordinates: [
                  parseFloat(req.params.latitude as string),
                  parseFloat(req.params.longitude as string),
                ],
              },
            },
          },
        }).exec();
        res.send(location);
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Get single driver and emit track
    this.router.get('/driverLocation/:id', async (req: Request, res: Response) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Get single driver location by ID and emit tracking event'
      /* #swagger.parameters['id'] = { description: 'Driver ID' } */
      const io = (req as any).app.io;
      try {
        const location = await DriverModel.findOne({ driverId: req.params.id }).exec();
        res.send(location);
        if (location) {
          io.emit('trackDriver', location);
        }
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Update location by driver
    this.router.put('/driverLocation/:id', async (req: Request, res: Response) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Update driver live location'
      /* #swagger.parameters['id'] = { description: 'Driver ID' } */
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Location coordinates and socketId',
        schema: { $ref: '#/definitions/DriverLocationUpdate' }
      } */
      const io = (req as any).app.io;
      const location = req.body;

      if (!location) {
        return res.status(400).json({ error: 'Bad Data' });
      }

      const latitude = parseFloat(location.latitude);
      const longitude = parseFloat(location.longitude);

      try {
        const driverId = String(req.params.id);
        const driverFilter = /^[0-9a-fA-F]{24}$/.test(driverId)
          ? { _id: driverId }
          : { id: Number(driverId) };
        const updateDetails = await DriverModel.updateOne(
          driverFilter,
          {
            $set: {
              socketId: location.socketId,
              coordinate: {
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            },
          },
        ).exec();

        res.send(updateDetails);
        io.emit('action', {
          type: 'UPDATE_DRIVER_LOCATION',
          payload: updateDetails,
        });
      } catch (err) {
        res.status(500).send(err);
      }
    });

    // Admin: Audit Logs (Aliasing trails for dashboard parity)
    this.router.get(
      '/admin-logs',
      TokenVerification.adminAuthentication,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Admin']
        // #swagger.description = 'Admin: Fetch all audit logs/trails'
        return UserController.getTrails(request, response);
      },
    );

    return this.router;
  }
}

export default UserRoutes;
