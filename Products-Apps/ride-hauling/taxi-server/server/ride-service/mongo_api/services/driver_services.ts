import dotenv from 'dotenv';
dotenv.config();
import { Request, Response } from 'express';
// @ts-ignore
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import { passport } from '../App';
import IndividualPlanModel from '../models/IndividualPlan.model';
import NotificationModel from '../models/Notification.model';
import FAQModel from '../models/FAQ.model';
import coperatePlanModel from '../models/CoperatePlan.model';
import { TokenGenerator } from '../helpers/token_generator';
import { ErrorHandler } from '../helpers/error_handler';
import ResponseHandler from '../helpers/response_handler';
import PartnersModel from '../models/Partners.model';
import UserModel from '../models/User.model';
import AutoincrementId from '../helpers/autoincrement_mongo';
import EmailTokenMakerForSignUp from '../models/Token.model';
import ForgotPasswordToken from '../models/ForgotPassword.model';
import CarsModel from '../models/Cars.model';
import SOSModel from '../models/SOS.model';
import InterventionsModel from '../models/Feedback.model';
import SendgridEmailSettingModel from '../models/SendgridEmailSettings.model';
import ItineraryModel from '../models/Itinerary.model';
import InspectionModel from '../models/Inspection.model';
import DriveTestModel from '../models/DriveTest.model';
import RolesAndPreviledgesModel from '../models/RolesAndPreviledges.model';
import DriverModel from '../models/Driver.model';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
import MailMan from './MailMan';
import handlebars from 'handlebars';
// @ts-ignore
import sendgridTransport from 'nodemailer-sendgrid-transport';
import Storage from '../helpers/storage';
import multer from 'multer';
import Mixins from '../helpers/mixins';
import fs from 'fs';

import requestLib from 'request';
import _ from 'lodash';
import { GamificationService } from './gamification_service';
import { GATEWAY_URL } from '../../../shared/constants';

const readHTMLFile = function (path: string, callback: any) {
  fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
    if (err) {
      callback(err);
    } else {
      callback(null, html);
    }
  });
};

export class DriverService {
  static signup(request: Request, response: Response) {
    let { firstname, lastname, username, email, phoneNumber, user_type, password, referred_by } = request.body;

    password = TokenGenerator.hashPassword(password.trim());

    // @ts-ignore
    const Newuser = new UserModel({
      id: AutoincrementId(UserModel).counter(),
      firstname,
      lastname,
      user_type,
      username,
      email,
      phone_number: phoneNumber,
      password,
      is_admin: false,
      roles: 'Individual Driver',
      referred_by: referred_by || null,
      referral_code: (firstname.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase()
    });

    Newuser.save()
      .then(async (data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
        const emailT = Math.floor(100000 + Math.random() * 900000).toString();

        // @ts-ignore
        const emailtoken = new EmailTokenMakerForSignUp({
          _userId: user.id,
          email_confirm_token: emailT,
        });

        emailtoken.save(function (err: any) {
          if (err) {
            return console.log(err.message);
          }
          console.log('Driver Verification code generated:', emailtoken.email_confirm_token);

          // Use MailMan for consistent driver email branding
          const locals = {
            username: user.firstname,
            code: emailT,
          };

          MailMan.sendMail(
            process.env.EMAIL_FROM || 'no-reply@queens.com',
            user.email,
            'Driver Portal - Verify Your Email',
            'signup-verification',
            locals
          ).catch(err => console.error('Driver Mail Error:', err));
        });

        const token = TokenGenerator.generateToken(result);

        try {
          await GamificationService.addCoins(user.id || user._id, 500, 'REWARD', 'Driver Welcome Bonus');
        } catch (e) {
          console.error('Failed to award driver signup bonus:', e);
        }

        try {
          await DriverModel.updateOne(
            { email: user.email },
            {
              $setOnInsert: {
                email: user.email,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                phone_number: user.phone_number,
                roles: user.roles,
                vettingStatus: 'NOT_SUBMITTED',
                isVerified: false,
              },
            },
            { upsert: true },
          ).exec();
        } catch (e) {
          console.error('Failed to ensure driver onboarding record:', e);
        }

        return response.status(201).json({
          status: 201,
          data: [
            {
              token,
              user,
              requiresVerification: true
            },
          ],
          message: 'Driver account created successfully. Please verify your email.',
        });
      })
      .catch(err => {
        console.log(err + ' error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static login(request: Request, response: Response) {
    const { email, password } = request.body;
    UserModel.findOne({ email: email })
      .then(async (data: any) => {
        const user = data;

        if (!user) {
          return response.status(422).json({
            status: 422,
            error: 'User does not exist',
          });
        }

        if (!user.isVerified) {
          return response.status(422).json({
            status: 422,
            requiresVerification: true,
            error: 'Email verification is required. Please check your email for a 6-digit code.',
          });
        }

        // @ts-ignore
        if (!TokenGenerator.checkIfPasswordMatch(password, user.password)) {
          return response.status(422).json({
            status: 422,
            error: 'Invalid login details. Email or password is wrong',
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
          notification_count: user.notification_count,
          user_type: user.user_type,
          phoneNumber: user.phone_number,
          roles: user.roles,
          is_available: true,
        };

        try {
          const driver = await DriverModel.findOne({ email: user.email });
          (result as any).vettingStatus = driver?.vettingStatus || 'NOT_SUBMITTED';
          (result as any).adminVerified = !!driver?.isVerified;
        } catch (e) {
          (result as any).vettingStatus = 'NOT_SUBMITTED';
          (result as any).adminVerified = false;
        }

        // Automatically set the driver online upon login
        await UserModel.updateOne({ _id: user._id }, { is_available: true });

        const token = TokenGenerator.generateToken(result);
        return response.status(200).json({
          status: 200,
          data: [
            {
              token,
              user: result,
            },
          ],
          message: 'Successfully signed in',
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static confirmationPost(req: Request, res: Response) {
    EmailTokenMakerForSignUp.findOne({ email_confirm_token: req.params.id }, function (err: any, token: any) {
      if (!token)
        return res.status(400).send({
          type: 'not-verified',
          msg: 'We were unable to find a valid token. Your token my have expired.',
        });

      UserModel.findOne({ id: token._userId }, function (err: any, user: any) {
        if (!user) {
          return res.sendFile(path.join(__dirname + '../../../../../UI/user/page-503.html'));
        }
        if (user.isVerified) {
          return res.sendFile(path.join(__dirname + '/templates/drivers-already-verified.html'));
        }

        user.isVerified = true;
        user.save(function (err: any) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          return res.sendFile(path.join(__dirname + '/templates/drivers-proceed-to-login.html'));
        });
      });
    });
  }

  static resendTokenPost(req: Request, res: Response) {
    UserModel.findOne({ $or: [{ id: Number(req.params.id) }, { email: req.params.id }] }, function (err: any, user: any) {
      if (!user)
        return res.status(400).send({ msg: 'We were unable to find a user with that email.' });

      if (user.isVerified)
        return res.sendFile(path.join(__dirname, 'views', 'drivers-already-verified.html'));

      // @ts-ignore
      const token = new EmailTokenMakerForSignUp({
        _userId: user.id,
        email_confirm_token: crypto.randomBytes(16).toString('hex'),
      });

      token.save(function (err: any) {
        if (err) {
          return res.status(500).send({ msg: err.message });
        }

        // Use MailMan (UniversalMailService) instead of SendGrid transport
        const locals = {
          username: user.firstname,
          link:
            GATEWAY_URL +
            '/api/v1/auth/drivers-confirmation/' +
            token.email_confirm_token,
        };

        MailMan.sendMail(
          process.env.EMAIL_FROM || 'no-reply@queens.com',
          user.email,
          'Driver Portal - Verify Your Email',
          'drivers-signup-verification',
          locals,
        ).catch(err => console.error('Driver Mail Error (MailMan):', err));
      });
    });
  }

  static passwordForgot(req: Request, res: Response) {
    const email = req.body.email;
    UserModel.findOne({ email: email }, function (err: any, user: any) {
      if (!user)
        return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      ForgotPasswordToken.deleteMany({ email_to_reset: email })
        .then(() => {
          // @ts-ignore
          const ForgotModelToken = new ForgotPasswordToken({
            _userId: user.id,
            email_confirm_token: code,
            email_to_reset: email,
          });

          ForgotModelToken.save(function (saveErr: any) {
            if (saveErr) {
              return res.status(500).send({ msg: saveErr.message });
            }

            MailMan.sendMail(
              process.env.EMAIL_FROM || 'no-reply@queens.com',
              user.email,
              'Queens Driver - Password Reset Code',
              'drivers-reset-password-otp',
              { username: user.firstname || user.username || 'Driver', code },
            ).catch((mailErr: any) => console.error('Driver password reset mail error:', mailErr));

            return res.status(200).send({ msg: 'Password reset code sent', status: 'ok' });
          });
        })
        .catch((cleanupErr: any) => res.status(500).send({ msg: cleanupErr.message }));
    });
  }

  static confirmResetPassword(req: Request, res: Response) {
    return res.sendFile(path.join(__dirname, 'views', 'drivers-pw-reset.html'));
  }

  static changePasswordTrigger(req: Request, res: Response) {
    const password = req.body.password;
    const confirmPass = req.body.confirmPassword;
    if (password != confirmPass) {
      return res.status(400).send({ msg: 'password do not match.' });
    }

    ForgotPasswordToken.findOne({ email_confirm_token: Storage.getItem('hasher') }, function (
      err: any,
      token: any,
    ) {
      if (!token) {
        return res.status(400).send({
          type: 'not-verified',
          msg: 'We were unable to find a valid token. Your token my have expired.',
        });
      }

      UserModel.findOne({ email: token.email_to_reset }, function (err: any, user: any) {
        if (!user)
          return res.status(400).send({ msg: 'We were unable to find a user for this token.' });

        user.password = TokenGenerator.hashPassword(password.trim());
        user.save(function (err: any) {
          if (err) {
            return res.status(500).send({ msg: err.message });
          }
          return res
            .status(200)
            .send({ msg: 'The account password has been reset. Please wait...', status: 'ok' });
        });
      });
    });
  }

  static changePasswordTriggerMobile(req: Request, res: Response) {
    const password = req.body.password;
    const email = req.body.email;
    const code = req.body.code;

    if (!email || !password || !code) {
      return res.status(422).send({ msg: 'Email, code and password are required.' });
    }

    ForgotPasswordToken.findOne({ email_to_reset: email, email_confirm_token: code }, function (err: any, token: any) {
      if (!token) {
        return res.status(400).send({ msg: 'Invalid or expired reset code.' });
      }

      UserModel.findOne({ email: email }, function (userErr: any, user: any) {
        if (!user) return res.status(400).send({ msg: 'User not found.' });

        user.password = TokenGenerator.hashPassword(password.trim());
        user.save(function (saveErr: any) {
          if (saveErr) {
            return res.status(500).send({ msg: saveErr.message });
          }
          ForgotPasswordToken.deleteMany({ email_to_reset: email }).catch(() => undefined);
          return res.status(200).send({ msg: 'The account password has been reset.', status: 'ok' });
        });
      });
    });
  }

  static showProfile(request: Request, response: Response) {
    // @ts-ignore
    UserModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        const userInfo = data;
        if (userInfo.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              userInfo,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateProfile(request: Request, response: Response) {
    const {
      firstname,
      lastname,
      username,
      password,
      passwordConfirm,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      email,
    } = request.body;

    if (password && passwordConfirm) {
      if (password != passwordConfirm) {
        return response.status(400).send({ msg: 'password do not match.' });
      }
    }

    // @ts-ignore
    UserModel.findOne({ id: request.params.id }, function (err: any, user: any) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      if (password == 'unchanged' && passwordConfirm == 'unchanged') {
        user.password = user.password;
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
      }

      user.avatar = avatar || user.avatar;
      user.username = username || user.username;
      user.email = email || user.email;
      user.roles = user_type || user.roles;
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone_number = phoneNumber || user.phone_number;
      user.test_certificate = certificate || user.test_certificate;

      user.save(function (err: any, updatedUser: any) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static getAssignedDriverToCars(request: Request, response: Response) {
    // @ts-ignore
    CarsModel.find({ assigned_driver_email: request.params.id })
      .then((data: any) => {
        const carsInfo = data;
        return response.status(200).json({
          status: 200,
          data: [
            {
              carsInfo,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getDriversAssignedTrips(request: Request, response: Response) {
    // @ts-ignore
    ItineraryModel.find({ assigned_driver_email: request.params.id })
      .then((data: any) => {
        const tripsInfo = data;
        return response.status(200).json({
          status: 200,
          data: [
            {
              tripsInfo,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateAvailability(request: Request, response: Response) {
    const id = String(request.params.id);
    const { is_available } = request.body;

    const query = /^[0-9a-fA-F]{24}$/.test(id) ? { _id: id } : { id: Number(id) };

    // @ts-ignore
    UserModel.findOneAndUpdate(query, { is_available: is_available }, { new: true })
      .then((data: any) => {
        if (!data) {
          return response.status(404).json({ status: 404, error: 'Driver doesn\'t exist' });
        }
        return response.status(200).json({ status: 200, data, message: 'Driver availability updated' });
      })
      .catch((err: any) => response.status(400).json({ status: 400, error: err.message }));
  }

  static driverConfirmBooking(request: Request, response: Response) {
    return response.status(200).json({ status: 200, message: 'Booking confirmed' });
  }

  /**
   * verifyCode — Validate 6-digit numeric verification code for drivers
   */
  static async verifyCode(request: any, response: any) {
    const { email, code } = request.body;
    try {
      if (!email || !code) return response.status(400).json({ status: 400, message: 'Email and code are required' });

      const user = await UserModel.findOne({ email });
      if (!user) return response.status(404).json({ status: 404, message: 'Driver not found' });

      const tokenObj = await EmailTokenMakerForSignUp.findOne({ _userId: user.id, email_confirm_token: code });
      if (!tokenObj) return response.status(400).json({ status: 400, message: 'Invalid or expired verification code' });

      user.isVerified = true;
      await user.save();
      await EmailTokenMakerForSignUp.deleteMany({ _userId: user.id });

      return response.status(200).json({ status: 200, message: 'Email verified successfully!' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * resendCode — Regenerate and resend verification code for drivers
   */
  static async resendCode(request: any, response: any) {
    const { email } = request.body;
    try {
      if (!email) return response.status(400).json({ status: 400, message: 'Email is required' });

      const user = await UserModel.findOne({ email });
      if (!user) return response.status(404).json({ status: 404, message: 'Driver not found' });

      // Clean old tokens
      await EmailTokenMakerForSignUp.deleteMany({ _userId: user.id });

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newToken = new EmailTokenMakerForSignUp({ _userId: user.id, email_confirm_token: code });
      await newToken.save();

      // Use MailMan for consistent driver email branding
      const locals = {
        username: user.firstname,
        code: code,
      };

      MailMan.sendMail(
        process.env.EMAIL_FROM || 'no-reply@queens.com',
        user.email,
        'Driver Portal - Verify Your Email',
        'signup-verification',
        locals
      ).catch(err => console.error('Driver Resend Mail Error:', err));

      return response.status(200).json({ status: 200, message: 'Verification code resent successfully!' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }
}
