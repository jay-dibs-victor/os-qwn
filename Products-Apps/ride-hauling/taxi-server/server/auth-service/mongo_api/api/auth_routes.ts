import { Router, Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import UserController from '../controllers/user_controller';
import UserSanitizer from '../middlewares/user_sanitizer';
import JWT from 'jsonwebtoken';
import { passport } from '../App';
import UserModel from '../models/User.model';
import { TokenGenerator } from '../helpers/token_generator';
import TokenVerification from '../middlewares/token_validator';
import { ErrorHandler } from '../helpers/error_handler';
import fs from 'fs';

import { google } from 'googleapis';

const OAuth2Data = {
  web: {
    client_id: process.env.GOOGLE_CLIENT_ID || '',
    project_id: 'Queensdevproja123',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirect_uris: ['http://localhost:12000/api/v1/auth/google/callback'],
    javascript_origins: ['http://localhost:12000'],
  },
};

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || OAuth2Data.web.client_id;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || OAuth2Data.web.client_secret;
const REDIRECT_URL = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:12000/api/v1/auth/google/callback';

function keyGen(keyLength: number) {
  let key = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < keyLength; i++) {
    key += characters.substr(Math.floor(Math.random() * charactersLength + 1), 1);
  }

  return key;
}

class GoogleApi {
  private oAuth2Client: any;

  constructor() {
    this.oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
  }

  generateUrl(scopes: string[] = ['profile', 'email']) {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes.join(' '),
    });
  }

  async getUserInfo(code: string) {
    const credentials = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(credentials.tokens);
    const gmail = google.gmail({
      version: 'v1',
      auth: this.oAuth2Client,
    });
    return await gmail.users.getProfile({ userId: 'me' });
  }
}

const googleApi = new GoogleApi();

const requestGmailAuth = (req: Request, res: Response) => {
  const url = googleApi.generateUrl(['https://www.googleapis.com/auth/gmail.readonly']);
  res.redirect(url);
};

const getGmailUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.status(400).json({ status: 400, error: 'No code provided' });
  }
  try {
    const responseA = await googleApi.getUserInfo(code);
    res.send(responseA.data);
  } catch (e: any) {
    res.status(400).json({ status: 400, error: e.message });
  }
};

const getGmailUserInfoLogin = async (req: Request, res: Response, next: NextFunction) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.status(400).json({ status: 400, error: 'No code provided' });
  }
  try {
    const responseA = await googleApi.getUserInfo(code);
    if (responseA.data.emailAddress) {
      const email = responseA.data.emailAddress;
      const user = await UserModel.findOne({ email }).catch(() => null);
      if (!user) {
        return res.status(422).json({
          status: 422,
          error: 'User does not exists',
        });
      }

      if (!user.isVerified) {
        return res.status(422).json({
          status: 422,
          error: `<h6>Email verification step is needed. please check your email for a verification link or click the link to resend you an email verification</h6> 
            <a href="http://localhost:12000/api/v1/auth/resend/${email}">Resend </a>`,
        });
      }

      const result = {
        id: user.id,
        _id: user._id,
        email: user.email,
        isAdmin: user.is_admin,
        isVerified: user.isVerified,
        firstname: user.firstname,
        username: user.username,
        profile: user.avatar,
        plan: user.plan_name,
        balance: user.balance,
        notification_count: user.notification_count,
        user_type: user.user_type,
        phoneNumber: user.phone_number,
        roles: user.roles,
        test_certificate: user.test_certificate,
      };
      const token = TokenGenerator.generateToken(result);

      const templateDir = '../services/views/socialauth_success.html';
      return res.sendFile(templateDir);
    }
  } catch (e: any) {
    return res.status(400).json({ status: 400, error: e.message });
  }
};

class AuthRoutes {
  private router: Router;

  constructor(router: Router) {
    this.router = router;
  }

  attachRoutes(): Router {
    this.router.get('/request/gmail/auth', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Initiate Gmail OAuth to read emails'
      next();
    }, requestGmailAuth);
    this.router.get('/auth/google/callback', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Google OAuth callback for Gmail integration'
      next();
    }, getGmailUserInfo as any);

    this.router.get('/request/gmail/auth/login', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Initiate Gmail OAuth for login'
      next();
    }, requestGmailAuth);
    // Note: The second /auth/google/callback route in JS version would overwrite the first one.
    // In a real app, you might want distinct callbacks or dynamic handling.
    // Keeping it as is but pointing to the login version as it was last in JS.
    this.router.get('/auth/google/callback', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Google OAuth callback for login'
      next();
    }, getGmailUserInfoLogin as any);

    this.router.get('/', (request: Request, response: Response) =>
      response.status(200).json({
        message: 'Welcome to Queens API',
      }),
    );
    this.router.post(
      '/auth/signup',
      UserSanitizer.validateSignUp,
      UserSanitizer.checkIfUserExists,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Auth']
        // #swagger.description = 'Endpoint for user registration'
        /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'User signup details',
            schema: { $ref: '#/definitions/signup' }
        } */
        return UserController.signup(request, response);
      },
    );
    this.router.post(
      '/auth/login',
      UserSanitizer.validateLogin,
      UserSanitizer.checkIfUserIsBanned,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Auth']
        // #swagger.description = 'Endpoint for user login'
        /* #swagger.parameters['obj'] = {
            in: 'body',
            description: 'Login credentials',
            schema: { $ref: '#/definitions/login' }
        } */
        return UserController.login(request, response);
      },
    );
    this.router.get(
      '/auth/me',
      TokenVerification.userAuthentication,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Auth']
        // #swagger.description = 'Get current authenticated user profile'
        return UserController.me(request, response);
      },
    );
    this.router.get('/auth/confirmation/:id', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Verify user email via token'
      return UserController.confirmationPost(req, res);
    });
    this.router.get('/auth/resend/:id', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Resend verification email'
      return UserController.resendTokenPost(req, res);
    });
    this.router.post('/auth/verify-code', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Verify user email via 6-digit code'
      return UserController.verifyCode(req, res);
    });
    this.router.post('/auth/resend-code', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Resend verification code'
      return UserController.resendCode(req, res);
    });
    this.router.post('/auth/forgot_password', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Trigger forgot password email'
      return UserController.passwordForgot(req, res);
    });
    this.router.get('/auth/resetMyPassword/:id', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Confirm password reset token'
      return UserController.confirmResetPassword(req, res);
    });
    this.router.post('/auth/resetpassword', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Update password after reset'
      return UserController.changePasswordTrigger(req, res);
    });
    this.router.post('/auth/resetpassword/mobile', (req, res) => {
      // #swagger.tags = ['Auth']
      // #swagger.description = 'Update password after reset (Mobile)'
      return UserController.changePasswordTriggerMobile(req, res);
    });

    this.router.get('/logout', (req: Request, res: Response) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Logout and redirect to the user app'
      // @ts-ignore
      req.logout();
      const returnTo = req.query.returnTo || process.env.USER_APP_URL || 'http://localhost:4002';
      res.redirect(returnTo as string);
    });

    const createToken = (req: Request, res: Response) => {
      const user = (req as any).user;
      const resultingTokenShibilish = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      const accessToken = JWT.sign(resultingTokenShibilish, process.env.SECRET!, {
        expiresIn: 60 * 120,
      });

      (req as any).token = accessToken;
      res.setHeader('x-auth-token', accessToken);
      res.status(200).json({
        status: 200,
        data: [
          {
            token: accessToken,
            user,
          },
        ],
        message: 'User created successfully',
      });
    };

    // ── Web Google OAuth (browser redirect flow) ──────────────────────────
    this.router.get('/google/start', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Initiate Google OAuth login (web)'
      next();
    }, passport.authenticate('google', { session: false, scope: ['openid', 'profile', 'email'] }));
    this.router.get('/google/redirect', (req, res, next) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Google OAuth callback (web)'
      next();
    }, passport.authenticate('google', { session: false }), createToken);

    // ── Mobile Google OAuth (ID Token Flow) ───────────────────────────
    // Mobile apps using @react-native-google-signin/google-signin send ID tokens directly.
    // Server verifies the ID token with Google and returns a JWT.
    this.router.post('/auth/google/mobile', async (request: Request, response: Response) => {
      // #swagger.tags = ['Auth']
      // #swagger.summary = 'Mobile Google OAuth sign-in via ID token'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Google ID token from mobile client',
        schema: { $ref: '#/definitions/googleIdToken' }
      } */
      try {
        const { idToken, role } = request.body;
        
        if (!idToken) {
          return response.status(400).json({ status: 400, error: 'ID token is required' });
        }

        // Verify the ID token with Google
        const { OAuth2Client } = require('google-auth-library');
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || OAuth2Data.web.client_id;
        
        const client = new OAuth2Client(GOOGLE_CLIENT_ID);
        const ticket = await client.verifyIdToken({ 
          idToken, 
          audience: GOOGLE_CLIENT_ID 
        });
        const payload = ticket.getPayload();

        if (!payload || !payload.email) {
          return response.status(401).json({ status: 401, error: 'Invalid Google token' });
        }

        const { email, given_name, family_name, picture, sub: googleId } = payload;
        const firstname = given_name || email.split('@')[0];
        const lastname = family_name || '';
        const userRole = role === 'driver' ? 'Individual Driver' : 'user';

        let user = await (UserModel as any).findOne({ email });

        if (!user) {
          const username = email.split('@')[0] + Math.floor(Math.random() * 1000);
          user = await (UserModel as any).create({
            id: require('../helpers/autoincrement_mongo').default(UserModel).counter(),
            oauthID: googleId,
            firstname,
            lastname,
            username,
            email,
            avatar: picture || '',
            phone_number: '',
            password: '',
            is_admin: false,
            isVerified: true,
            roles: userRole,
            user_type: 'Individual',
            referral_code: (firstname.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase(),
          });
        } else {
          user.isVerified = true;
          user.oauthID = user.oauthID || googleId;
          user.avatar = user.avatar || picture || '';
          await user.save();
        }

        const result = {
          id: user.id,
          _id: user._id,
          email: user.email,
          isAdmin: user.is_admin,
          isVerified: user.isVerified,
          firstname: user.firstname,
          username: user.username,
          profile: user.avatar,
          plan: user.plan_name,
          balance: user.balance,
          notification_count: user.notification_count,
          user_type: user.user_type,
          phoneNumber: user.phone_number,
          roles: user.roles,
          test_certificate: user.test_certificate,
        };
        const token = JWT.sign(result, process.env.SECRET!, { expiresIn: 60 * 120 });

        return response.status(200).json({
          status: 200,
          data: [{ token, user: result }],
          message: 'Google sign-in successful',
        });
      } catch (err: any) {
        console.error('Google mobile auth error:', err);
        const errorMessage = err.message || 'Google authentication failed';
        return response.status(401).json({ status: 401, error: errorMessage });
      }
    });

    // ── Driver Auth Routes ────────────────────────────────────────────────
    this.router.post(
      '/auth/drivers-signup',
      UserSanitizer.validateSignUp,
      UserSanitizer.checkIfUserExists,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Register a new driver (mobile)'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Driver signup details',
          schema: { $ref: '#/definitions/DriverSignup' }
        } */
        return UserController.signupMobile(request, response);
      },
    );
    this.router.post(
      '/auth/drivers-login',
      UserSanitizer.validateLogin,
      (request: Request, response: Response) => {
        // #swagger.tags = ['Drivers']
        // #swagger.summary = 'Driver login (mobile)'
        /* #swagger.parameters['body'] = {
          in: 'body',
          description: 'Driver login credentials',
          schema: { $ref: '#/definitions/DriverLogin' }
        } */
        return UserController.loginMobile(request, response);
      },
    );
    this.router.post('/auth/drivers-verify-code', (req, res) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Verify driver email via 6-digit code'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Email and verification code',
        schema: { $ref: '#/definitions/verifyCode' }
      } */
      return UserController.verifyCode(req, res);
    });
    this.router.post('/auth/drivers-resend-code', (req, res) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Resend verification code to driver'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Email to resend code to',
        schema: { email: 'jane@example.com' }
      } */
      return UserController.resendCode(req, res);
    });
    this.router.post('/auth/drivers-forgot_password', (req, res) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Trigger forgot-password email for driver'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'Driver email',
        schema: { $ref: '#/definitions/forgotPassword' }
      } */
      return UserController.passwordForgot(req, res);
    });
    this.router.post('/auth/drivers-resetpassword/mobile', (req, res) => {
      // #swagger.tags = ['Drivers']
      // #swagger.summary = 'Update driver password after reset (mobile)'
      /* #swagger.parameters['body'] = {
        in: 'body',
        description: 'New password and reset token',
        schema: { $ref: '#/definitions/resetPassword' }
      } */
      return UserController.changePasswordTriggerMobile(req, res);
    });

    this.router.get('/auth/facebook/callback/', (request: Request, response: Response) => {
      console.log('hit facebook');
    });

    return this.router;
  }
}

export default AuthRoutes;
