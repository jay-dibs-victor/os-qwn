import { Router } from 'express';
import UserController from '../controllers/user_controller';
import UserSanitizer from '../middlewares/user_sanitizer';

class AuthRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.post(
      '/auth/signup',
      UserSanitizer.validateSignUp,
      UserSanitizer.checkIfUserExists,
      UserController.signup,
    );

    this.router.post('/auth/login', UserSanitizer.validateLogin, UserController.login);

    this.router.post('/auth/forgot_password', UserController.passwordForgot);
    this.router.post('/auth/resetpassword/mobile', UserController.changePasswordTriggerMobile);

    this.router.get('/auth/confirmation/:id', UserController.confirmationPost);
    this.router.get('/auth/resend/:id', UserController.resendTokenPost);
    this.router.post('/auth/verify-code', UserController.verifyCode);
    this.router.post('/auth/resend-code', UserController.resendCode);

    this.router.get('/auth/resetMyPassword/:id', UserController.confirmResetPassword);
    this.router.post('/auth/resetpassword', UserController.changePasswordTrigger);

    return this.router;
  }
}

export default AuthRoutes;

