import { Router, Request, Response } from 'express';
import DriverController from '../controllers/driver_controller';
import DriverSanitizer from '../middlewares/driver_sanitizer';
import TokenVerification from '../middlewares/token_validator';

class DriversRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/auth/drivers-signup',
      DriverSanitizer.validateSignUp,
      DriverSanitizer.checkIfDriverExists,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Register a new driver account'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Driver signup details',
          schema: { $ref: '#/definitions/DriverSignup' }
        } */
        next();
      },
      DriverController.signup,
    );
    this.router.post(
      '/auth/drivers-login',
      DriverSanitizer.validateLogin,
      DriverSanitizer.checkIfDriverIsBanned,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Driver login'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Driver login credentials',
          schema: { $ref: '#/definitions/DriverLogin' }
        } */
        next();
      },
      DriverController.login,
    );
    this.router.post('/auth/drivers-forgot_password', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Trigger forgot-password email for driver'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Driver email for password reset',
        schema: { $ref: '#/definitions/forgotPassword' }
      } */
      next();
    }, DriverController.passwordForgot);
    this.router.get('/auth/drivers-confirmation/:id', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Verify driver email via confirmation token'
      /* #swagger.parameters['id'] = { description: 'Email verification token' } */
      next();
    }, DriverController.confirmationPost);
    this.router.get('/auth/drivers-resend/:id', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Resend driver email verification link'
      /* #swagger.parameters['id'] = { description: 'Driver email' } */
      next();
    }, DriverController.resendTokenPost);
    this.router.post('/auth/drivers-verify-code', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Verify driver email via 6-digit code'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Verification code',
        schema: { $ref: '#/definitions/verifyCode' }
      } */
      next();
    }, DriverController.verifyCode);
    this.router.post('/auth/drivers-resend-code', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Resend 6-digit verification code to driver'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Email to resend code to',
        schema: { email: 'jane@example.com' }
      } */
      next();
    }, DriverController.resendCode);

    this.router.get('/auth/drivers-resetMyPassword/:id', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Confirm driver password reset token'
      /* #swagger.parameters['id'] = { description: 'Password reset token' } */
      next();
    }, DriverController.confirmResetPassword);
    this.router.post('/auth/drivers-resetpassword', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Update driver password after reset'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'New password and reset token',
        schema: { $ref: '#/definitions/resetPassword' }
      } */
      next();
    }, DriverController.changePasswordTrigger);
    this.router.post('/auth/drivers-resetpassword/mobile', (req, res, next) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Update driver password after reset (mobile)'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'New password and reset token',
        schema: { $ref: '#/definitions/resetPassword' }
      } */
      next();
    }, DriverController.changePasswordTriggerMobile);

    this.router.get('/drivers-logout', (req: Request, res: Response) => {
      // @ts-ignore
      req.logout();
      res.redirect('/');
    });

    this.router.get(
      '/drivers-profile/update/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Get driver profile by ID'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.showProfile,
    );

    this.router.post(
      '/drivers-profile/update/:id',
      TokenVerification.userAuthentication,
      DriverSanitizer.validateSignUp,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Update driver profile information'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.updateProfile,
    );

    this.router.get(
      '/drivers-assigned-user-trips/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Get trips assigned to a driver'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.getDriversAssignedTrips,
    );

    this.router.get(
      '/drivers-assigned-cars/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Get cars assigned to a driver'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.getAssignedDriverToCars,
    );

    this.router.post(
      '/drivers-sos',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Send an SOS alert from a driver'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'SOS alert details',
          schema: { $ref: '#/definitions/SOSAlert' }
        } */
        next();
      },
      DriverController.createRedFlag,
    );

    this.router.get(
      '/drivers-sos/:id/users',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Get SOS alerts for a specific driver'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.usersRedflags,
    );

    this.router.post(
      '/drivers-notifications',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Send a notification to a driver'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Notification payload',
          schema: { $ref: '#/definitions/Notification' }
        } */
        next();
      },
      DriverController.sendNotifications,
    );

    this.router.get(
      '/drivers-notifications/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Get notifications for a driver'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        next();
      },
      DriverController.getNotifications,
    );

    this.router.put(
      '/drivers-availability/:id',
      TokenVerification.userAuthentication,
      (req, res, next) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Toggle driver online/offline status'
        /* #swagger.parameters['id'] = { description: 'Driver ID' } */
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Online status flag',
          schema: { $ref: '#/definitions/DriverOnlineStatus' }
        } */
        next();
      },
      DriverController.updateAvailability,
    );

    return this.router;
  }
}

export default DriversRoutes;
