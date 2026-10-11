/* eslint-disable prefer-const */

import dotenv from 'dotenv';
dotenv.config();

import { MQService } from '@shared/rabbitmq';
import { SERVER_URL } from '@shared/constants';

/*pAy stack*/
import request from 'request';
import _ from 'lodash';
/****************************************************************/
/******* @author saladin jake (Victor juwa) ********************************/
/******* @desc Express js || ****************/
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
// SendGrid usage removed — mail is handled via UniversalMailService/MailMan

import * as postmark from 'postmark';

import carsApi from '../../../ride-service/mongo_api/services/cars_api';

import { passport } from '../App';
import express, { Request, Response } from 'express';
//import EarningsModel from '../models/EarningsModel';
import AuditNotificationModel from '../models/AuditNotification.model';

import UserPlanModel from '../models/UserPlan.model';
import Retrieval from '../models/Retrival.model';
import PlanModel from '../models/Plan.model';
import ItineraryModel from '../models/Itinerary.model';
import IndividualPlanModel from '../models/IndividualPlan.model';
import NotificationModel from '../models/Notification.model';
import { MultiPaymentService } from '../../../ride-service/mongo_api/services/multi_payment_service';
import FAQModel from '../models/FAQ.model';
import coperatePlanModel from '../models/CoperatePlan.model';
import { TokenGenerator } from '../helpers/token_generator';
import { ErrorHandler } from '../helpers/error_handler';
import ResponseHandler from '../helpers/response_handler';
import UserModel from '../models/User.model';
import PartnersModel from '../models/Partners.model';
import EarningsModel from '../models/EarningsModel';
//import DriversModel from "../models/Driver.model.js";
import WalletModel from '../models/Wallet.model';
import PaymentModel from '../models/Payments.model';
import QuotationsModel from '../models/Quotation.model';
import DriverModel from '../models/Driver.model';
import RideModel from '../models/Ride.model';
import QuoteModel from '../models/Quote.model';
import AutoincrementId from '../helpers/autoincrement_mongo';
import EmailTokenMakerForSignUp from '../models/Token.model';
import ForgotPasswordToken from '../models/ForgotPassword.model';
import CarsModel from '../models/Cars.model';
import SOSModel from '../models/SOS.model';
import InterventionsModel from '../models/Feedback.model';
import SendgridEmailSettingModel from '../models/SendgridEmailSettings.model';
import PaystackSettingModel from '../models/PaystackSettings.model';
import InstagramSettingModel from '../models/InstagramSettings.model';
import FacebookSettingModel from '../models/FacebookSettings.model';
import AwsS3Model from '../models/AWS3BucketSettings.model';
import GmailSettingModel from '../models/GmailSettings.model';

import InspectionModel from '../models/Inspection.model';
import DriveTestModel from '../models/DriveTest.model';
import RolesAndPreviledgesModel from '../models/RolesAndPreviledges.model';
import MechModel from '../models/Repairs.model';
import VoucherModel from '../models/Voucher.model';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import path from 'path';
// SendGrid transport removed; mail sending uses MailMan/UniversalMailService
import PaystackConfig from '../config/paystack';
//import SocialAuthService from './social_auth_service';
import Storage from '../helpers/storage';
import multer from 'multer';
import Mixins from '../helpers/mixins';
import fs from 'fs';
import handlebars from 'handlebars';

import MailMan from './MailMan';

// import carInfo  from "../migrations/cars_info";

//other services
import { CarsService } from '../../../ride-service/mongo_api/services/cars_services';
import { FaqsService as FaqService } from '../../../ride-service/mongo_api/services/faqs_service';
import { InterventonService as FeedbackService } from '../../../ride-service/mongo_api/services/feedback_service';
import { RedFlagService as SOSService } from '../../../ride-service/mongo_api/services/sos_service';
import { GamificationService } from '../../../ride-service/mongo_api/services/gamification_service';
import { LocationService } from '../../../ride-service/mongo_api/services/location_service';
import { CurrencyService } from '../../../ride-service/mongo_api/services/currency_service';
import { PaymentRouterService } from '../../../ride-service/mongo_api/services/payment_router_service';

import MailConfig from '../config/email';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var gmailTransport = MailConfig.GmailTransport;
var smtpTransport = MailConfig.SMTPTransport;

const requestParams = require('request');
const { initializePayment, verifyPayment } = (PaystackConfig as any)(requestParams);

const BACKEND_API = SERVER_URL;

const readHTMLFile = function(path: string, callback: any) {
  fs.readFile(path, { encoding: 'utf-8' }, function(err, html) {
    if (err) {
      callback(err);
    } else {
      // Inject environment URLs into the HTML content
      let processed = html;
      processed = processed.replace(/{{USER_APP_URL}}/g, process.env.USER_APP_URL || 'http://localhost:4002');
      processed = processed.replace(/{{DRIVER_APP_URL}}/g, process.env.DRIVER_APP_URL || 'http://localhost:4000');
      processed = processed.replace(/{{ADMIN_APP_URL}}/g, process.env.ADMIN_APP_URL || 'http://localhost:4001');
      callback(null, processed);
    }
  });
};

export class UserService {
  static NotificationEmail(request: any, response: any, templateDir, replacements, userEmail, STATUS = 201) {
    //MailConfig.ViewOption(gmailTransport,hbs);
    let HelperOptions = {
      from: ' "Queens" <noreply@Queens.ng>', //"tester@softclo.com", //'"COMMUTE TAXI SERVICE" <juwavictor@gmail.com>',
      to: userEmail, //'Joshua.adedoyin@softclo.com',
      subject: 'Notification',
      html: 'test',
      context: {
        name: 'COMMUTE TAXI',
        email: 'tester@softclo.com',
        address: '3A DOTUN CLOSE, IKEJA LAGOS',
      },
    };

    //     Signed out
    // Adedoyin Joshua
    //joshadedoyin.aj@gmail.com

    readHTMLFile(__dirname + templateDir, function(err: any, html) {
      var template = handlebars.compile(html);
      // var replacements = replacements;
      var htmlToSend = template(replacements);

      HelperOptions.html = htmlToSend;
      smtpTransport.sendMail(HelperOptions, (error, info) => {
        if (error) {
          console.log('error');
          //response.json(error);
          return response.status(400).send({ msg: error });
        }
        // console.log("email is send");
        // console.log(info);
        //response.json(info)
        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated  .', data: info });
        // return response.status(STATUS).send({ msg: "successfully sent you a password reset link", status:'ok',data: info });
      });
    });
  }

  static passwordResetsMail(
    request: any,
    response: any,
    userEmail: string,
    templateDir: string,
    replacementObj: any = { username: 'user' },
    tokenSTR: string,
  ) {
    // Send OTP code via SendGrid using the reset-password template
    MailMan.sendMail(
      process.env.EMAIL_FROM || 'Queens App <no-reply@queens.com>',
      userEmail,
      'Reset Your Queens OS Password',
      'reset-password',
      { username: replacementObj.username, code: tokenSTR }
    ).catch((err: any) => console.error('[Mail] passwordResetsMail error:', err));
  }

  static newUserMail(
    request,
    response,
    result,
    templateDir = '/views/templates/signup-verification.html',
    tokenToSend,
    status = 201,
  ) {
    // Standard template naming in UniversalMailService strips the path/ext
    const tplName = 'signup-verification';
    const locals = {
        username: result.username,
        code: tokenToSend, // Numeric code
    };

    MailMan.sendMail(
        process.env.EMAIL_FROM || 'no-reply@queens.com',
        result.email,
        'Welcome to Queens - Verify Your Email',
        tplName,
        locals
    ).catch(err => console.error('Delayed Mail Error:', err));
  }

  /**
   * Internal helper to regenerate and send verification code
   */
  static async sendVerificationCodeInternal(user: any) {
    try {
      // Clean old tokens
      await EmailTokenMakerForSignUp.deleteMany({ _userId: user._id });

      // Generate 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const newToken = new EmailTokenMakerForSignUp({ 
        _userId: user._id, 
        email_confirm_token: code 
      });
      await newToken.save();

      const result = { id: user.id, email: user.email, username: user.username };
      // We don't need to pass request/response here since newUserMail is now largely decoupled
      UserService.newUserMail(null, null, result, undefined, code, 201);
      
      return code;
    } catch (err) {
      console.error('sendVerificationCodeInternal Error:', err);
      throw err;
    }
  }

  // static signup(request: any, response: any) {
  //     let { firstname,
  //         lastname,
  //         username,
  //         email,
  //         phoneNumber,
  //         user_type,
  //         password,

  //   } = request.body;

  //   let from_mobile = false;
  //   if(request.body.from_mobile==true){
  //     from_mobile =true;
  //   }

  //   console.log(password)
  //   password = TokenGenerator.hashPassword(password.trim());
  //   let roles = '';
  //   if(request.body.roles){
  //     roles = request.body.roles
  //   }else{
  //     roles = 'user';
  //   }

  //   let Newuser =null

  //   if(request.body.from_mobile){
  //     Newuser = new UserModel({
  //       id: AutoincrementId(UserModel).counter(),
  //       firstname,
  //       lastname,
  //       user_type,
  //       username,
  //       email,
  //       phone_number: phoneNumber,
  //       password,
  //       is_admin: false,
  //       roles: roles,
  //       isVerified: true,
  //       //accountNumber: uuidv4()
  //        });

  //   }else{

  //     Newuser = new UserModel({
  //           id: AutoincrementId(UserModel).counter(),
  //           firstname,
  //           lastname,
  //           user_type,
  //           username,
  //           email,
  //           phone_number: phoneNumber,
  //           password,
  //           is_admin: false,
  //           roles: roles,
  //       //accountNumber: uuidv4()
  //     });

  //   }

  //   if(from_mobile==false){

  //     Newuser.save()
  //     .then((data: any) => {
  //       const user = data;
  //       const result = {
  //         id: user.id,
  //         email: user.email,
  //         username: user.username,
  //       };
  //       let emailT = crypto.randomBytes(16).toString('hex');
  //       // Create a verification token for this user
  //       var emailtoken = new EmailTokenMakerForSignUp({ _userId: user._id, email_confirm_token: emailT });

  //                         // Save the verification token
  //       emailtoken.save(function (err) {
  //           if (err) {
  //              return console.log(err.message );
  //           }

  //                             //console.log(__dirname + '/views/templates/signup-verification.html')

  //          UserService.newUserMail(request,response, result,'/views/templates/signup-verification.html', emailtoken.email_confirm_token,201)
  //               const token = TokenGenerator.generateToken(result);
  //               return response.status(201).json({
  //                                          status: 201,
  //                                         data: [
  //                                                {
  //                                                  token,
  //                                                   from_mobile:true,
  //                                                   user,
  //                                                },
  //                                               ],
  //                                                message: 'User created successfully',
  //               });

  //          })

  //     })
  //     .catch((err: any) => {
  //           console.log(err+ 'error here')
  //           response.status(400).json({
  //             status: 400,
  //             error: ErrorHandler.errors().validationError,
  //           });
  //     });

  //   }else{

  //     Newuser.save()
  //     .then((data: any) => {
  //       const user = data;
  //       const result = {
  //         id: user.id,
  //         email: user.email,
  //         username: user.username,
  //       };

  //       const token = TokenGenerator.generateToken(result);
  //       return response.status(201).json({
  //               status: 201,
  //               data: [
  //                      {
  //                       token,
  //                       user,
  //                      },
  //                     ],
  //                     message: 'User created successfully',
  //             });
  //     })
  //     .catch((err: any) => {
  //           console.log(err+ 'error here')
  //           response.status(400).json({
  //             status: 400,
  //             error: ErrorHandler.errors().validationError,
  //           });
  //     });

  //   }

  // }

  // static login(request: any, response: any) {
  //   const { email, password } = request.body;
  //   UserModel.findOne({email: email})
  //     .then((data: any) => {
  //       const user = data;
  //       console.log(user.isVerified)

  //       if (!user) {
  //         return response.status(422).json({
  //           status: 422,
  //           error: 'User does not exists',
  //         });

  //       }

  //       if(!user.isVerified){
  //         let link = BACKEND_API + '/auth'
  //         return response.status(422).json({
  //           status: 422,
  //           error: `<h6>Email verification step is needed. please check your email for a verification link or click the link to resend you an email verification</h6>

  //           <a href="${link}/resend/${email}">Resend </a>`,
  //         });
  //       }

  //       if (!TokenGenerator.checkIfPasswordMatch(password, user.password)) {
  //         return response.status(422).json({
  //           status: 422,
  //           error: 'Invalid login details. Email or password is wrong',
  //         });
  //       }

  //       const result = {
  //         id: user.id,
  //         _id: user._id,
  //         email: user.email,
  //         isAdmin: user.is_admin,
  //         isVerified:user.isVerified,
  //         firstname: user.firstname,
  //         username: user.username,
  //          profile: user.avatar,
  //         plan: user.plan_name,
  //         balance: user.balance,
  //         notification_count: user.notification_count,
  //         user_type: user.user_type,
  //         username:user.username,
  //         phoneNumber: user.phone_number,
  //         roles: user.roles,
  //         test_certificate: user.test_certificate

  //       };
  //       const token = TokenGenerator.generateToken(result);
  //       return response.status(200).json({
  //         status: 200,
  //         data: [
  //           {
  //             token,
  //             user: {
  //               id: user.id,
  //                _id: user._id,
  //               email: user.email,
  //               isAdmin: user.is_admin,
  //               isVerified:user.isVerified,
  //               firstname: user.firstname,
  //               username: user.username,
  //               profile: user.avatar,
  //               plan_name: user.plan_name,
  //               balance: user.balance,
  //               notification_count: user.notification_count,
  //                user_type: user.user_type,
  //                account_num: user.accountNumber,
  //                username:user.username,
  //                phoneNumber: user.phone_number,
  //                roles: user.roles,
  //               test_certificate: user.test_certificate
  //             },
  //           },
  //         ],
  //         message: 'Successfully signed in',
  //       });
  //     })
  //     .catch((err: any) =>
  //       response.status(400).json({
  //         status: 400,
  //         error: ErrorHandler.errors().validationError,
  //       }),
  //     );
  // }

  //web sign up and login
  static signup(request: any, response: any) {
    let { firstname, lastname, username, email, phoneNumber, user_type, password, referred_by } = request.body;

    console.log(password);
    password = TokenGenerator.hashPassword(password.trim());

    const refCode = (firstname.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase();

    const Newuser = new UserModel({
      id: AutoincrementId(UserModel).counter(),
      firstname,
      lastname,
      user_type: user_type || 'Individual User',
      username,
      email,
      phone_number: phoneNumber,
      password,
      is_admin: false,
      roles: 'Individual User', // Default role
      referral_code: refCode,
      referred_by: referred_by || null,
      // Default permissions for Individual User
      view_transactions: 'yes',
      view_quotations: 'yes',
      view_cars: 'yes',
      manage_payments: 'yes'
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
        let emailT = Math.floor(100000 + Math.random() * 900000).toString();
        // Create a verification token for this user
        var emailtoken = new EmailTokenMakerForSignUp({
          _userId: user._id,
          email_confirm_token: emailT,
        });

        // Save the verification token
        emailtoken.save(function(err) {
          if (err) {
            return console.log(err.message);
          }
          console.log('Verification code generated:', emailtoken.email_confirm_token);

          UserService.newUserMail(
            request,
            response,
            result,
            '/views/templates/signup-verification.html',
            emailtoken.email_confirm_token,
            201,
          );

          try {
            MQService.publish('auth.events', 'user.created', user);
          } catch (e) {
            console.error('RabbitMQ Error:', e);
          }

          const token = TokenGenerator.generateToken(result);

          return response.status(201).json({
            status: 201,
            data: [
              {
                token,
                user,
                requiresVerification: true
              },
            ],
            message: 'User created successfully. Please verify your email.',
          });
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static login(request: any, response: any) {
    const { email, password } = request.body;
    UserModel.findOne({ email: email })
      .then(async (data: any) => {
        const user = data;

        if (!user) {
          return response.status(422).json({
            status: 422,
            error: 'User does not exists',
          });
        }

        if (!user.isVerified) {
          await UserService.sendVerificationCodeInternal(user);
          return response.status(422).json({
            status: 422,
            error: `<h6>Email verification is required. A new verification code has been sent to your email. Please verify to continue.</h6>`,
          });
        }

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
          lastname: user.lastname,
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

        // ── SYNC LOCATION & CURRENCY ──────────────────────────────
        try {
          const ip = request.ip || request.headers['x-forwarded-for'] || '127.0.0.1';
          const location = await LocationService.detectFromCoords(request.body.lat, request.body.lng, ip as string);
          const currencyInfo = await CurrencyService.getLocalCurrencyInfo(request.body.lat, request.body.lng, location.countryCode);
          const bestGateway = PaymentRouterService.getBestGateway(location.countryCode);

          // Update user local_wallet in DB
          await UserModel.findByIdAndUpdate(user._id, {
            local_wallet: {
              country: location.countryCode,
              currency: currencyInfo.code,
              symbol: currencyInfo.symbol,
              gateway: bestGateway,
              last_sync: new Date()
            }
          });
          
          // Add to result for immediate frontend update
          (result as any).local_wallet = {
            country: location.countryCode,
            currency: currencyInfo.code,
            symbol: currencyInfo.symbol,
            gateway: bestGateway
          };
        } catch (syncErr) {
          console.error('[UserService] Location sync failed:', syncErr);
        }

        const token = TokenGenerator.generateToken(result);

        return response.status(200).json({
          status: 200,
          data: [
            {
              token,
              user: {
                id: user.id,
                _id: user._id,
                email: user.email,
                isAdmin: user.is_admin,
                isVerified: user.isVerified,
                firstname: user.firstname,
                username: user.username,
                profile: user.avatar,
                plan_name: user.plan_name,
                balance: user.balance,
                notification_count: user.notification_count,
                user_type: user.user_type,
                account_num: user.accountNumber,
                phoneNumber: user.phone_number,
                roles: user.roles,
                test_certificate: user.test_certificate,
              },
            },
          ],
          message: 'Successfully signed in',
        });
      })
      .catch((err: any) => {
        console.error('Login Error:', err);
        return response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  //web sign up and login
  static signupMobile(request: any, response: any) {
    let { firstname, lastname, username, email, phoneNumber, user_type, password, referred_by } = request.body;

    console.log(password);
    password = TokenGenerator.hashPassword(password.trim());

    let from_mobile = false;
    if (request.body.from_mobile == true) {
      from_mobile = true;
    }

    console.log(password);

    let roles = '';
    if (request.body.roles) {
      roles = request.body.roles;
    } else {
      roles = 'user';
    }

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
      isVerified: false,
      roles,
      referred_by: referred_by || null,
      referral_code: (firstname.substring(0, 3) + Math.random().toString(36).substring(2, 6)).toUpperCase()
      //accountNumber: uuidv4()
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };
        let emailT = Math.floor(100000 + Math.random() * 900000).toString();
        // Create a verification token for this user
        var emailtoken = new EmailTokenMakerForSignUp({ 
          _userId: user._id, 
          email_confirm_token: emailT 
        });

        // Save the verification token
        emailtoken.save(function (err) {
            if (err) {
              return console.log(err.message );
            }
            
            UserService.newUserMail(
              request, 
              response, 
              result,
              '/views/templates/signup-verification.html', 
              emailtoken.email_confirm_token,
              201
            );

            try {
              MQService.publish('auth.events', 'user.created', user);
            } catch (e) {
              console.error('RabbitMQ Error:', e);
            }

            const token = TokenGenerator.generateToken(result);
            const devPayload: any = { token, user, requiresVerification: true };
            if (process.env.NODE_ENV === 'DEVELOPMENT') {
              devPayload.verificationCode = emailtoken.email_confirm_token;
              devPayload._devHint = 'Development only: use this code with POST /auth/verify-code';
            }
            return response.status(201).json({
              status: 201,
              data: [devPayload],
              message: 'User created successfully. Verification code sent.',
            });
        });

        // });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static loginMobile(request: any, response: any) {
    const { email, password } = request.body;
    UserModel.findOne({ email: email })
      .then(async (data: any) => {
        const user = data;

        if (!user) {
          return response.status(422).json({
            status: 422,
            error: 'User does not exists',
          });
        }

        if (!user.isVerified) {
          await UserService.sendVerificationCodeInternal(user);
          return response.status(422).json({
            status: 422,
            requiresVerification: true,
            error: `<h6>Email verification is required. A new verification code has been sent to your email. Please verify to continue.</h6>`,
          });
        }

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
          plan: user.plan_name,
          balance: user.balance,
          notification_count: user.notification_count,
          user_type: user.user_type,
          phoneNumber: user.phone_number,
          roles: user.roles,
          test_certificate: user.test_certificate,
        };
        const token = TokenGenerator.generateToken(result);

        return response.status(200).json({
          status: 200,
          data: [
            {
              token,
              user: {
                id: user.id,
                _id: user._id,
                email: user.email,
                isAdmin: user.is_admin,
                isVerified: user.isVerified,
                firstname: user.firstname,
                username: user.username,
                profile: user.avatar,
                plan_name: user.plan_name,
                balance: user.balance,
                notification_count: user.notification_count,
                user_type: user.user_type,
                account_num: user.accountNumber,
                phoneNumber: user.phone_number,
                roles: user.roles,
                test_certificate: user.test_certificate,
              },
            },
          ],
          message: 'Successfully signed in',
        });
      })
      .catch((err: any) => {
        console.error('Login Mobile Error:', err);
        return response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static sendTemplate(response: Response, templatePath: string) {
    readHTMLFile(templatePath, (err: any, html: string) => {
      if (err) {
        console.error('Template Error:', err);
        return response.status(500).send('Server Error');
      }
      response.send(html);
    });
  }

  static logout(request: any, response: any) {}

  static confirmationPost(request: any, response: any) {
    // Find a matching token
    EmailTokenMakerForSignUp.findOne({ email_confirm_token: request.params.id }, function(err: any, token) {
      if (!token)
        return response.status(400).send({
          type: 'not-verified',
          msg: 'We were unable to find a valid token. Your token my have expired.',
        });

      // If we found a token, find a matching user email: request.body.email
      UserModel.findOne({ _id: token._userId }, function(err: any, user) {
        if (!user) {
          //return response.status(400).send({ msg: 'We were unable to find a user for this token.' });
          return response.sendFile(path.join(__dirname + '../../../../../UI/user/page-503.html'));
        }
        if (user.isVerified) {
          return UserService.sendTemplate(response, path.join(__dirname, '/views/templates/already-verified.html'));
        }

        // Verify and save the user
        user.isVerified = true;
        user.save(function(err) {
          if (err) {
            return response.status(500).send({ msg: err.message });
          }

          if (user.roles != 'Individual Driver') {
            return UserService.sendTemplate(response, path.join(__dirname, '/views/templates/proceed-to-login.html'));
          }
          return UserService.sendTemplate(response, path.join(__dirname, '/views/templates/drivers-proceed-to-login.html'));
        });
      });
    });
  }

  static userExists(request: any, response: any) {
    UserModel.findOne({ email: request.body.email }, function(err: any, user) {
      if (!user) {
        return response.status(404).json({
          status: 404,
          data: [{}],
          message: 'User Not found ',
        });
      }

      return response.status(200).json({
        status: 200,
        data: [
          {
            email: user.email,
            phone: user.phone_number,
            username: user.username,
          },
        ],
        message: 'User found successfully',
      });
    });
  }

  /**
   * POST /resend
   */
  static resendTokenPost(request: any, response: any) {
    UserModel.findOne({ $or: [{ id: Number(request.params.id) }, { email: request.params.id }] }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      if (user.isVerified)
        return response.sendFile(path.join(__dirname + '/views/already-verified.html'));

      // Create a verification token, save it, and send email
      var token = new EmailTokenMakerForSignUp({
        _userId: user.id,
        email_confirm_token: crypto.randomBytes(16).toString('hex'),
      });
      // Save the token
      token.save(function(err) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }

        var result = {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          email: user.email,
        };

        var result2 = {
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          email: user.email,
        };

        UserService.newUserMail(
          request,
          response,
          result2,
          '/views/templates/signup-verification.html',
          token.email_confirm_token,
          200,
        );

        const jwtToken = TokenGenerator.generateToken(result);
        return response.status(200).json({
          status: 200,
          data: [
            {
              token: jwtToken,
              result,
            },
          ],
          message: 'User created successfully',
        });
      });
    });
  }

  static passwordForgot(request: any, response: any) {
    let email = request.body.email;
    UserModel.findOne({ email: email }, function(err: any, user) {
      if (!user)
        return response.status(400).json({ status: 400, msg: 'We were unable to find a user with that email.' });

      // Generate a 6-digit OTP code for mobile-friendly reset
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Clean old tokens then save new one
      ForgotPasswordToken.deleteMany({ email_to_reset: email })
        .then(() => {
          const ForgotModelToken = new ForgotPasswordToken({
            _userId: user.id,
            email_confirm_token: otpCode,
            email_to_reset: email,
          });

          ForgotModelToken.save(function(saveErr: any) {
            if (saveErr) {
              return response.status(500).json({ status: 500, msg: saveErr.message });
            }

            // Send OTP via SendGrid reset-password template
            UserService.passwordResetsMail(
              request,
              response,
              user.email,
              '/views/templates/reset-password.html',
              { username: user.username },
              otpCode,
            );

            return response.status(200).json({
              status: 200,
              msg: 'Password reset code sent to your email',
              status_text: 'ok',
            });
          });
        })
        .catch((deleteErr: any) => {
          console.error('ForgotPassword token cleanup error:', deleteErr);
          return response.status(500).json({ status: 500, msg: 'Server error' });
        });
    });
  }

  static confirmResetPassword(request: any, response: any) {
    return response.sendFile(path.join(__dirname + '/views/pw-reset.html'));
  }

  static changePasswordTriggerMobile(request: any, response: any) {
    const { password, email, code } = request.body;

    if (!email || !password) {
      return response.status(400).json({ status: 400, msg: 'Email and password are required.' });
    }

    // If a code is provided, validate it first
    if (code) {
      ForgotPasswordToken.findOne({ email_to_reset: email, email_confirm_token: code }, function(err: any, token: any) {
        if (!token) {
          return response.status(400).json({ status: 400, msg: 'Invalid or expired reset code.' });
        }

        UserModel.findOne({ email }, function(err: any, user: any) {
          if (!user) return response.status(400).json({ status: 400, msg: 'User not found.' });

          user.password = TokenGenerator.hashPassword(password.trim());
          user.save(function(saveErr: any) {
            if (saveErr) return response.status(500).json({ status: 500, msg: saveErr.message });

            // Clean up used token
            ForgotPasswordToken.deleteMany({ email_to_reset: email }).catch(() => undefined);

            return response.status(200).json({
              status: 200,
              msg: 'Password has been reset successfully.',
              status_text: 'ok',
            });
          });
        });
      });
    } else {
      // Legacy path — no code validation (for backward compat)
      UserModel.findOne({ email }, function(err: any, user: any) {
        if (!user) return response.status(400).json({ status: 400, msg: 'User not found.' });

        user.password = TokenGenerator.hashPassword(password.trim());
        user.save(function(saveErr: any) {
          if (saveErr) return response.status(500).json({ status: 500, msg: saveErr.message });
          return response.status(200).json({
            status: 200,
            msg: 'Password has been reset successfully.',
            status_text: 'ok',
          });
        });
      });
    }
  }

  static setPlanIdForUser(request: any, response: any) {
    let email = request.body.email;
    let plan_id = request.body.plan_id;

    // console.log(request.params.id)

    // Find a matching token

    // If we found a token, find a matching user email: request.body.email
    UserModel.findOne({ email: email }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user for this token.' });
      //if (user.email != token.email_to_reset) return response.status(400).send({ type: 'No Reset Token', msg: 'This user reset token was not set.' });

      // Verify and save the user
      user.plan_id_to_pay = plan_id || 'No plan id';
      user.save(function(err) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        return response.status(200).send({ msg: 'The plan id  has been updated', status: 'ok' });
        //return  response.sendFile(path.join(__dirname + '/pw-reset-success.html'));
      });
    });
  }

  static getPlanIdForUser(request: any, response: any) {
    let email = request.params.id;

    // console.log(request.params.id)

    // Find a matching token

    // If we found a token, find a matching user email: request.body.email
    UserModel.findOne({ email: email }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user for this token.' });
      //if (user.email != token.email_to_reset) return response.status(400).send({ type: 'No Reset Token', msg: 'This user reset token was not set.' });

      // Verify and save the user
      let plan_id = user.plan_id_to_pay || 'No plan id';
      user.save(function(err) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        return response.status(200).send({ plan_id: plan_id, status: 'ok' });
        //return  response.sendFile(path.join(__dirname + '/pw-reset-success.html'));
      });
    });
  }

  static walletUpgradeViaMobile(request: any, response: any) {
    let balance = request.body.accountBalance;
    let email = request.body.email;
    let { reference, amount, customer, metadata, phone_number } = request.body;

    // console.log(request.params.id)

    // Find a matching token

    // If we found a token, find a matching user email: request.body.email
    UserModel.findOne({ email: email }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user for this token.' });
      //if (user.email != token.email_to_reset) return response.status(400).send({ type: 'No Reset Token', msg: 'This user reset token was not set.' });

      // Verify and save the user
      user.balance = balance;
      user.save(function(err) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }

        //add wallet transaction

        const newDonor = {
          id: new String(new Date()),
          reference,
          amount: amount / 100,
          email: customer.email,
          full_name: metadata.full_name,
          phone_number,
        };

        const donor = new WalletModel(newDonor);

        donor.save().then((donor) => {
          if (!donor) {
            return response.status(500).send({ msg: 'Failed to save donor' });
          }
          return response.status(200)
            .send({ msg: 'The account balance has been updated', status: 'ok' });
        }).catch((error) => {
            console.log('error');
            return response.status(500).send({ msg: error.message || error });
        });

        //return  response.sendFile(path.join(__dirname + '/pw-reset-success.html'));
      });
    });
  }

  static changePasswordTrigger(request: any, response: any) {
    let password = request.body.password;
    let confirmPass = request.body.confirmPassword;
    if (password != confirmPass) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password do not match.' });
    }
    // console.log(request.params.id)

    // Find a matching token
    ForgotPasswordToken.findOne({ email_confirm_token: Storage.getItem('hasher') }, function(
      err,
      token,
    ) {
      console.log(token);
      console.log(Storage.getItem('hasher'));
      if (!token) {
        console.log('error here 2');
        console.log('error');
        return response.status(400).send({
          type: 'not-verified',
          msg: 'We were unable to find a valid token. Your token my have expired.',
        });
      }

      // If we found a token, find a matching user email: request.body.email
      UserModel.findOne({ email: token.email_to_reset }, function(err: any, user) {
        if (!user)
          return response.status(400).send({ msg: 'We were unable to find a user for this token.' });
        if (user.email != token.email_to_reset)
          return response.status(400)
            .send({ type: 'No Reset Token', msg: 'This user reset token was not set.' });

        // Verify and save the user
        user.password = TokenGenerator.hashPassword(password.trim());
        user.save(function(err) {
          if (err) {
            return response.status(500).send({ msg: err.message });
          }
          return response.status(200)
            .send({ msg: 'The account password has been reset. Please wait...', status: 'ok' });
          //return  response.sendFile(path.join(__dirname + '/pw-reset-success.html'));
        });
      });
    });
  }

  static showProfile(request: any, response: any) {
    //profile-admin-rights

    UserModel.find({ $or: [{ id: Number(request.params.id) }, { email: request.params.id }] })
      .then((data: any) => {
        console.log('specific profile:' + data);

        const userInfo = data; //related
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
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAsyncRoles = async function(request, response) {
    try {
      const promiseList = await RolesAndPreviledgesModel.findOne({
        for_admins: true,
        previledges_info: request.params.roles,
      }).exec();
      return promiseList;
    } catch (err) {
      return err;
    }
  };

  static getAsyncUsers = async function(request, response) {
    try {
      const promiseList = await RolesAndPreviledgesModel.findOne({
        for_admins: true,
        previledges_info: request.params.roles,
      }).exec();
      return promiseList;
    } catch (err) {
      return err;
    }
  };

  static updateAsyncUserPreviledges = async function(request, response) {
    try {
      const promiseList = await UserModel.find({ _id: request.params.id }).exec();
      return promiseList;
    } catch (err) {
      return err;
    }
  };

  static showProfileRights(request: any, response: any) {
    //profile-admin-rights

    console.log(request.params.roles + 'what we need');

    RolesAndPreviledgesModel.findOne(
      { for_admins: true, previledges_info: request.params.roles },
      function(err: any, roles) {
        if (!roles) {
          return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
        }

        // Verify and save the user
        // user.avatar= avatar || user.avatar;
        roles.status = roles.status;
        roles.view_bookings = roles.view_bookings;
        roles.view_quotations = roles.view_quotations;
        roles.view_transactions = roles.view_transactions;
        roles.view_payments = roles.view_payments;
        roles.view_drivers = roles.view_drivers;
        roles.view_sos = roles.view_sos;
        roles.view_partners = roles.view_partners;
        roles.view_package = roles.view_package;
        roles.view_cars = roles.view_cars;
        roles.view_tickets = roles.view_tickets;
        roles.view_faqs = roles.view_faqs;
        roles.view_users = roles.view_users;
        roles.view_admins = roles.view_admins;
        roles.view_settings = roles.view_settings;

        roles.manage_bookings = roles.manage_bookings;
        roles.manage_quotations = roles.manage_quotations;
        roles.manage_transactions = roles.manage_transactions;
        roles.manage_payments = roles.manage_payments;
        roles.manage_drivers = roles.manage_drivers;
        roles.manage_sos = roles.manage_sos;
        roles.manage_partners = roles.manage_partners;
        roles.manage_package = roles.manage_package;
        roles.manage_cars = roles.manage_cars;
        roles.manage_tickets = roles.manage_tickets;
        roles.manage_faqs = roles.manage_faqs;
        roles.manage_users = roles.manage_users;
        roles.manage_admins = roles.manage_admins;
        roles.manage_settings = roles.manage_settings;

        roles.view_car_inspection = roles.view_car_inspection;
        roles.view_drive_test = roles.view_drive_test;

        roles.manage_drive_test = roles.manage_drive_test;
        roles.manage_car_inspection = roles.manage_car_inspection;

        roles.save(function(err: any, user) {
          if (err) {
            console.log('error');
            return response.status(500).send({ msg: err.message });
          }

          console.log(user);

          //find all users of usch roles and update
          UserModel.find({ roles: request.params.roles }, function(err: any, users) {
            if (!users) {
              return response
                .status(400)
                .send({ msg: 'We were unable to find a plan with that id.' });
            }

            console.log(roles.view_faqs, roles.view_package, roles.view_drivers);
            UserModel.updateMany(
              { roles: new String(request.params.roles) },
              {
                $set: {
                  view_bookings: roles.view_bookings,
                  view_quotations: roles.view_quotations,
                  view_transactions: roles.view_transactions,
                  view_payments: roles.view_payments,
                  view_drivers: roles.view_drivers,
                  view_sos: roles.view_sos,
                  view_partners: roles.view_partners,
                  view_package: roles.view_package,
                  view_cars: roles.view_cars,
                  view_tickets: roles.view_tickets,
                  view_faqs: roles.view_faqs,
                  view_users: roles.view_users,
                  view_admins: roles.view_admins,
                  view_settings: roles.view_settings,

                  manage_bookings: roles.manage_bookings,
                  manage_quotations: roles.manage_quotations,
                  manage_transactions: roles.manage_transactions,
                  manage_payments: roles.manage_payments,
                  manage_drivers: roles.manage_drivers,
                  manage_sos: roles.manage_sos,
                  manage_partners: roles.manage_partners,
                  manage_package: roles.manage_package,
                  manage_cars: roles.manage_cars,
                  manage_tickets: roles.manage_tickets,
                  manage_faqs: roles.manage_faqs,
                  manage_users: roles.manage_users,
                  manage_admins: roles.manage_admins,
                  manage_settings: roles.manage_settings,

                  view_drive_test: roles.view_drive_test,
                  view_car_inspection: roles.view_car_inspection,
                  manage_drive_test: roles.manage_drive_test,
                  manage_car_inspection: roles.manage_car_inspection,
                },
              },
              { multi: true },

              function(err: any, result) {
                if (err) {
                  console.log('error');
                  response.send(err);
                } else {
                  UserModel.find({ email: request.params.id })
                    .then((data: any) => {
                      console.log('specific profile:' + data);

                      const userInfo = data; //related
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
                    .catch((err: any) =>
                      response.status(400).json({
                        status: 400,
                        error: ErrorHandler.errors().validationError,
                      }),
                    );
                }
              },
            );
          });
        });
      },
    );
  }

  static getUserPreviledges(request: any, response: any) {
    const query = request.params.id.includes('@') 
      ? { email: request.params.id } 
      : { _id: request.params.id };

    UserModel.findOne(query)
      .then((user: any) => {
        if (!user) {
          return response.status(404).json({
            status: 404,
            error: 'User not found',
          });
        }

        // Fetch the detailed role definition
        RolesAndPreviledgesModel.findOne({ previledges_info: user.roles })
          .then(role => {
            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: user.id,
                  username: user.username,
                  roles: user.roles,
                  permissions: role || {
                    view_transactions: user.view_transactions,
                    view_quotations: user.view_quotations,
                    manage_payments: user.manage_payments
                  },
                  message: 'Successful',
                },
              ],
            });
          });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static assignRoleToUser(request: any, response: any) {
    const { user_email, role_name } = request.body;
    
    RolesAndPreviledgesModel.findOne({ previledges_info: role_name })
      .then(role => {
        if (!role) {
          return response.status(404).json({ status: 404, error: 'Role definition not found' });
        }

        const updateData = {
          roles: role.previledges_info,
          view_transactions: role.view_transactions,
          view_quotations: role.view_quotations,
          view_cars: role.view_cars,
          view_drivers: role.view_drivers,
          view_partners: role.view_partners,
          view_sos: role.view_sos,
          view_package: role.view_package,
          view_bookings: role.view_bookings,
          view_tickets: role.view_tickets,
          view_faqs: role.view_faqs,
          view_settings: role.view_settings,
          view_users: role.view_users,
          view_admins: role.view_admins,
          manage_payments: role.manage_payments,
          manage_transactions: role.manage_transactions,
          manage_quotations: role.manage_quotations,
          manage_cars: role.manage_cars,
          manage_drivers: role.manage_drivers,
          manage_partners: role.manage_partners,
          manage_sos: role.manage_sos,
          manage_package: role.manage_package,
          manage_bookings: role.manage_bookings,
          manage_tickets: role.manage_tickets,
          manage_faqs: role.manage_faqs,
          manage_settings: role.manage_settings,
          manage_users: role.manage_users,
          manage_admins: role.manage_admins
        };

        UserModel.findOneAndUpdate({ email: user_email }, updateData, { new: true })
          .then(updatedUser => {
            if (!updatedUser) return response.status(404).json({ status: 404, error: 'User not found' });
            return response.status(200).json({
              status: 200,
              data: [{ user: updatedUser, message: 'Role and permissions assigned successfully' }]
            });
          });
      })
      .catch(error => response.status(400).json({ status: 400, error: 'Assignment failed' }));
  }

  static setOldBalance(request: any, response: any) {
    const { old_balance, currentBalance } = request.body;

    UserModel.findOne({ email: request.params.id }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      user.old_balance = old_balance || user.old_balance;
      user.balance = currentBalance || user.balance;
      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static updateProfile(request: any, response: any) {
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
      use_coins_augmentation,
      use_coins_for_commissions,
    } = request.body;

    if (password.length && passwordConfirm.length) {
      if (password != passwordConfirm) {
        console.log('err here1');
        return response.status(400).send({ msg: 'password do not match.' });
      }
    }

    UserModel.findOne({ email: request.params.id }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      if (password == 'unchanged' && passwordConfirm == 'unchanged') {
        user.password = user.password;
        console.log('old:' + user.password);
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
        console.log('new pass: ' + user.password);
      }

      
      // Verify and save the user
      user.avatar = avatar || user.avatar;
      user.username = username || user.username;
      user.email = email || user.email;

      user.roles = user_type || user.user_type;
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone_number = phoneNumber || user.phone_number;
      if (typeof use_coins_augmentation !== 'undefined') user.use_coins_augmentation = use_coins_augmentation;
      if (typeof use_coins_for_commissions !== 'undefined') user.use_coins_for_commissions = use_coins_for_commissions;
      user.test_certificate = certificate || user.test_certificate;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  // static loginWithTwitter(request,response){
  //   //return UserService.loginWithTwitter(request,response)
  // }

  // static loginWithFaceBook(request,response){
  //  //return UserService.loginWithFaceBook(request,response)
  // }

  // static loginWithGoogle(request,response){
  //  //return UserService.loginWithGoogle(request,response)
  // }

  static initializeGoogleLogin(request: any, response: any) {
    return passport.authenticate('google', { scope: ['profile', 'email'] })(request, response);
  }

  static testEmail(request: any, response: any) {
    return response.status(200).json({ message: 'Email service is functional' });
  }

  static getUserCars(request: any, response: any) {
    return CarsService.usersSelectedCars(request, response);
  }

  static manageTechSupport(request: any, response: any) {
    return response.status(200).json({ message: 'Tech support management stub' });
  }

  static addNewPlans(request: any, response: any) {
    let {
      plan_id,
      itineraries,
      user_id,
      carsSelected,
      planName,
      price,
      planCategoryName,
      no_hours,
      username,
      email,
    } = request.body;

    const NewUserPlan = new UserPlanModel({
      id: AutoincrementId(UserPlanModel).counter(),
      user_id,
      price,
      plan_category_name: planCategoryName,
      plan_name: planName,
      cars_on_plan: carsSelected,
      itineries: itineraries,
      duration: no_hours,
      no_hours: no_hours,
      username: username,
      email: email,
      plan_id,
    });

    NewUserPlan.save()
      .then((data: any) => {
        const user = data;
        console.log(user + 'plans');

        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
            },
          ],
          message: 'User Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here user plan');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });

    // UserService.saveUsersItinerary(request,response);
  }

  static deleteItinerary(request: any, response: any) {
    ItineraryModel.find({ plan_id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        ItineraryModel.remove({ plan_id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static saveUsersItinerary(request: any, response: any) {
    // console.log(request.body)

    let {
      plan_category,
      start_location,
      destination,
      drive_option,
      no_hours,

      plan_name,
      status,
      start_time,
      travel_option,
      drivingschool,
      username,
      email,
      phone_number,
      plan_id,
    } = request.body;

    const NewItinerary = new ItineraryModel({
      id: AutoincrementId(ItineraryModel).counter(),
      plan_category,
      start_location,
      destination,
      drivingschool,
      user_id: request.user.id,
      username,
      email,
      phone_number,
      plan_id,
    });

    NewItinerary.save()
      .then((data: any) => {
        const user = data;
        const result = {
          plan_category: user.plan_category,
          start_location: user.start_location,
          destination: user.destination,
          drive_option: user.drive_option,
          no_hours: user.no_hours,
          travel_option: user.travel_option,
          plan_name,
          status,
          start_time,
          drivingschool,
          username: user.username,
          email: user.email,
          // cars_id: user.cars_id
        };

        return response.status(201).json({
          status: 201,
          data: [
            {
              result,
            },
          ],
          message: 'User Itinerary created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static editViewUsersItinerary(request: any, response: any) {
    ItineraryModel.find({ user_id: Number(request.params.id) })
      .then((data: any) => {
        console.log('specific:' + data);

        const userInfo = data; //related
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
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateUsersPlanItineraryStatus(request: any, response: any) {
    UserPlanModel.find({ id: Number(request.params.id) })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;

        UserPlanModel.updateOne(
          { id: Number(request.params.id) },
          {
            status: status,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateNotificationStatus(request: any, response: any) {
    NotificationModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                id: '0',
                message: 'Data not found',
              },
            ],
          });
        }
        const { status } = request.body;

        NotificationModel.updateOne(
          { _id: request.params.id },
          {
            status: 'old',
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateItineraryStatus(request: any, response: any) {
    ItineraryModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;

        ItineraryModel.updateOne(
          { _id: request.params.id },
          {
            status: status,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateDriverRatings(request: any, response: any) {
    UserModel.find({ email: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        let totalAvg = 0;
        const { ratings } = request.body;
        if (!parseInt((redId[0] as any).ratings_average, 10)) {
          totalAvg = parseInt((redId[0] as any).ratings_average, 10) + parseInt(ratings, 10);
        } else {
          totalAvg = parseInt((redId[0] as any).ratings_average, 10) + parseInt(ratings, 10);
        }

        totalAvg = totalAvg / 2;

        UserModel.updateOne(
          { email: request.params.id },
          {
            ratings_average: totalAvg,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateUserItineraryStatus(request: any, response: any) {
    ItineraryModel.find({ id: Number(request.params.id) })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;

        ItineraryModel.updateOne(
          { id: Number(request.params.id) },
          {
            status: status,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateUsersItinerary(request: any, response: any) {
    const {
      certificate_id,
      start_location,
      destination,
      no_hours,
      start_time,
      end_time,
      drive_option,
      user_id,
      travel_option,
      cars_id,
    } = request.body;

    ItineraryModel.findOne({ user_id: request.params.id }, function(err: any, user) {
      if (!user)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      
      // Verify and save the user

      user.certificate_id = certificate_id;
      user.start_location = start_location;
      user.destination = destination;
      user.no_hours = no_hours;
      user.start_time = start_time;
      user.end_time = end_time;
      user.drive_option = drive_option;
      user.user_id = user_id;
      user.travel_option = travel_option;
      user.cars_id = cars_id;
      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response.status(200).send({ success: 'ok', msg: 'successfully updated itinerary.' });
      });
    });
  }

  static individualPlans(request: any, response: any) {
    IndividualPlanModel.find()

      .then((data: any) => {
        const individualPlans = data;
        console.log(data);
        if (individualPlans.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'No Plans for IndividualPlan module has been recorded by admin',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              individualPlans,
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static coperatePlans(request: any, response: any) {
    coperatePlanModel
      .find()

      .then((data: any) => {
        const coperatePlan = data;
        console.log(data);
        if (coperatePlan.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'No Plans for CoperatePlan module has been recorded by admin',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              coperatePlan,
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateItem(request: any, response: any) {
    const {
      certificate_id,
      start_location,
      destination,
      no_hours,
      start_time,
      end_time,
      drive_option,
      user_id,
      travel_option,
    } = request.body;

    ItineraryModel.findOne({ id: request.params.id }, function(err: any, user) {
      if (!user) {
        console.log(JSON.stringify(err));
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }

      // Verify and save the user

      user.certificate_id = certificate_id;
      user.start_location = start_location;
      user.destination = destination;
      user.no_hours = no_hours;
      user.start_time = start_time;
      user.end_time = end_time;
      user.drive_option = drive_option;
      user.user_id = user_id;
      user.travel_option = travel_option;

      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response.status(200).send({ success: 'ok', msg: 'successfully updated itinerary.' });
      });
    });
  }

  static deleteItem(request: any, response: any) {
    UserPlanModel.find({ id: request.params.id })
      .then((data: any) => {
        const redflags = data;

        if (redflags.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The red-flag with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The red-flag with the given id does not exists',
          });
        }
        UserPlanModel.deleteOne({ id: request.params.id })
          .then((data: any) => {
            const deletedRedFlag = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedRedFlag._id,
                  message: 'red-flag record has been deleted',
                },
              ],
            });
          })
          .catch(error =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllItineries(request: any, response: any) {
    ItineraryModel.find()

      .then((data: any) => {
        const itinerary = data;
        console.log(data + 'either empty itins');
        if (itinerary.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no itinerary record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              itinerary,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getUsersItinerary(request: any, response: any) {
    ItineraryModel.find({ email: request.params.id })

      .then((data: any) => {
        const itinerary = data;
        if (itinerary.length === 0) {
          return response.status(200).json({
            status: 200,
            error: 'User has no itinerary record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              itinerary,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static updateRedFlagStatus(request: any, response: any) {
    InterventionsModel.find({ id: Number(request.params.id) })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;
        if (Number(request.user.id)) {
          InterventionsModel.updateOne(
            { id: Number(request.params.id) },
            {
              status: status,
            },
          )
            .then((data: any) => {
              const redflagStatus = data;

              return response.status(200).json({
                status: 200,
                data: [
                  {
                    id: redflagStatus._id,
                    message: 'Updated red-flag record’s status',
                  },
                ],
              });
            })
            .catch((err: any) =>
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              }),
            );
        } else {
          return response.status(401).json({
            status: 401,
            error: 'You must signup or login to access this route',
          });
        }
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllUsersPlans(request: any, response: any) {
    UserPlanModel.find({ email: request.params.id })
      .then((data: any) => {
        const plans = data;
        console.log(plans);
        // if (plans.length === 0) {
        //   return response.status(404).json({
        //     status: 404,
        //     error: 'User has no plans record',
        //   });
        // }
        return response.status(200).json({
          status: 200,
          data: [
            {
              plans,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllUsersQuotations(request: any, response: any) {
    QuoteModel.find({ plan_id: new String(request.params.id) })

      .then((data: any) => {
        const quote = data;
        if (quote.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no plans record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              quote,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static debitWallet(request: any, response: any) {
    const { oldBalance, debit_amount } = request.body;

    UserModel.findOne({ email: request.params.id }, function(err: any, user) {
      let bal = Number(user.balance) - Number(debit_amount);
      user.balance = new String(bal);

      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }

        console.log(user);
        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated  .' });
      });
    });
  }

  static updatePlanStatus(request: any, response: any) {
    const { status, amount, has_updated } = request.body;

    UserPlanModel.findOne({ plan_id: new String(request.params.id) }, function(err: any, user) {
      // Verify and save the user
      user.status = status || user.status;

      user.price = amount || user.price;

      user.has_updated = has_updated || user.has_updated;

      let userItins = user.itineries;

      // userItins.map((item) =>{
      //    item.status = status;
      // } )

      // user.itineries = userItins;

      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }

        UserPlanModel.updateMany(
          { plan_id: request.params.id },
          {
            $set: {
              status: status,
              price: amount,
              has_updated: has_updated,
              'itineries.$[].status': status,
            },
          },
          { multi: true },
          function(err: any, result) {
            if (err) {
              console.log('error');
              response.send(err);
            } else {
              console.log(result);
              return response.status(200).send({
                status: 200,
                success: 'ok',
                msg: 'Successfully updated itineraries of this plan .',
              });
            }
          },
        );

        // return response.status(200).send({status: 200 ,success:'ok', msg: 'Successfully updated  .' });
      });
    });
  }

  static updateItinStatus(request: any, response: any) {
    const {
      status,
      //plan_id,
      user_plan_id,
      has_received_payments,
      has_received_quote,
    } = request.body;

    // ItineraryModel.findOne({ plan_id:new String(request.params.id) }, function (err, user) {

    //    // Verify and save the user
    //    user.status= status || user.status;

    //    user.save(function (err,user) {
    //      if (err) { return response.status(500).send({ msg: err.message }); }
    //      console.log(user + 'hello')

    //        return response.status(200).send({status: 200 ,success:'ok', msg: 'Successfully updated  .' });
    //    });
    //  });

    ItineraryModel.updateMany(
      { plan_id: new String(request.params.id) },
      {
        $set: {
          status: status,
          //plan_id,
          user_plan_id: new String(request.params.id),
          has_received_payments: has_received_payments,
          has_received_quote: has_received_quote,
        },
      },
      { multi: true },
      function(err: any, result) {
        if (err) {
          console.log('error');
          response.send(err);
        } else {
          console.log(result);
          return response.status(200).send({
            status: 200,
            success: 'ok',
            msg: 'Successfully updated itineraries of this plan .',
          });
        }
      },
    );
  }

  static updateQuoteStatus(request: any, response: any) {
    const { status, amount, has_updated } = request.body;

    QuoteModel.findOne({ plan_id: new String(request.params.id) }, function(err: any, user) {
      // Verify and save the user
      user.status = status || user.status;

      user.amount = amount || user.amount;
      user.has_updated = has_updated || user.has_updated;

      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');

        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated  .' });
      });
    });
  }

  static getOnePlanById(request: any, response: any) {
    UserPlanModel.find({ id: Number(request.params.id) })
      .then((data: any) => {
        console.log('specific:' + data);

        const userPlanInfo = data; //related
        if (userPlanInfo.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The user plan with the given id does not exists',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              userPlanInfo,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static paystackPayMeMoney(request: any, response: any) {
    const {
      fullname,
      email,
      amount,
      phone_number,
      //old_balance
    } = request.body;
    console.log(fullname, email, amount);
    //const form = _.pick(request.body,['amount','email','full_name']);

    const form: any = {
      fullname,
      email,
      amount,
      phone_number,
    };
    form.metadata = {
      full_name: form.fullname,
    };
    form.amount *= 100;

    initializePayment(form, (error, body) => {
      console.log(body);
      if (error) {
        //handle errors
        console.log('error');
        return response.redirect('/error');
      }
      var response = JSON.parse(body);

      let url = response.data.authorization_url;

      //response.redirect(url)
      //console.log(url)
      //response.send(`${url}`)

      return response.status(201).json({
        status: 201,
        message: `<h6>Please click the link to make payments.<a style="color:red;text-decoration:none"  href="${url}">Proceed to payment</a></h6> 
            `,
      });
    });
  }

  static async initiatePayment(request: any, response: any) {
    const { gateway } = request.params;
    const { amount, email, metadata } = request.body;
    try {
      const data = await MultiPaymentService.initiatePayment(gateway, amount, email, metadata);
      return response.status(200).json({
        status: 200,
        data: data
      });
    } catch (err: any) {
      return response.status(err.status || 500).json({
        status: err.status || 500,
        error: err.message
      });
    }
  }

  static async verifyPayment(request: any, response: any) {
    const { gateway, reference } = request.params;
    try {
      const isSuccess = await MultiPaymentService.verifyPayment(gateway, reference);
      return response.status(200).json({
        status: 200,
        success: isSuccess
      });
    } catch (err: any) {
      return response.status(err.status || 500).json({
        status: err.status || 500,
        error: err.message
      });
    }
  }

  static paystackCallBack(request: any, response: any) {
    const { reference, trxref } = request.query;
    //console.log(request.query)
    const ref = reference;
    verifyPayment(ref, (error, body) => {
      if (error) {
        //handle errors appropriately
        console.log('error');
        return response.redirect('/error');
      }

      var response = JSON.parse(body);
      console.log(JSON.stringify(response.data) + 'given here');

      const { id, reference, amount, customer, metadata, phone_number } = response.data;
      console.log(id, reference, amount, customer, phone_number, customer.phone);

      const newDonor = {
        id: new String(id),
        reference,
        amount: amount / 100,
        email: customer.email,
        full_name: metadata.full_name,
        phone_number,
      };

      const donor = new WalletModel(newDonor);

      donor
        .save()
        .then((donor: any) => {
          if (!donor) {
            console.log('error');
            return response.redirect('/api/v1/error');
          }

          UserModel.findOne({ email: customer.email }, function(err: any, user) {
            if (!user)
              return response.status(400)
                .send({ msg: 'We were unable to find a user with that email.' });
            let convertedBal = Number(amount) / 100;
            user.balance = Number(user.balance) + convertedBal;
            user.save(function(err: any, user) {
              if (err) {
                return response.status(500).send({ msg: err.message });
              }
              //console.log(user + 'hello')
              //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
              response.redirect('/api/v1/receipt/' + donor._id);
            });
          });
        })
        .catch((e: any) => {
          console.log(e);
          response.redirect('/api/v1/error');
        });
    });
  }

  static createPaymentDetail(request: any, response: any) {
    // var PaymentModel = mongoose.model('PaymentModel', User);

    let {
      status,
      reference,
      plan_id,
      quotation_id,
      amount,
      username,
      email,
      phone_number,
    } = request.body;

    // var user = new PaymentModel({
    //   id: AutoincrementId(PaymentModel).counter(),
    //     status:'Paid',
    //             reference,
    //             plan_id,
    //             quotation_id,
    //             amount,
    //             username,
    //             email,
    //             phone_number,

    //  })

    const NewItinerary = new PaymentModel({
      id: AutoincrementId(PaymentModel).counter(),
      status: 'Successful',
      reference,
      plan_id,
      quotation_id,
      amount,
      username,
      email,
      phone_number,
    });

    NewItinerary.save()
      .then((data: any) => {
        const user = data;
        const result = {
          reference,
          plan_id,
          quotation_id,
          amount,
          username,
          phone_number,
          // cars_id: user.cars_id
        };

        return response.status(201).json({
          status: 201,
          data: [
            {
              result,
            },
          ],
          message: 'User Itinerary created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static paystackReceipt(request: any, response: any) {
    const id = new String(request.params.id);
    WalletModel.findById(id)
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
          response.redirect('/api/v1/error');
        }

        // response.render('success.pug',{donor});
        return response.sendFile(path.join(__dirname + '/views/templates/topup-successful.html'));
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect('/api/v1/error');
      });
  }

  static paystackHistory(request: any, response: any) {
    const id = new String(request.params.id);
    WalletModel.find({ email: request.params.id })
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
          response.redirect('/api/v1/error');
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect('/api/v1/error');
      });
  }

  static paystackPayments(request: any, response: any) {
    const id = new String(request.params.id);
    PaymentModel.find({ email: request.params.id })
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
          response.redirect('/api/v1/error');
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect('/api/v1/error');
      });
  }

  static paystackQuotations(request: any, response: any) {
    const id = new String(request.params.id);
    QuoteModel.find({ email: request.params.id })
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
          response.redirect(BACKEND_API + '/error');
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static deleteQuotation(request: any, response: any) {
    QuoteModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        QuoteModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deletePayment(request: any, response: any) {
    PaymentModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        PaymentModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteWallet(request: any, response: any) {
    WalletModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        WalletModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static getUserNotification(request: any, response: any) {
    const id = new String(request.params.id);
    console.log(id);
    NotificationModel.find({ user_id: request.params.id, for_users: true })
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static makeNotification(request: any, response: any) {
    // console.log(request.body)
    let { user_id, type, description } = request.body;
    let for_users = true;

    if (request.body.for_users) {
      for_users = false;
    }

    const NewNotificationModel = new NotificationModel({
      id: AutoincrementId(NotificationModel).counter(),
      user_id,
      type,
      description,
      for_users,

      //accountNumber: uuidv4()
    });

    NewNotificationModel.save()
      .then((data: any) => {
        const user = data;

        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
              message: 'Get a specific user plan was successful',
            },
          ],
        });

        // UserService.NotificationEmail(request,response,'/views/templates/notification.html', {
        //          username: user_id,
        //          detail: description
        // },user_id,201)
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static getAllNotification(request: any, response: any) {
    var now = new Date();
    var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    //created_at: {$gte: startOfToday}
    NotificationModel.find({ for_users: true }, null, { sort: { field: -1 } })
      .then((donor: any) => {
        if (!donor) {
          //handle error when the donor is not found
          console.log('error');
        }
        const allNotification = donor;
        //console.log(tranx +"for the user")
        return response.status(200).json({
          status: 200,
          data: [
            {
              allNotification,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  createUserPlan = (request: any, response: any) => {
    const review = new UserPlanModel() as any;
    review.username = request.body.username;
    review.rating = request.body.rating;
    review.body = request.body.body;
    review
      .save()
      .then(result => {
        UserModel.findOne({ username: review.username }, (err, user) => {
          if (user) {
            // The below two lines will add the newly saved review's
            // ObjectID to the the User's reviews array field
            user.reviews.push(review);
            user.save();
            response.json({ message: 'Review created!' });
          }
        });
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  };

  createUser = (request: any, response: any) => {
    const user = new UserModel();
    user.username = request.body.password;
    user.email = request.body.email;
    user
      .save()
      .then(result => {
        response.json({ message: 'User created!', result });
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  };

  // . . .
  // returns the user object associated with the username if any
  // with the reviews field containing an array of review objects
  // consisting of the reviews created by the user
  getUser = (request: any, response: any) => {
    UserModel.findOne({ username: request.params.username })
      //.populate('reviews')
      .then(result => {
        response.json(result);
      })
      .catch(error => {
        response.status(500).json({ error });
      });
  };

  //Admin functionality

  static async adminDashboard(request: any, response: any) {
    try {
      const [userCount, driverCount, bookingCount, totalRev] = await Promise.all([
        UserModel.countDocuments({ is_admin: false }),
        DriverModel.countDocuments(),
        RideModel.countDocuments(),
        PaymentModel.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }])
      ]);

      return response.status(200).json({
        status: 200,
        data: [{
          users: userCount,
          drivers: driverCount,
          bookings: bookingCount,
          revenue: totalRev[0]?.total || 0,
          message: 'Dashboard counters retrieved successfully'
        }]
      });
    } catch (err) {
      return response.status(500).json({ status: 500, error: 'Failed to fetch dashboard stats' });
    }
  }

  static async getAnalytics(request: any, response: any) {
    try {
      const { period = '7days' } = request.query;
      let days = period === '30days' ? 30 : 7;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const [traction, income, successRate] = await Promise.all([
        // Traction (Signups over time)
        UserModel.aggregate([
          { $match: { created_at: { $gte: startDate } } },
          { $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            count: { $sum: 1 }
          }},
          { $sort: { "_id": 1 } }
        ]),
        // Income (Payments over time)
        PaymentModel.aggregate([
          { $match: { created_at: { $gte: startDate } } },
          { $group: { 
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
            total: { $sum: "$amount" }
          }},
          { $sort: { "_id": 1 } }
        ]),
        // Success Rate (Completed vs Total)
        RideModel.aggregate([
          { $match: { created_at: { $gte: startDate } } },
          { $group: {
            _id: "$status",
            count: { $sum: 1 }
          }}
        ])
      ]);

      return response.status(200).json({
        status: 200,
        data: {
          traction,
          income,
          successRate,
          period
        }
      });
    } catch (err) {
      return response.status(500).json({ status: 500, error: 'Analytics generation failed' });
    }
  }

  static manageUsers(request: any, response: any) {
    const { page = 1, limit = 10, username, email } = request.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = { is_admin: false, roles: 'user' };
    if (username) query.username = { $regex: username, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };

    UserModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })
      .then(async (data: any) => {
        const users = data;
        const total = await UserModel.countDocuments(query);
        return response.status(200).json({
          status: 200,
          data: [
            {
              users,
              pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
              },
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static deleteUser(request: any, response: any) {
    UserModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        UserModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewUser(request: any, response: any) {
    let boolVerification;
    let {
      firstname,
      lastname,
      username,
      email,
      password,
      passwordComfirm,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      status,
      is_verified,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    password = TokenGenerator.hashPassword(password.trim());

    const Newuser = new UserModel({
      id: AutoincrementId(UserModel).counter(),
      firstname,
      lastname,
      username,
      email,
      password,

      phone_number: phoneNumber,
      avatar: avatar,
      certificate,
      user_type,
      status: 'Active',
      is_admin: false,
      isVerified: boolVerification,
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };

        const token = TokenGenerator.generateToken(result);
        return response.status(201).json({
          status: 201,
          data: [
            {
              token,
              user,
            },
          ],
          message: 'User created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageUsersDetail(request: any, response: any) {
    let boolVerification;
    const {
      firstname,
      lastname,
      username,
      password,
      phoneNumber,
      certificate,
      user_type,
      email,
      status,
      avatar,
      is_verified,
    } = request.body;

    console.log(is_verified + ':our user verification');

    if (is_verified == 'false') {
      boolVerification = false;
    } else if (is_verified == 'true') {
      boolVerification = true;
    }

    if (!password.length) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password do not match.' });
    }

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      if (password == 'unchanged') {
        user.password = user.password;
        console.log('old:' + user.password);
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
        console.log('new pass: ' + user.password);
      }

      // Verify and save the user

      user.username = username || user.username;
      user.email = email || user.email;
      user.status = status || user.status;
      user.avatar = avatar || user.avatar;
      user.user_type = user_type || user.user_type;
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone_number = phoneNumber || user.phone_number;
      user.test_certificate = certificate || user.test_certificate;
      //user.isVerified = boolVerification || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageUsersDetailVerification(request: any, response: any) {
    const { isVerified } = request.body;

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      user.isVerified = isVerified || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageAdmins(request: any, response: any) {
    UserModel.find({ is_admin: true })
      .then((data: any) => {
        const admins = data;
        console.log(admins + 'admins available here admins');
        if (admins.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                admins: [],

                message: 'Successful',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              admins,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteAdmin(request: any, response: any) {
    UserModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        UserModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewAdmin(request: any, response: any) {
    let boolVerification;
    let {
      firstname,
      lastname,
      username,
      email,
      password,
      passwordComfirm,
      phoneNumber,
      avatar,
      //certificate,
      user_type,
      status,
      is_verified,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    password = TokenGenerator.hashPassword(password.trim());

    RolesAndPreviledgesModel.findOne({ for_admins: true, usergroup_set: user_type }, function(
      err,
      roles,
    ) {
      if (!roles) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }
      console.log(roles);

      const Newuser = new UserModel({
        id: AutoincrementId(UserModel).counter(),
        firstname,
        lastname,
        username,
        email,
        password,

        phone_number: phoneNumber,
        avatar: avatar,
        //certificate,
        roles: user_type,
        status: 'Active',
        is_admin: true,
        isVerified: boolVerification,
        view_bookings: roles.view_bookings,
        view_quotations: roles.view_quotations,
        view_transactions: roles.view_transactions,
        view_payments: roles.view_payments,
        view_drivers: roles.view_drivers,
        view_sos: roles.view_sos,
        view_partners: roles.view_partners,
        view_package: roles.view_package,
        view_cars: roles.view_cars,
        view_tickets: roles.view_tickets,
        view_faqs: roles.view_faqs,
        view_users: roles.view_users,
        view_admins: roles.view_admins,
        view_settings: roles.view_settings,
        manage_bookings: roles.manage_bookings,
        manage_quotations: roles.manage_quotations,
        manage_transactions: roles.manage_transactions,
        manage_payments: roles.manage_payments,
        manage_drivers: roles.manage_drivers,
        manage_sos: roles.manage_sos,
        manage_partners: roles.manage_partners,
        manage_package: roles.manage_package,
        manage_cars: roles.manage_cars,
        manage_tickets: roles.manage_tickets,
        manage_faqs: roles.manage_faqs,
        manage_users: roles.manage_users,
        manage_admins: roles.manage_admins,
        manage_settings: roles.manage_settings,

        view_drive_test: roles.view_drive_test,
        manage_drive_test: roles.manage_drive_test,
        view_car_inspection: roles.view_car_inspection,
        manage_car_inspection: roles.manage_car_inspection,
      });

      Newuser.save()
        .then((data: any) => {
          const user = data;

          const result = {
            id: user.id,
            email: user.email,
            username: user.username,
          };

          const token = TokenGenerator.generateToken(result);
          console.log(user);
          return response.status(201).json({
            status: 201,
            data: [
              {
                token,
                user,
              },
            ],
            message: 'User created successfully',
          });
        })
        .catch((err: any) => {
          console.log(err + 'error here');
          response.status(400).json({
            status: 400,
            error: ErrorHandler.errors().validationError,
          });
        });
    });
  }

  static manageAdminsDetail(request: any, response: any) {
    let boolVerification;

    const {
      firstname,
      lastname,
      username,
      password,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      email,
      status,
      is_verified,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    if (!password.length) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password do not match.' });
    }

    RolesAndPreviledgesModel.findOne({ for_admins: true, usergroup_set: user_type }, function(
      err,
      roles,
    ) {
      if (!roles) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }
      console.log(roles);

      UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
        if (!user) {
          return response
            .status(400)
            .send({ msg: 'We were unable to find a user with that email.' });
        }
        if (password == 'unchanged') {
          user.password = user.password;
          console.log('old:' + user.password);
        } else {
          user.password = TokenGenerator.hashPassword(password.trim());
          console.log('new pass: ' + user.password);
        }

        // Verify and save the user

        user.username = username || user.username;
        user.email = email || user.email;
        user.status = status || user.status;
        user.avatar = avatar || user.avatar;
        user.roles = user_type || user.user_type;
        user.firstname = firstname || user.firstname;
        user.lastname = lastname || user.lastname;
        user.phone_number = phoneNumber || user.phone_number;
        user.test_certificate = certificate || user.test_certificate;
        //user.isVerified = boolVerification || user.isVerified;

        user.view_bookings = roles.view_bookings;
        user.view_quotations = roles.view_quotations;
        user.view_transactions = roles.view_transactions;
        user.view_payments = roles.view_payments;
        user.view_drivers = roles.view_drivers;
        user.view_sos = roles.view_sos;
        user.view_partners = roles.view_partners;
        user.view_package = roles.view_package;
        user.view_cars = roles.view_cars;
        user.view_tickets = roles.view_tickets;
        user.view_faqs = roles.view_faqs;
        user.view_users = roles.view_users;
        user.view_admins = roles.view_admins;
        user.view_settings = roles.view_settings;

        user.manage_bookings = roles.manage_bookings;
        user.manage_quotations = roles.manage_quotations;
        user.manage_transactions = roles.manage_transactions;
        user.manage_payments = roles.manage_payments;
        user.manage_drivers = roles.manage_drivers;
        user.manage_sos = roles.manage_sos;
        user.manage_partners = roles.manage_partners;
        user.manage_package = roles.manage_package;
        user.manage_cars = roles.manage_cars;
        user.manage_tickets = roles.manage_tickets;
        user.manage_faqs = roles.manage_faqs;
        user.manage_users = roles.manage_users;
        user.manage_admins = roles.manage_admins;
        user.manage_settings = roles.manage_settings;

        user.view_drive_test = roles.view_drive_test;
        user.manage_drive_test = roles.manage_drive_test;
        user.view_car_inspection = roles.view_car_inspection;
        user.manage_car_inspection = roles.manage_car_inspection;

        user.save(function(err: any, user) {
          if (err) {
            console.log('error');
            return response.status(500).send({ msg: err.message });
          }
          console.log(user + 'hello');
          //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
          return response
            .status(200)
            .send({ success: 'ok', msg: 'Successfully updated user profile.' });
        });
      });
    });
  }

  static manageAdminsDetailVerification(request: any, response: any) {
    const { isVerified } = request.body;

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      user.isVerified = isVerified || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageDrivers(request: any, response: any) {
    const { page = 1, limit = 10, status } = request.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = { roles: 'driver' }; // Changed from 'Individual Driver' to 'driver' to match dummy data/typical roles
    if (status) query.status = status;

    UserModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })
      .then(async (data: any) => {
        const drivers = data;
        const total = await UserModel.countDocuments(query);
        return response.status(200).json({
          status: 200,
          data: [
            {
              drivers,
              pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
              },
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteDriver(request: any, response: any) {
    UserModel.find({ _id: request.params.id, roles: 'Individual Driver' })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        UserModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewDriver(request: any, response: any) {
    let boolVerification;

    let {
      firstname,
      lastname,
      username,
      email,
      password,
      passwordComfirm,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      status,
      is_verified,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    password = TokenGenerator.hashPassword(password.trim());

    const Newuser = new UserModel({
      id: AutoincrementId(UserModel).counter(),
      firstname,
      lastname,
      username,
      email,
      password,

      phone_number: phoneNumber,
      avatar,
      test_certificate: certificate,

      status: 'Active',
      is_admin: false,
      isVerified: boolVerification,
      roles: 'Individual Driver',
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };

        const token = TokenGenerator.generateToken(result);
        return response.status(201).json({
          status: 201,
          data: [
            {
              token,
              user,
            },
          ],
          message: 'User created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageDriversDetail(request: any, response: any) {
    let boolVerification;

    const {
      firstname,
      lastname,
      username,
      password,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      email,
      status,
      is_verified,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    if (!password.length) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password do not match.' });
    }

    UserModel.findOne({ _id: request.params.id, roles: 'Individual Driver' }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      if (password == 'unchanged') {
        user.password = user.password;
        console.log('old:' + user.password);
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
        console.log('new pass: ' + user.password);
      }

      // Verify and save the user

      user.username = username || user.username;
      user.email = email || user.email;
      user.status = status || user.status;
      user.avatar = avatar || user.avatar;
      user.roles = user_type || user.user_type;
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone_number = phoneNumber || user.phone_number;
      user.test_certificate = certificate || user.test_certificate;
      //user.isVerified = boolVerification || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageDriversDetailVerification(request: any, response: any) {
    const { isVerified } = request.body;

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      user.isVerified = isVerified || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static managePartners(request: any, response: any) {
    const { page = 1, limit = 10, search } = request.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = { roles: 'partner' };
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    PartnersModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })
      .then(async (data: any) => {
        const partners = data;
        const total = await PartnersModel.countDocuments(query);
        return response.status(200).json({
          status: 200,
          data: [
            {
              partners,
              pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
              },
              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static deletePartner(request: any, response: any) {
    PartnersModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        PartnersModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewPartner(request: any, response: any) {
    let boolVerification;
    let address = '';
    if (request.body.address) {
      address = request.body.address;
    }
    let {
      firstname,
      lastname,
      username,
      email,

      password,
      // passwordComfirm,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      status,
      is_verified,
      totalCars,
      bankAccount,
      bankAccountName,
      bankAccountNumber,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    password = TokenGenerator.hashPassword(password.trim());

    const Newuser = new PartnersModel({
      id: AutoincrementId(PartnersModel).counter(),
      firstName: firstname,
      lastName: lastname,
      userName: username,
      name: firstname + ' ' + lastname,
      email,
      password,
      address: address,
      totalCars,

      phoneNumber: phoneNumber,
      phone: phoneNumber,
      avatar,
      businessName: certificate,
      roles: user_type,
      status: status,
      isVerified: boolVerification,

      bankAccount,
      bankAccountName,
      bankAccountNumber,
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };

        const token = TokenGenerator.generateToken(result);
        return response.status(201).json({
          status: 201,
          data: [
            {
              token,
              user,
            },
          ],
          message: 'User created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static managePartnersDetail(request: any, response: any) {
    let boolVerification;
    const {
      firstname,
      lastname,
      username,
      password,
      totalCars,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      email,
      address,
      status,
      is_verified,

      bankAccount,
      bankAccountName,
      bankAccountNumber,
    } = request.body;

    if (is_verified == 'false') {
      boolVerification = false;
    } else {
      boolVerification = true;
    }

    if (!password) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password field required' });
    }

    PartnersModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (err) {
        return response.status(400).send({ msg: 'Some error occured.' });
      }

      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }

      if (password === 'unchanged') {
        user.password = user.password;
        console.log('old:' + password + '==' + user.password);
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
        console.log('new pass: ' + password + '==' + user.password);
      }

      // Verify and save the user
      user.avatar = avatar || user.avatar;
      user.userName = username || user.userName;
      user.email = email || user.email;
      user.businessName = certificate || user.businessName;
      user.roles = user_type || user.roles;
      user.firstName = firstname || user.firstName;
      user.lastName = lastname || user.lastName;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.status = status || user.status;
      user.address = address || user.address;
      user.totalCars = totalCars || user.totalCars;
      user.bankAccount = bankAccount || user.bankAccount;
      user.bankAccountName = bankAccountName || user.bankAccountName;
      user.bankAccountNumber = bankAccountNumber || user.bankAccountNumber;
      //user.isVerified = boolVerification || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static managePartnersDetailVerification(request: any, response: any) {
    const { isVerified } = request.body;

    PartnersModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      user.isVerified = isVerified || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  //partners earnings
  static managePartnersEarnings(request: any, response: any) {
    EarningsModel.find()
      .then((data: any) => {
        const earnings = data;
        //console.log(partners +"partners available")
        if (earnings.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                earnings: [],

                message: 'Successful',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              earnings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static deletePartnersEarnings(request: any, response: any) {
    EarningsModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        EarningsModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewPartnersEarnings(request: any, response: any) {
    let {
      paymentDate,
      PaymentStatus,
      PaymentAmount,
      paymentReference,
      partnerId,
      partnerEmail,
      partnerBankAccount,
      vehicleId,
      vehicleName,
      vehiclePlateNo,
    } = request.body;

    let pid = partnerId;

    const Newuser = new EarningsModel({
      id: AutoincrementId(EarningsModel).counter(),

      paymentDate,
      PaymentStatus,
      PaymentAmount,
      paymentReference,
      partnerId,
      partnerEmail,
      partnerBankAccount,
      vehicleId,
      vehicleName,
      vehiclePlateNo,
      partner: pid,
    });

    Newuser.save()
      .then((data: any) => {
        const user = data;
        const result = {
          id: user.id,
          email: user.email,
          username: user.username,
        };

        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
            },
          ],
          message: 'User created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static managePartnersEarningsDetail(request: any, response: any) {
    const {
      type,
      paymentDate,
      PaymentStatus,
      PaymentAmount,
      paymentReference,
      partnerId,
      partnerEmail,
      partnerBankAccount,
      vehicleId,
      vehicleName,
      vehiclePlateNo,
    } = request.body;

    let pid = partnerId;

    EarningsModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (err) {
        return response.status(400).send({ msg: 'Some error occured.' });
      }

      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }

      // Verify and save the user
      user.type = type || user.type;
      user.paymentDate = paymentDate || user.paymentDate;
      user.paymentStatus = PaymentStatus || user.PaymentStatus;
      user.paymentAmount = PaymentAmount || user.PaymentAmount;
      user.paymentReference = paymentReference || user.paymentReference;
      user.partnerId = partnerId || user.partnerId;
      user.partnerEmail = partnerEmail || user.partnerEmail;
      user.partnerBankAccount = partnerBankAccount || user.partnerBankAccount;
      user.vehicleId = vehicleId || user.vehicleId;
      user.vehicleName = vehicleName || user.vehicleName;
      user.vehiclePlateNo = vehiclePlateNo || user.vehiclePlateNo;
      user.partner = partnerId || user.partnerId;

      //user.isVerified = boolVerification || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageProfile(request: any, response: any) {
    UserModel.find({ email: request.params.id })
      .then((data: any) => {
        console.log('specific profile:' + data);

        const profile = data; //related
        if (profile.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              profile,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch((err: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageProfileDetail(request: any, response: any) {
    let boolVerification;
    const {
      firstname,
      lastname,
      username,
      password,
      // passwordConfirm,
      phoneNumber,
      avatar,
      certificate,
      user_type,
      email,
      //status,
      is_verified,
    } = request.body;

    if (!password.length) {
      console.log('err here1');
      return response.status(400).send({ msg: 'password do not match.' });
    }

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }

      if (password == 'unchanged') {
        user.password = user.password;
        console.log('old:' + user.password);
      } else {
        user.password = TokenGenerator.hashPassword(password.trim());
        console.log('new pass: ' + user.password);
      }

      // Verify and save the user
      user.avatar = avatar || user.avatar;
      user.username = username || user.username;
      user.email = email || user.email;

      user.roles = user_type || user.user_type;
      user.firstname = firstname || user.firstname;
      user.lastname = lastname || user.lastname;
      user.phone_number = phoneNumber || user.phone_number;
      user.test_certificate = certificate || user.test_certificate;
      //user.status = status || user.status;
      //user.isVerified = boolVerification || user.isVerified
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static manageProfileDetailVerification(request: any, response: any) {
    const { isVerified } = request.body;

    UserModel.findOne({ _id: request.params.id }, function(err: any, user) {
      if (!user) {
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });
      }
      user.isVerified = isVerified || user.isVerified;
      user.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static managePlanPackage(request: any, response: any) {
    IndividualPlanModel.find()
      .then((data: any) => {
        const individualPlans = data;

        console.log(individualPlans + 'individual available plans');
        if (individualPlans.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                individualPlans: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              individualPlans,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static managePlanPackageCorporate(request: any, response: any) {
    coperatePlanModel
      .find()
      .then((data: any) => {
        const corporatePlans = data;

        console.log(corporatePlans + 'coperatePlans available plans');
        if (corporatePlans.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                corporatePlans: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              corporatePlans,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static deletePlanPackage(request: any, response: any) {
    console.log(request.params + 'soloewe');
    if (request.params.delete_type == 'Individual') {
      IndividualPlanModel.find({ _id: request.params.id })
        .then((data: any) => {
          const user = data;

          if (user.length <= 0) {
            console.log(
              JSON.stringify({
                status: 404,
                error: 'The user with the given id does not exists',
              }),
            );
            return response.status(404).json({
              status: 404,
              error: 'The user with the given id does not exists',
            });
          }

          IndividualPlanModel.remove({ _id: request.params.id })
            .then((data: any) => {
              const deletedUser = data;
              response.status(202).json({
                status: 202,
                data: [
                  {
                    id: deletedUser._id,
                    message: 'user record has been deleted',
                  },
                ],
              });
            })
            .catch(error => {
              console.log('error');
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              });
            });
        })
        .catch(error => {
          console.log('error');
          response.status(400).json({
            status: 400,
            error: ErrorHandler.errors().validationError,
          });
        });
    } else if (request.params.delete_type == 'Corporate') {
      coperatePlanModel
        .find({ _id: request.params.id })
        .then((data: any) => {
          const user = data;

          if (user.length <= 0) {
            console.log(
              JSON.stringify({
                status: 404,
                error: 'The user with the given id does not exists',
              }),
            );
            return response.status(404).json({
              status: 404,
              error: 'The user with the given id does not exists',
            });
          }

          coperatePlanModel
            .remove({ _id: request.params.id })
            .then((data: any) => {
              const deletedUser = data;
              response.status(202).json({
                status: 202,
                data: [
                  {
                    id: deletedUser._id,
                    message: 'user record has been deleted',
                  },
                ],
              });
            })
            .catch(error => {
              console.log('error');
              response.status(400).json({
                status: 400,
                error: ErrorHandler.errors().validationError,
              });
            });
        })
        .catch(error => {
          console.log('error');
          response.status(400).json({
            status: 400,
            error: ErrorHandler.errors().validationError,
          });
        });
    }
  }

  static createNewPlan(request: any, response: any) {
    let { plan_name, plan_categories, status, description, max_car, price } = request.body;

    let Newuser;
    let plan;

    if (plan_categories === 'Individual') {
      Newuser = new IndividualPlanModel({
        id: AutoincrementId(IndividualPlanModel).counter(),
        plan_name,
        plan_categories,
        status,
        description,
        car_max: max_car,
        price,
      });

      Newuser.save()
        .then((data: any) => {
          plan = data;

          return response.status(201).json({
            status: 201,
            data: [
              {
                plan,
              },
            ],
            message: 'Plan created successfully',
          });
        })
        .catch((err: any) => {
          console.log(err + 'error here');
          response.status(400).json({
            status: 400,
            error: ErrorHandler.errors().validationError,
          });
        });
    } else {
      Newuser = new coperatePlanModel({
        id: AutoincrementId(coperatePlanModel).counter(),
        plan_name,
        plan_categories,
        status,
        description,
        car_max: max_car,
        price,
      });

      Newuser.save()
        .then((data: any) => {
          plan = data;

          return response.status(201).json({
            status: 201,
            data: [
              {
                plan,
              },
            ],
            message: 'Plan created successfully',
          });
        })
        .catch((err: any) => {
          console.log(err + 'error here');
          response.status(400).json({
            status: 400,
            error: ErrorHandler.errors().validationError,
          });
        });
    }
  }

  static managePlanPackageDetail(request: any, response: any) {
    const { plan_name, plan_categories, description, max_car, price, status } = request.body;

    console.log(plan_name + 'is here 2');

    if (plan_name == 'Individual') {
      console.log(plan_name + 'is here');
      IndividualPlanModel.findOne({ _id: request.params.id }, function(err: any, plan) {
        if (!plan) {
          return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
        }

        // Verify and save the user
        // user.avatar= avatar || user.avatar;
        plan.plan_name = plan_name || plan.plan_name;
        plan.plan_categories = plan_categories || plan.plan_categories;

        plan.price = price || plan.price;
        plan.description = description || plan.description;
        plan.car_max = max_car || plan.car_max;
        plan.status = status || plan.status;
        plan.save(function(err: any, user) {
          if (err) {
            console.log('error');
            return response.status(500).send({ msg: err.message });
          }
          return response
            .status(200)
            .send({ success: 'ok', msg: 'Successfully updated user profile.' });
        });
      });
    } else {
      coperatePlanModel.findOne({ _id: request.params.id }, function(err: any, plan) {
        if (!plan) {
          return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
        }

        plan.plan_name = plan_name || plan.plan_name;
        plan.plan_categories = plan_categories || plan.plan_categories;

        plan.price = price || plan.price;
        plan.description = description || plan.description;
        plan.car_max = max_car || plan.car_max;
        plan.status = status || plan.status;
        plan.save(function(err: any, user) {
          if (err) {
            console.log('error');
            return response.status(500).send({ msg: err.message });
          }
          console.log(plan + 'hello');
          //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
          return response
            .status(200)
            .send({ success: 'ok', msg: 'Successfully updated user profile.' });
        });
      });
    }
  }

  static manageInspection(request: any, response: any) {
    CarsModel.find({ health_status: { $ne: 'Completed' } })
      .then((data: any) => {
        const inspections = data;

        console.log(inspections);

        if (inspections.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                inspections: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              inspections,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageInspectionDetail(request: any, response: any) {
    const {
      health_status,
      confirmedInspectionDate,
      confirmedInspectionTime,
      partnerEmail,
      // description,
      //  username, email,
      //  time, createdDate,
      //  phone_number
    } = request.body;

    CarsModel.findOne({ _id: request.params.id }, function(err: any, plan) {
      if (!plan) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }

      plan.health_status = health_status || plan.health_status;
      plan.confirmedInspectionTime = confirmedInspectionTime || plan.confirmedInspectionTime;
      plan.confirmedInspectionDate = confirmedInspectionDate || plan.confirmedInspectionDate;

      let date = plan.confirmedInspectionDate;
      let time = plan.confirmedInspectionTime;

      console.log(confirmedInspectionTime, plan.confirmedInspectionDate);
      if (plan.status == 'Pending') {
        plan.status = 'Available';
      }
      // plan.username= username || plan.username;
      // plan.email= email || plan.email;
      // plan.time = time || plan.time;
      // plan.createdDate = createdDate || plan.createdDate;
      // plan.phone_number = phone_number ||  plan.phone_number
      plan.save(function(err: any, user) {
        if (err) {
          console.log('error');

          return response.status(500).send({ msg: err.message });
        }

        //send email to partner

        UserService.NotificationEmail(
          request,
          response,
          '/views/templates/inspection_confirmation.html',
          {
            username: partnerEmail,
            confirmedInspectionDate: date,
            confirmedInspectionTime: time,
            link: process.env.DEPLOY_FRONT_URL,
          },
          partnerEmail,
          200,
        );

        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static createNewInspection(request: any, response: any) {
    const {
      username,
      email,
      phone_number,
      description,
      createdDate,
      time,
      status,
      car_id,
    } = request.body;

    let Newuser;
    let plan;

    Newuser = new InspectionModel({
      id: AutoincrementId(InspectionModel).counter(),
      username,
      email,
      phone_number,
      description,
      createdDate,
      time,
      status,
      car_id,
    });

    Newuser.save()
      .then((data: any) => {
        plan = data;

        return response.status(201).json({
          status: 201,
          data: [
            {
              plan,
            },
          ],
          message: 'Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteInspection(request: any, response: any) {
    InspectionModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        InspectionModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageDriveTest(request: any, response: any) {
    DriveTestModel.find()
      .then((data: any) => {
        const testDrive = data;

        console.log(testDrive + 'coperatePlans available plans');
        if (testDrive.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                testDrive: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              testDrive,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static addDriveTestFromItinerary(request: any, response: any) {
    const {
      username,
      email,
      phone_number,
      car_id,
      status,
      description,

      createdDate,
    } = request.body;

    let Newuser;
    let plan;

    Newuser = new DriveTestModel({
      id: AutoincrementId(DriveTestModel).counter(),
      username,
      email,
      phone_number,
      car_id,
      status: 'Pending',
      description,
      createdDate,
    });

    Newuser.save()
      .then((data: any) => {
        plan = data;

        return response.status(201).json({
          status: 201,
          data: [
            {
              plan,
            },
          ],
          message: 'Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewDriveTest(request: any, response: any) {
    const {
      username,
      email,
      phone_number,
      description,
      createdDate,
      time,
      status,
      car_id,
    } = request.body;

    let Newuser;
    let plan;

    Newuser = new DriveTestModel({
      id: AutoincrementId(DriveTestModel).counter(),
      username,
      email,
      phone_number,
      description,
      createdDate,
      time,
      test_center: time,

      status,
      car_id,
    });

    Newuser.save()
      .then((data: any) => {
        plan = data;

        return response.status(201).json({
          status: 201,
          data: [
            {
              plan,
            },
          ],
          message: 'Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageUsersDriveTestCenterUpdate(request: any, response: any) {
    const { test_center, test_center_address } = request.body;
    UserModel.findOne({ _id: request.params.id }, function(err: any, plan) {
      if (!plan) {
        return response.status(400).send({ msg: 'We were unable to find a user with that id.' });
      }

      // Verify and save the user
      // user.avatar= avatar || user.avatar;
      // plan.plan_name= plan_name || plan.plan_name;
      // plan.plan_categories= plan_categories || plan.plan_categories;

      // plan.price= price || plan.price;
      // plan.description= description || plan.description;
      // plan.car_max = max_car || plan.car_max;
      plan.test_center = test_center || plan.test_center;
      plan.test_center_address = test_center_address || plan.test_center_address;
      plan.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated .' });
      });
    });
  }

  static manageDriveTestDetail(request: any, response: any) {
    const {
      // username,
      //  email,
      //  phone_number,
      //  description,
      //  createdDate,
      //  time,
      status,
      // car_id,
    } = request.body;
    DriveTestModel.findOne({ _id: request.params.id }, function(err: any, plan) {
      if (!plan) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }

      // Verify and save the user
      // user.avatar= avatar || user.avatar;
      // plan.plan_name= plan_name || plan.plan_name;
      // plan.plan_categories= plan_categories || plan.plan_categories;

      // plan.price= price || plan.price;
      // plan.description= description || plan.description;
      // plan.car_max = max_car || plan.car_max;
      plan.status = status || plan.status;
      plan.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated .' });
      });
    });
  }

  static deleteDriveTest(request: any, response: any) {
    DriveTestModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        DriveTestModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static managePreviledges(request: any, response: any) {
    // import DriveTestModel from  "../models/DriveTest.model";
    // import Previledges from "../models/Roles.model";
    RolesAndPreviledgesModel.find()
      .then((data: any) => {
        const users = data;

        if (users.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                previledges: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              previledges: users,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static createNewPreviledges(request: any, response: any) {
    const { previledges_description, previledges_info, usergroups_old } = request.body;

    let Newuser;
    let plan;

    Newuser = new RolesAndPreviledgesModel({
      id: AutoincrementId(RolesAndPreviledgesModel).counter(),
      previledges_description,
      previledges_info,
    });

    Newuser.save()
      .then((data: any) => {
        plan = data;

        RolesAndPreviledgesModel.find({ for_admins: true }, function(err: any, users) {
          if (!users) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }

          let usergroup = [...usergroups_old, previledges_info];

          RolesAndPreviledgesModel.updateMany(
            { for_admins: true },
            { $set: { usergroup_set: usergroup } },
            { multi: true },
            function(err: any, result) {
              if (err) {
                console.log('error');
                response.send(err);
              } else {
                UserModel.find({ for_users: true }, function(err: any, users) {
                  if (!users) {
                    return response
                      .status(400)
                      .send({ msg: 'We were unable to find a plan with that id.' });
                  }

                  UserModel.updateMany(
                    { for_users: true },
                    { $set: { usergroup_set: usergroup } },
                    { multi: true },
                    function(err: any, result) {
                      if (err) {
                        console.log('error');
                        response.send(err);
                      } else {
                        return response.status(201).json({
                          status: 201,
                          data: [
                            {
                              success: 'ok',
                              result,
                            },
                          ],
                          message: 'Updated all users with fields and status changed',
                        });
                      }
                    },
                  );
                });
              }
            },
          );
        });

        // return response.status(201).json({
        //   status: 201,
        //   data: [
        //     {

        //       plan,
        //     },
        //   ],
        //   message: 'Plan created successfully',
        // });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });

    //find all users of usch roles and update
  }

  static adminPreviledgesEdit(request: any, response: any) {
    const {
      view_bookings,
      view_quotations,
      view_transactions,
      view_payments,
      view_drivers,
      view_sos,
      view_partners,
      view_package,
      view_cars,
      previledges_info,
      view_tickets,
      view_faqs,
      view_users,
      view_admins,
      view_settings,
      view_car_inspection,
      view_drive_test,

      status,

      manage_bookings,
      manage_quotations,
      manage_payments,
      manage_drivers,
      manage_sos,
      manage_partners,
      manage_package,
      manage_transactions,
      manage_cars,
      manage_tickets,
      manage_faqs,
      manage_settings,
      manage_users,
      manage_admins,
      manage_drive_test,
      manage_car_inspection,
    } = request.body;

    RolesAndPreviledgesModel.findOne({ _id: new String(request.params.id) }, function(err: any, roles) {
      if (!roles) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }

      // Verify and save the user
      // user.avatar= avatar || user.avatar;
      roles.status = status || roles.status;
      roles.view_bookings = view_bookings || roles.view_bookings;
      roles.view_quotations = view_quotations || roles.view_quotations;
      roles.view_transactions = view_transactions || roles.view_transactions;
      roles.view_payments = view_payments || roles.view_payments;
      roles.view_drivers = view_drivers || roles.view_drivers;
      roles.view_sos = view_sos || roles.view_sos;
      roles.view_partners = view_partners || roles.view_partners;
      roles.view_package = view_package || roles.view_package;
      roles.view_cars = view_cars || roles.view_cars;
      roles.view_tickets = view_tickets || roles.view_tickets;
      roles.view_faqs = view_faqs || roles.view_faqs;
      roles.view_users = view_users || roles.view_users;
      roles.view_admins = view_admins || roles.view_admins;
      roles.view_settings = view_settings || roles.view_settings;

      roles.view_drive_test = view_drive_test || roles.view_drive_test;
      roles.view_car_inspection = view_car_inspection || roles.view_car_inspection;

      roles.manage_bookings = manage_bookings || roles.manage_bookings;
      roles.manage_quotations = manage_quotations || roles.manage_quotations;
      roles.manage_transactions = manage_transactions || roles.manage_transactions;
      roles.manage_payments = manage_payments || roles.manage_payments;
      roles.manage_drivers = manage_drivers || roles.manage_drivers;
      roles.manage_sos = manage_sos || roles.manage_sos;
      roles.manage_partners = manage_partners || roles.manage_partners;
      roles.manage_package = manage_package || roles.manage_package;
      roles.manage_cars = manage_cars || roles.manage_cars;
      roles.manage_tickets = manage_tickets || roles.manage_tickets;
      roles.manage_faqs = manage_faqs || roles.manage_faqs;
      roles.manage_users = manage_users || roles.manage_users;
      roles.manage_admins = manage_admins || roles.manage_admins;
      roles.manage_settings = manage_settings || roles.manage_settings;

      roles.manage_drive_test = manage_drive_test || roles.manage_drive_test;
      roles.manage_car_inspection = manage_car_inspection || roles.manage_car_inspection;

      roles.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }

        console.log(user);

        //find all users of usch roles and update
        UserModel.find({ roles: previledges_info }, function(err: any, users) {
          if (!users) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }

          UserModel.updateMany(
            { roles: previledges_info },
            {
              $set: {
                view_bookings,
                view_quotations,
                view_transactions,
                view_payments,
                view_drivers,
                view_sos,
                view_partners,
                view_package,
                view_cars,
                view_tickets,
                view_faqs,
                view_users,
                view_admins,
                view_settings,
                status,

                manage_bookings,
                manage_quotations,
                manage_payments,
                manage_drivers,
                manage_sos,
                manage_partners,
                manage_package,
                manage_transactions,
                manage_cars,
                manage_tickets,
                manage_faqs,
                manage_settings,
                manage_users,
                manage_admins,

                view_car_inspection,
                view_drive_test,
                manage_drive_test,
                manage_car_inspection,
              },
            },
            { multi: true },

            function(err: any, result) {
              if (err) {
                console.log('error');
                response.send(err);
              } else {
                return response.status(200).json({
                  status: 200,
                  data: [
                    {
                      success: 'ok',
                      result,
                    },
                  ],
                  message: 'Updated all users with fields and status changed',
                });
              }
            },
          );
        });
      });
    });
  }

  static managePreviledgesDetail(request: any, response: any) {
    const { previledges_description, previledges_info } = request.body;
    RolesAndPreviledgesModel.findOne({ _id: request.params.id }, function(err: any, plan) {
      if (!plan) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }

      // Verify and save the user
      // user.avatar= avatar || user.avatar;
      plan.previledges_info = previledges_info || plan.previledges_info;
      plan.previledges_description = previledges_description || plan.previledges_description;

      plan.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }

        //find all users of usch roles and update
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static managePreviledgesRulesDetail(request: any, response: any) {
    const { field, value } = request.body;
    UserModel.findOne({ _id: request.params.id }, function(err: any, plan) {
      if (!plan) {
        return response.status(400).send({ msg: 'We were unable to find a plan with that id.' });
      }

      // Verify and save the user
      // user.avatar= avatar || user.avatar;
      plan[field] = value || plan[field];

      plan.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }
        return response
          .status(200)
          .send({ success: 'ok', msg: 'Successfully updated user roles andd permission profile.' });
      });
    });
  }

  static deletePreviledges(request: any, response: any) {
    //if(request.params.delete_type=="Individual"){

    RolesAndPreviledgesModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        RolesAndPreviledgesModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });

    //}
  }

  static manageSOS(request: any, response: any) {
    SOSModel.find()
      .then((data: any) => {
        let redFlag = data;
        console.log(redFlag, 'SOS VALUES');
        if (redFlag.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                redFlag: [],
                message: 'No SOS found',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              redFlag,
              message: 'All sos/redflags was retrieved successfully',
            },
          ],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageSOSDetail(request: any, response: any) {
    SOSModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;

        SOSModel.updateOne(
          { _id: request.params.id },
          {
            status: status,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteSOS(request: any, response: any) {
    SOSModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        SOSModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static deleteTicket(request: any, response: any) {
    InterventionsModel.find({ _id: request.params.id })
      .then((data: any) => {
        const user = data;

        if (user.length <= 0) {
          console.log(
            JSON.stringify({
              status: 404,
              error: 'The user with the given id does not exists',
            }),
          );
          return response.status(404).json({
            status: 404,
            error: 'The user with the given id does not exists',
          });
        }

        InterventionsModel.remove({ _id: request.params.id })
          .then((data: any) => {
            const deletedUser = data;
            response.status(202).json({
              status: 202,
              data: [
                {
                  id: deletedUser._id,
                  message: 'user record has been deleted',
                },
              ],
            });
          })
          .catch(error => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageTickets(request: any, response: any) {
    InterventionsModel.find()
      .then((data: any) => {
        console.log('all tickets>>>>' + data);
        let intervention = data;
        if (intervention.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                intervention: [],
                message: 'No records yet',
              },
            ],
          });
        }
        //console.log( intervention)
        return response.status(200).json({
          status: 200,
          data: [
            {
              intervention,
              message: 'All interventions was retrieved successfully',
            },
          ],
        });
      })
      .catch((err: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewTicket(request, res) {
    const {
      status,
      subject,
      category,
      response,
      username,
      phone_number,
      email,
      assigned_to,
      comment,
    } = request.body;

    const NewCars = new InterventionsModel({
      id: AutoincrementId(InterventionsModel).counter(),
      status,
      category,
      subject,
      response,
      username,
      phone_number,
      email,
      assigned_to,
      comment,
    });

    NewCars.save()
      .then((data: any) => {
        const Cars = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: Cars.id,
              message: 'Created car record',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageTicketsDetail(request: any, response: any) {
    InterventionsModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const {
          status,
          category,
          response: userResponse,
          username,
          phone_number,
          email,
          assigned_to,
        } = request.body;

        InterventionsModel.updateOne(
          { _id: request.params.id },
          {
            status: status || (redId[0] as any).status,
            category: category || (redId[0] as any).category,
            username: username || (redId[0] as any).username,
            phone_number: phone_number || (redId[0] as any).phone_number,
            email: email || (redId[0] as any).email,
            response: userResponse || (redId[0] as any).response,
            assigned_to: assigned_to || (redId[0] as any).assigned_to,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(201).json({
              status: 201,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) => {
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageUserNotificationCounter(request: any, response: any) {
    UserModel.find({ email: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { notification_count } = request.body;

        UserModel.updateOne(
          { _id: request.params.id },
          {
            notification_count: notification_count || redId[0].notification_count,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated user notification record’s status',
                },
              ],
            });
          })
          .catch((err: any) => {
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error => {
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createNewFAQ(request: any, response: any) {
    const { question, answer, status } = request.body;

    const NewCars = new FAQModel({
      id: AutoincrementId(FAQModel).counter(),
      question,
      answer,
      status,
    });

    NewCars.save()
      .then((data: any) => {
        const Cars = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: Cars.id,
              message: 'Created car record',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageFaqs(request: any, response: any) {
    FAQModel.find()
      .then((data: any) => {
        let faqs = data;
        console.log(faqs, 'faqs');
        if (faqs.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                faqs: [],
                message: 'All faqs was retrieved successfully',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              faqs,
              message: 'All faqs was retrieved successfully',
            },
          ],
        });
      })
      .catch((err: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageFaqsDetail(request: any, response: any) {
    FAQModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { question, answer, status } = request.body;

        FAQModel.updateOne(
          { _id: request.params.id },
          {
            question: question || redId[0].question,
            answer: answer || redId[0].answer,
            status: status || redId[0].status,
          },
        )
          .then((data: any) => {
            const faq = data;

            return response.status(201).json({
              status: 201,
              data: [
                {
                  id: faq.status,
                  message: 'Updated faq record’s detail',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageCars(request: any, response: any) {
    CarsModel.find()
      .then((data: any) => {
        let carsAvailable = data;
        console.log(carsAvailable + 'all cars here');
        if (carsAvailable.length === 0) {

          return response.status(200).json({
            status: 200,
            data: [
              {
                carsAvailable: [],
                message: 'All Cars was retrieved successfully',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              carsAvailable,
              message: 'All Carss was retrieved successfully',
            },
          ],
        });
      })
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageCarsDetail(request: any, response: any) {
    const {
      status,
      health_status,
      car_status,
      car_type,
      car_model,
      description,
      car_year,
      assigned_driver_name,
      assigned_driver_email,
      assigned_driver_phone,
      partner_id,
      inspection_detail,
      plate_number,
      license,
      assigned_driver_id,
      images,
      inspectionDate,
      vehicleIdentificationNumber,

      inspectionTime,
    } = request.body;

    CarsModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { question, answer } = request.body;

        CarsModel.updateOne(
          { _id: request.params.id },
          {
            status: status || (redId[0] as any).status,
            health_status: health_status || (redId[0] as any).health_status,
            car_status: car_status || (redId[0] as any).car_status,
            car_type: car_type || (redId[0] as any).car_type,
            car_model: car_model || (redId[0] as any).car_model,
            description: description || (redId[0] as any).description,
            car_year: car_year || (redId[0] as any).car_year,
            assigned_driver_name: assigned_driver_name || (redId[0] as any).assigned_driver_name,
            assigned_driver_email: assigned_driver_email || (redId[0] as any).assigned_driver_email,
            assigned_driver_phone: assigned_driver_phone || (redId[0] as any).assigned_driver_phone,
            partner_id: partner_id || (redId[0] as any).partner_id,
            inspection_detail: inspection_detail || (redId[0] as any).inspection_detail,
            plate_number: plate_number || (redId[0] as any).plate_number,
            license: license || (redId[0] as any).license,
            assigned_driver_id: assigned_driver_id || (redId[0] as any).assigned_driver_id,
            images: images || (redId[0] as any).images,
            inspectionDate: inspectionDate || (redId[0] as any).inspectionDate,
            vehicleIdentificationNumber:
              vehicleIdentificationNumber || (redId[0] as any).vehicleIdentificationNumber,
            inspectionTime: inspectionTime || (redId[0] as any).inspectionTime,
            //images
          },
        )
          .then((data: any) => {
            const cars = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: cars._id,
                  data: cars,
                  message: 'Updated faq record’s detail',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static createNewCar(request: any, response: any) {
    const {
      status,
      health_status,
      car_status,
      color,
      model,
      car_type,
      car_model,
      description,
      car_year,
      assigned_driver_name,
      assigned_driver_email,
      assigned_driver_phone,
      partner_id,
      inspection_detail,
      plate_number,
      license,
      assigned_driver_id,
      images,
      car,

      carModel,
      vehicleIdentificationNumber,

      carYear,

      vehicleColor,

      plateNo,

      inspectionDate,

      inspectionTime,

      carDescription,

      imagePath,

      creator,

      date_created,
      partnerEmail,
    } = request.body;

    const NewCars = new CarsModel({
      id: AutoincrementId(CarsModel).counter(),
      status,
      health_status,
      car_status,
      color,
      model: car_model,
      car_type,
      car_model,
      description,
      car_year,
      assigned_driver_name,
      assigned_driver_email,
      assigned_driver_phone,
      partner_id,
      inspection_detail,
      plate_number,
      license,
      assigned_driver_id,
      images,
      car,

      carModel,
      vehicleIdentificationNumber,

      carYear,

      vehicleColor,

      plateNo,

      inspectionDate,

      inspectionTime,

      carDescription,

      imagePath,

      creator,

      date_created,
      partnerEmail,
    });

    NewCars.save()
      .then((data: any) => {
        const Cars = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: Cars.id,
              message: 'Created car record',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static getCarsInfo(request: any, response: any) {
    return response.status(200).json({
      status: 200,
      data: [
        {
          carInfo: carsApi,
          message: 'Created car record',
        },
      ],
    });

    // const dataValues = [];
    // fs.createReadStream('cars_api_info.csv')
    //   .pipe(csv())
    //   .on('data', (row) => {
    //     try{
    //       dataValues.push(row)
    //     }catch(e){
    //        return  response.status(400).json({
    //       status: 400,
    //       data: [
    //         {

    //           message: e,
    //         },
    //       ],
    //     });
    //     }
    //     //console.log(row);
    //   })
    //   .on('end', () => {
    //     //console.log('CSV file successfully processed');
    //     //console.log(dataValues)
    //     return   response.status(200).json({
    //       status: 200,
    //       data: [
    //         {
    //           carInfo: dataValues,
    //           message: 'Created car record',
    //         },
    //       ],
    //     });
    //   });
  }

  static manageGoogleSettings(request: any, response: any) {
    GmailSettingModel.find()
      .then((data: any) => {
        const googleSettings = data;
        console.log(googleSettings, 'users available are here');
        if (googleSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              googleSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllRepairs(request: any, response: any) {
    MechModel.find()
      .then((data: any) => {
        const mech = data;
        //console.log(googleSettings,"users available are here")
        if (mech.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                mech: [],

                message: 'Successful',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              mech,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static changeRepairStatus(request: any, response: any) {
    MechModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given red-flag id does not exists',
          });
        }
        const { status } = request.body;

        MechModel.updateOne(
          { _id: request.params.id },
          {
            status: status,
          },
        )
          .then((data: any) => {
            const redflagStatus = data;

            return response.status(201).json({
              status: 201,
              data: [
                {
                  id: redflagStatus._id,
                  message: 'Updated red-flag record’s status',
                },
              ],
            });
          })
          .catch((err: any) => {
            console.log('error');
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            });
          });
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getAllPartnerEarnings(request: any, response: any) {
    EarningsModel.find()
      .then((data: any) => {
        const earnings = data;
        //console.log(googleSettings,"users available are here")
        if (earnings.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                earnings: [],

                message: 'Successful',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              earnings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static createNewPartnerEarnings(request: any, response: any) {
    let mongoose = require('mongoose');

    const {
      paymentDate,
      PaymentStatus,
      PaymentAmount,
      paymentReference,
      partnerId,
      partnerEmail,
      partnerBankAccount,
      vehicleId,
      vehicleName,
      vehiclePlateNo,
    } = request.body;

    const NewEarnings = new EarningsModel({
      id: AutoincrementId(EarningsModel).counter(),
      paymentDate,
      paymentStatus: PaymentStatus,
      paymentAmount: PaymentAmount,
      paymentReference,
      partnerId,
      partnerEmail,
      partnerBankAccount,
      vehicleId: mongoose.Types.ObjectId(vehicleId),
      vehicleName,
      vehiclePlateNo,
      partner: mongoose.Types.ObjectId(partnerId),
      vehicle: mongoose.Types.ObjectId(vehicleId),
      date_created: new Date(),
    });

    NewEarnings.save()
      .then((data: any) => {
        const Earnings = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              id: Earnings.id,
              message: 'Created car record',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log('error');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageFacebookSettings(request: any, response: any) {
    FacebookSettingModel.find()
      .then((data: any) => {
        const facebookSettings = data;
        console.log(facebookSettings, 'facebookSettings available are here');
        if (facebookSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              facebookSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static managePaystackSettings(request: any, response: any) {
    PaystackSettingModel.find()
      .then((data: any) => {
        const paystackSettings = data;
        console.log(paystackSettings, 'paystackSettings available are here');
        if (paystackSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              paystackSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageEmailSettings(request: any, response: any) {
    SendgridEmailSettingModel.find()
      .then((data: any) => {
        const sendgridSettings = data;
        console.log(sendgridSettings, 'sendgridSettings available are here');
        if (sendgridSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              sendgridSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageS3BucketSettings(request: any, response: any) {
    AwsS3Model.find()
      .then((data: any) => {
        const awsSettings = data;
        console.log(awsSettings, 'awsSettings available are here');
        if (awsSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              awsSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageInstagramSettings(request: any, response: any) {
    InstagramSettingModel.find()
      .then((data: any) => {
        const instagramSettings = data;
        console.log(instagramSettings, 'instagramSettings available are here');
        if (instagramSettings.length === 0) {
          return response.status(404).json({
            status: 404,
            error: 'User has no  record',
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              instagramSettings,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageSettingsDetail(request: any, response: any) {
    const {
      test_secret_key,
      test_public_key,
      live_public_key,
      live_secret_key,
      api_mode,
      type,
    } = request.body;

    switch (type) {
      case 'google':
        GmailSettingModel.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }
          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
      case 'aws':
        AwsS3Model.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }

          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
      case 'facebook':
        FacebookSettingModel.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }
          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
      case 'instagram':
        InstagramSettingModel.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }

          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
      case 'paystack':
        PaystackSettingModel.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }
          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
      case 'sendgrid':
        SendgridEmailSettingModel.findOne({ _id: request.params.id }, function(err: any, settings) {
          if (!settings) {
            return response
              .status(400)
              .send({ msg: 'We were unable to find a plan with that id.' });
          }

          settings.test_secret_key = test_secret_key || settings.test_secret_key;
          settings.test_public_key = test_public_key || settings.test_public_key;

          settings.live_secret_key = live_secret_key || settings.live_secret_key;
          settings.live_public_key = live_public_key || settings.live_public_key;
          settings.api_mode = api_mode || settings.api_mode;

          settings.save(function(err: any, user) {
            if (err) {
              console.log('error');
              return response.status(500).send({ msg: err.message });
            }

            //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
            return response
              .status(200)
              .send({ success: 'ok', msg: 'Successfully updated user profile.' });
          });
        });

        break;
    }
  }

  static manageBookings(request: any, response: any) {
    return UserService.manageBookings(request, response);
  }

  static makeQuotation(request: any, response: any) {
    let {
      plan_id,
      price,
      status,
      full_name,
      quotation_id,
      email,
      reference,
      amount,
      createdDateOfQuotation,
      phone_number,
    } = request.body;

    const NewUserPlan = new QuoteModel({
      id: AutoincrementId(QuoteModel).counter(),
      plan_id,
      price,
      status,
      full_name,
      quotation_id,
      email,
      reference,
      amount,
      createdDateOfQuotation,
      phone_number,
    });

    NewUserPlan.save()
      .then((data: any) => {
        const user = data;
        console.log(user + 'plans');

        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
            },
          ],
          message: 'User Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here user plan');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });

    // UserService.saveUsersItinerary(request,response);
  }

  static createNewPlanBooking(request: any, response: any) {
    //   let {
    //    itineraries,
    //   user_id,
    //   carsSelected,
    //   planName,
    //   price,
    //   planCategoryName,
    //   no_hours,
    //   username,
    //   email,
    //   phone_number,
    //   plan_id,
    // } = request.body;

    let {
      plan_id,
      createdDate,
      itineraries,
      user_id,
      carsSelected,
      // plan_name:  plan_name.options[plan_name.selectedIndex].text,   //plan_name.value,
      price,
      // plan_categories: plan_categories,
      status,
      no_hours,
      duration,
      phone_number,
      plan_category, //plan_categories1.value,
      plan_name, //plan_name1.value,

      username,
      email,
      has_been_updated,
    } = request.body;

    const NewUserPlan = new UserPlanModel({
      id: AutoincrementId(UserPlanModel).counter(),
      plan_id,

      createdDateOfQuotation: createdDate,
      itineries: itineraries,
      user_id,
      cars_on_plan: carsSelected,
      // plan_name:  plan_name.options[plan_name.selectedIndex].text,   //plan_name.value,
      price,
      // plan_categories: plan_categories,
      status,
      no_hours,
      duration,
      phone_number,

      plan_category_name: plan_category, //plan_categories1.value,
      plan_name, //plan_name1.value,

      username,
      email,
      has_updated: 'Yes',
    });

    NewUserPlan.save()
      .then((data: any) => {
        const user = data;
        console.log(user + 'plans');

        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
            },
          ],
          message: 'User Plan created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here user plan');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });

    // UserService.saveUsersItinerary(request,response);
  }

  static manageBookingsDetail(request: any, response: any) {
    return UserService.manageBookingsDetail(request, response);
  }

  static manageManualBooking(request: any, response: any) {
    //return  UserService.manageManualBooking(request,response)
  }

  static manageItineraries(request: any, response: any) {
    ItineraryModel.find()
      .then((data: any) => {
        const itineraries = data;
        console.log(data + 'either empty itins');
        if (itineraries.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                itineraries: [],

                message: 'Successful',
              },
            ],
          });
        }
        return response.status(200).json({
          status: 200,
          data: [
            {
              itineraries,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageUsersPlan(request: any, response: any) {
    UserPlanModel.find()
      //.populate('users_collections')
      .then((data: any) => {
        const usersPlan = data;
        console.log(data + 'either empty itins');
        if (usersPlan.length === 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                usersPlan: [],

                message: 'Successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              usersPlan,

              message: 'Successful',
            },
          ],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static createNewItinerary(request: any, response: any) {
    // console.log(request.body)

    let {
      plan_category,
      start_location,
      destination,
      travel_option: drive_option,
      no_hours,
      travel_option,
      plan_name,
      status,
      start_time,

      drivingschool,
      user_id,
      username,
      email,
      phone_number,
      plan_id,
      end_time,
      pickup_time,
      certificate_id,
      certificate_date,
    } = request.body;

    const NewItinerary = new ItineraryModel({
      id: AutoincrementId(ItineraryModel).counter(),
      plan_category,
      start_location,
      destination,
      travel_option: drive_option || travel_option,
      no_hours,
      plan_name,
      status,
      start_time,
      drivingschool,
      user_id,
      username,
      email,
      phone_number,
      plan_id,
      end_time,
      pickup_time,
      certificate_id,
      certificate_date,
    });

    NewItinerary.save()
      .then((data: any) => {
        const user = data;
        const result = {
          plan_category: user.plan_category,
          start_location: user.start_location,
          destination: user.destination,
          drive_option: user.drive_option,
          no_hours: user.no_hours,
          travel_option: user.travel_option,
          plan_name,
          status,
          start_time,
          drivingschool,
          username: user.username,
          email: user.email,
          // cars_id: user.cars_id
        };

        return response.status(201).json({
          status: 201,
          data: [
            {
              result,
            },
          ],
          message: 'User Itinerary created successfully',
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static manageItineraryDetail(request: any, response: any) {
    ItineraryModel.find({ _id: request.params.id })
      .then(redId => {
        if (redId.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'The status with the given itinerary id does not exists',
          });
        }
        const {
          status,
          assigned_driver_id,
          assigned_driver_name,
          assigned_driver_email,
          assigned_driver_phone,
        } = request.body;

        ItineraryModel.updateOne(
          { _id: request.params.id },
          {
            status: status || redId[0].status,
            assigned_driver_id: assigned_driver_id || (redId[0] as any).assigned_driver_id,
            assigned_driver_name: assigned_driver_name || (redId[0] as any).assigned_driver_name,
            assigned_driver_email: assigned_driver_email || (redId[0] as any).assigned_driver_email,
            assigned_driver_phone: assigned_driver_phone || (redId[0] as any).assigned_driver_phone,
          },
        )
          .then((data: any) => {
            const faq = data;

            return response.status(200).json({
              status: 200,
              data: [
                {
                  id: faq._id,
                  message: 'Updated faq record’s detail',
                },
              ],
            });
          })
          .catch((err: any) =>
            response.status(400).json({
              status: 400,
              error: ErrorHandler.errors().validationError,
            }),
          );
      })
      .catch(error =>
        response.status(400).send({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static manageWalletHistory(request: any, response: any) {
    WalletModel.find()
      .then((donor) => {
        if (!donor) {
          //handle error when the donor is not found
          
          response.redirect(BACKEND_API + '/error');
          return;
        }
        const tranx = donor;
        console.log(tranx);
        return response.status(200).json({
          status: 200,
          data: [
            {
              tranx,
              message: 'Get all wallet amount  was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static adminDashboardTodaySales(request: any, response: any) {
    //var now = new Date();
    //var startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // WalletModel.find({createdDate: {$gte: startOfToday}}, function (err, docs) {
    //    if(err){
    //      console.log('error')
    //    }

    //    return response.status(200).json({
    //             status: 200,
    //             data: [
    //               {
    //                 todaySales:docs,
    //                 message: 'Get all wallet amount  was successful',
    //               },
    //             ],
    //       });

    //  });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    PaymentModel.find({ created_at: { $gte: today } }).exec(function(err: any, wallet) {
      if (err) {
        return response.status(400).json({
          status: 400,
          message: 'Get all wallet amount  was successful',
        });
      }

      let totalToday = 0;
      let todaySales_from_account = wallet.map((item, i) => {
        totalToday += item.amount;
      });

      return response.status(200).json({
        status: 200,
        data: [
          {
            todaySales: totalToday,
            message: 'Get all wallet amount  was successful',
          },
        ],
      });
    });
  }

  static adminDashboardYesterdaySales(request: any, response: any) {
    var yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    //var startId = Math.floor(yesterdayStart.getTime() / 1000).toString(16) + "0000000000000000";

    var yesterdayEnd = new Date();
    yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
    yesterdayEnd.setHours(23, 59, 59, 999);

    PaymentModel.find({ createdDate: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } }).exec(
      function(err: any, wallet) {
        if (err) {
          console.log('error');
        }

        let totalYest = 0;
        let todaySales_from_account = wallet.map((item, i) => {
          totalYest += item.amount;
        });

        console.log(totalYest);

        return response.status(200).json({
          status: 200,
          data: [
            {
              yesterdaysSales: totalYest,
              message: 'Get all wallet amount  was successful',
            },
          ],
        });
      },
    );
  }

  static adminDashboardWeeklySales(request: any, response: any) {
    let oneWeekAgo = new Date(new Date().getTime() - 7 * 60 * 60 * 24 * 1000);

    // WalletModel.find({createdDate: {
    //       $gte: oneWeekAgo

    //    }
    //  }, function (err, docs) {

    //     if(err){
    //     console.log('error')
    //   }

    //   return response.status(200).json({
    //            status: 200,
    //            data: [
    //              {
    //                weeklySales:docs,
    //                message: 'Get all wallet amount  was successful',
    //              },
    //            ],
    //      });

    // });

    PaymentModel.find({ createdDate: { $gte: oneWeekAgo } }).exec(function(err: any, wallet) {
      if (err) {
        console.log('error');
      }

      let totalWeek = 0;
      let todaySales_from_account = wallet.map((item, i) => {
        totalWeek += item.amount;
      });

      return response.status(200).json({
        status: 200,
        data: [
          {
            weeklySales: totalWeek,
            message: 'Get all wallet amount  was successful',
          },
        ],
      });
    });
  }

  static adminDashboardMonthlySales(request: any, response: any) {
    const lastMonths = new Date(new Date().getMonth() - 1);
    PaymentModel.find(
      {
        createdDate: {
          $lte: lastMonths,
        },
      },
      function(err: any, docs) {
        if (err) {
          console.log('error');
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              lastMonth: docs,
              message: 'Get all wallet amount  was successful',
            },
          ],
        });
      },
    );
  }

  static adminGetAllUsers(request: any, response: any) {
    const { page = 1, limit = 50, search } = request.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const query: any = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    UserModel.find(query)
      .skip(skip)
      .limit(Number(limit))
      .sort({ created_at: -1 })
      .then(async (users: any) => {
        const total = await UserModel.countDocuments(query);
        return response.status(200).json({
          status: 200,
          data: [{
            users,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            },
            message: 'Successful',
          }],
        });
      })
      .catch(error =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static adminGetAllUsersPlans(request: any, response: any) {}

  static paystackHistoryAdmin(request: any, response: any) {
    const id = new String(request.params.id);
    WalletModel.find()
      .then((donor) => {
        if (!donor) {
          //handle error when the donor is not found
          
          response.redirect(BACKEND_API + '/error');
          return;
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              wallets: tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static paystackPaymentsAdmin(request: any, response: any) {
    const id = new String(request.params.id);
    PaymentModel.find()
      .then((donor) => {
        if (!donor) {
          //handle error when the donor is not found
          
          response.redirect(BACKEND_API + '/error');
          return;
        }
        const tranx = donor;
        console.log(tranx + 'for the user');
        return response.status(200).json({
          status: 200,
          data: [
            {
              payments: tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static paystackQuotationsAdmin(request: any, response: any) {
    const id = new String(request.params.id);
    QuoteModel.find()
      .then((donor) => {
        if (!donor) {
          //handle error when the donor is not found
          
          response.redirect(BACKEND_API + '/error');
          return;
        }
        const tranx = donor;
        console.log(tranx + 'for the user quotations');
        return response.status(200).json({
          status: 200,
          data: [
            {
              quotations: tranx,
              message: 'Get a specific user plan was successful',
            },
          ],
        });
      })
      .catch((e: any) => {
        console.log(e);
        response.redirect(BACKEND_API + '/error');
      });
  }

  static updateUsersPlanStatusAdmin(request: any, response: any) {
    const {
      status,
      payment_status,
      email,
      has_updated,
      plan_id,
      price,
      createdDateOfQuotation,
    } = request.body;

    UserPlanModel.findOne({ plan_id: request.params.id }, function(err: any, user) {
      // Verify and save the user
      user.status = status || user.status;
      user.payment_status = payment_status || user.payment_status;
      user.email = email || user.email;

      user.has_updated = has_updated || user.has_updated;
      user.plan_id = plan_id || user.plan_id;
      user.price = price || user.price;
      user.createdDateOfQuotation = createdDateOfQuotation || user.createdDateOfQuotation;

      user.save(function(err: any, user) {
        if (err) {
          return response.status(500).send({ msg: err.message });
        }
        console.log(user + 'hello');

        UserPlanModel.updateMany(
          { plan_id: request.params.id },
          {
            $set: {
              //status:status,
              'itineries.$[].status': status,
            },
          },
          { multi: true },
          function(err: any, result) {
            if (err) {
              console.log('error');
              response.send(err);
            } else {
              console.log(result);

              if (user.status == 'Unpaid') {
                UserService.NotificationEmail(
                  request,
                  response,
                  '/views/templates/notification.html',
                  {
                    username: user.username,
                    plan_id: user.plan_id,
                    price: user.price,
                    date: createdDateOfQuotation.substring(0, 10),
                    link: process.env.DEPLOY_FRONT_URL,
                    description: 'Payment is required',
                  },
                  user.email,
                  200,
                );
              } else {
                UserService.NotificationEmail(
                  request,
                  response,
                  '/views/templates/notification.html',
                  {
                    username: user.username,
                    plan_id: user.plan_id,
                    price: user.price,
                    date: createdDateOfQuotation.substring(0, 10),
                    link: process.env.DEPLOY_FRONT_URL,
                    description: 'Payment is required',
                  },
                  user.email,
                  200,
                );
              }

              //return response.status(200).send({status: 200 ,success:'ok', msg: 'Successfully updated itineraries of this plan .' });
            }
          },
        );
        //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));
        //return response.status(200).send({status: 200 ,success:'ok', msg: 'Successfully updated  .' });
      });
    });
  }

  static updateItineraryStatusAdmin(request: any, response: any) {
    const { status, user_plan_id, has_received_quote } = request.body;
    let has_received_payments = 'No';
    if (request.body.has_received_payments) {
      has_received_payments = request.body.has_received_payments;
    }

    //multiple updates of the status for this itineraries attached to this plan

    // ItineraryModel.findOne({plan_id: request.params.id}, function (err, user) {

    //   if(err){
    //     console.log('error')
    //   }

    //   // Verify and save the user
    //   user.status= status || user.status;

    //   user.plan_id= request.params.id || user.plan_id;
    //   user.user_plan_id= user_plan_id || user.user_plan_id;

    //   user.save(function (err,user) {
    //     if (err) { return response.status(500).send({ msg: err.message }); }
    //     console.log(user + 'hello')
    //       //return  response.sendFile(path.join(__dirname + '/proceed_tologin.html'));

    ItineraryModel.updateMany(
      { plan_id: user_plan_id },
      {
        $set: {
          status: status,
          user_plan_id: user_plan_id,
          has_received_quote: has_received_quote,
          has_received_payments: has_received_payments,
        },
      },
      { multi: true },
      function(err: any, result) {
        if (err) {
          console.log('error');
          response.send(err);
        } else {
          // console.log(result)
          return response.status(200).send({
            status: 200,
            success: 'ok',
            msg: 'Successfully updated itineraries of this plan .',
          });
        }
      },
    );
  }

  //drivers

  static driverConfirmBooking(request: any, response: any) {
    return response.sendFile(path.join(__dirname + '/driver_confirm.html'));
  }

  static showUserInfo(request: any, response: any) {
    UserModel.find({ email: request.params.id })
      .then((data: any) => {
        console.log('specific profile:' + data);

        const userInfo = data; //related
        if (userInfo.length <= 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                userInfo,
                message: 'Get a specific user was successful',
              },
            ],
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
      .catch((err: any) =>
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        }),
      );
  }

  static getTrails(request: any, response: any) {
    AuditNotificationModel.find({})
      .then((data: any) => {
        console.log('specific profile:' + data);

        const audit = data; //related
        if (audit.length <= 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                audit,
                message: 'Get a specific user was successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              audit,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log(err + '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static createTrail(request: any, response: any) {
    let { date, admin, user, module_name, status, message_type, logMessage, avatar } = request.body;

    const NewAuditTrail = new AuditNotificationModel({
      id: AutoincrementId(AuditNotificationModel).counter(),
      date,
      admin,
      user,
      module_name,
      status,
      message_type,
      logMessage,
      avatar,
    });

    NewAuditTrail.save()
      .then((data: any) => {
        const user = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
              message: 'AUDIT SUCCESSFULLY CREATED',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static revokecar(request: any, response: any) {
    let {
      status,

      date_created,
      retrievalComments,
      vehiclePlateNo,
      vehicleName,
      vehicleID,
      vehicle,
      partner,
      partnerID,
      partnerName,
      partnerEmail,
      retrievalDate,
      hasBeenRevoked,
    } = request.body;

    const RetrievalTrail = new Retrieval({
      id: AutoincrementId(Retrieval).counter(),

      status,

      date_created,
      retrievalComments,
      vehiclePlateNo,
      vehicleName,
      vehicleID,
      vehicle,
      partner,
      partnerID,
      partnerName,
      partnerEmail,
      retrievalDate,
      hasBeenRevoked,
    });

    RetrievalTrail.save()
      .then((data: any) => {
        const user = data;
        return response.status(201).json({
          status: 201,
          data: [
            {
              user,
              message: 'AUDIT SUCCESSFULLY CREATED',
            },
          ],
        });
      })
      .catch((err: any) => {
        console.log(err + 'error here');
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  static revokecarstatus(request: any, response: any) {
    let { car_status, hasBeenRevoked } = request.body;

    CarsModel.findOne({ _id: request.params.id }, function(err: any, car) {
      if (!car)
        return response.status(400).send({ msg: 'We were unable to find a user with that email.' });

      // Verify and save the user
      car.car_status = car_status || car.car_status;
      car.hasBeenRevoked = true || car.hasBeenRevoked;

      car.save(function(err: any, user) {
        if (err) {
          console.log('error');
          return response.status(500).send({ msg: err.message });
        }

        return response
          .status(200)
          .send({ status: 200, success: 'ok', msg: 'Successfully updated user profile.' });
      });
    });
  }

  static getrevokecars(request: any, response: any) {
    Retrieval.find({})
      .then((data: any) => {
        const carsNotInUse = data; //related
        if (carsNotInUse.length <= 0) {
          return response.status(200).json({
            status: 200,
            data: [
              {
                carsNotInUse,
                message: 'Get a specific user was successful',
              },
            ],
          });
        }

        return response.status(200).json({
          status: 200,
          data: [
            {
              carsNotInUse,
              message: 'Get a specific user was successful',
            },
          ],
        });
      })
      .catch((err: any) => {
        response.status(400).json({
          status: 400,
          error: ErrorHandler.errors().validationError,
        });
      });
  }

  /**
   * Aggregates all user activities (Rides, Payments, SOS, Plans) into a unified timeline
   */
  static async getActivityLogs(request: any, response: any) {
    const { id } = request.params; // Generic id (could be user.id or _id depending on client)
    
    try {
      // Find user by either mongoose _id or the custom 'id' field
      const query = /^[0-9a-fA-F]{24}$/.test(id) 
        ? { _id: id } 
        : { id: Number(id) };
      const user = await UserModel.findOne(query);
      if (!user) {
        return response.status(404).json({ status: 404, error: 'User not found' });
      }

      const passengerId = user.id;

      // 1. Fetch Rides
      const rides = await RideModel.find({ passenger_id: passengerId }).sort({ created_at: -1 }).limit(10);
      const rideLogs = rides.map(r => ({
        id: r._id,
        type: 'RIDE',
        title: `Ride to ${r.destination_location.coordinates.join(', ')}`,
        amount: r.fare,
        status: r.status,
        date: r.created_at,
        icon: 'ri-taxi-line'
      }));

      // 2. Fetch Payments
      const payments = await PaymentModel.find({ userId: passengerId }).sort({ createdDate: -1 }).limit(10);
      const paymentLogs = payments.map(p => ({
        id: p._id,
        type: 'PAYMENT',
        title: `Wallet Top-up (${p.reference})`,
        amount: p.amount,
        status: p.status,
        date: p.createdDate,
        icon: 'ri-wallet-3-line'
      }));

      // 3. Fetch SOS Alerts
      const soss = await SOSModel.find({ user_id: passengerId }).sort({ created_at: -1 }).limit(5);
      const sosLogs = soss.map(s => ({
        id: s._id,
        type: 'SECURITY',
        title: `SOS Alert at ${s.location}`,
        amount: 0,
        status: s.status || 'REPORTED',
        date: s.created_at,
        icon: 'ri-alarm-warning-line'
      }));

      // Combine and sort by date
      const allLogs = [...rideLogs, ...paymentLogs, ...sosLogs].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      return response.status(200).json({
        status: 200,
        data: allLogs,
        message: 'Activity logs retrieved successfully'
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Update User's Favorite Saved Places (Home, Work, etc)
   */
  static async updateSavedPlaces(request: any, response: any) {
    const { userId, saved_places } = request.body;
    try {
      const user = await UserModel.findOneAndUpdate(
        { id: userId },
        { $set: { saved_places } },
        { new: true }
      );
      if (!user) return response.status(404).json({ status: 404, message: 'User not found' });
      return response.status(200).json({ status: 200, message: 'Saved places updated', data: user.saved_places });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Update Emergency Contacts for Safety Circle
   */
  static async updateEmergencyContacts(request: any, response: any) {
    const { userId, emergency_contacts } = request.body;
    try {
      const user = await UserModel.findOneAndUpdate(
        { id: userId },
        { $set: { emergency_contacts } },
        { new: true }
      );
      if (!user) return response.status(404).json({ status: 404, message: 'User not found' });
      return response.status(200).json({ status: 200, message: 'Emergency contacts updated', data: user.emergency_contacts });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * Apply referral code during or after registration
   */
  static async applyReferralCode(request: any, response: any) {
    const { userId, code } = request.body;
    try {
      const targetUser = await UserModel.findOne({ id: userId });
      if (!targetUser) return response.status(404).json({ status: 404, message: 'User not found' });
      if (targetUser.referred_by) return response.status(400).json({ status: 400, message: 'Referral already applied' });

      const referrer = await UserModel.findOne({ referral_code: code });
      if (!referrer) return response.status(400).json({ status: 400, message: 'Invalid referral code' });

      targetUser.referred_by = referrer.id.toString();
      await targetUser.save();

      return response.status(200).json({ status: 200, message: 'Referral successfully applied' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * getVoucherByHash — Extract voucher details from an encrypted URL hash
   */
  static async getVoucherByHash(request: any, response: any) {
    const { hash } = request.params;
    try {
      const voucher = await VoucherModel.findOne({ hash, isUsed: false });
      if (!voucher) return response.status(404).json({ status: 404, message: 'Invalid or expired voucher link' });
      
      return response.status(200).json({ status: 200, data: voucher });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * redeemVoucher — Top up user voucher balance
   */
  static async redeemVoucher(request: any, response: any) {
    const { userId, code } = request.body;
    try {
      const voucher = await VoucherModel.findOne({ code, isUsed: false });
      if (!voucher) return response.status(404).json({ status: 404, message: 'Invalid or already used voucher' });

      const user = await UserModel.findOne({ id: userId });
      if (!user) return response.status(404).json({ status: 404, message: 'User not found' });

      // Update balances
      const currentBalance = parseFloat(user.voucher_balance || '0');
      const newBalance = (currentBalance + voucher.amount).toFixed(2);
      
      user.voucher_balance = newBalance;
      await user.save();

      // Mark voucher as used
      voucher.isUsed = true;
      await voucher.save();

      return response.status(200).json({ 
        status: 200, 
        message: 'Voucher successfully redeemed!', 
        data: { newBalance, amountAdded: voucher.amount } 
      });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * verifyCode — Validate 6-digit numeric verification code
   */
  static async verifyCode(request: any, response: any) {
    const { email, code } = request.body;
    try {
      if (!email || !code) return response.status(400).json({ status: 400, message: 'Email and code are required' });

      const user = await UserModel.findOne({ email });
      if (!user) return response.status(404).json({ status: 404, message: 'User not found' });

      const tokenObj = await EmailTokenMakerForSignUp.findOne({ _userId: user._id, email_confirm_token: code });
      if (!tokenObj) return response.status(400).json({ status: 400, message: 'Invalid or expired verification code' });

      user.isVerified = true;
      await user.save();
      await EmailTokenMakerForSignUp.deleteMany({ _userId: user._id });

      // Trigger Gamification Rewards on successful verification
      GamificationService.awardSignupBonus(user.id || user._id, 'user');
      if (user.referred_by) {
        GamificationService.handleReferralMilestone(user.referred_by, 'USER');
      }

      return response.status(200).json({ status: 200, message: 'Email verified successfully!' });
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }

  /**
   * resendCode — Regenerate and resend verification code
   */
  static async resendCode(request: any, response: any) {
    const { email } = request.body;
    try {
      if (!email) return response.status(400).json({ status: 400, message: 'Email is required' });

      const user = await UserModel.findOne({ email });
      if (!user) return response.status(404).json({ status: 404, message: 'User not found' });

      const code = await UserService.sendVerificationCodeInternal(user);

      const payload: any = { status: 200, message: 'Verification code resent successfully!' };
      if (process.env.NODE_ENV === 'DEVELOPMENT') {
        payload.verificationCode = code;
        payload._devHint = 'Development only: use this code with POST /auth/verify-code';
      }
      return response.status(200).json(payload);
    } catch (err: any) {
      return response.status(400).json({ status: 400, error: err.message });
    }
  }
}
