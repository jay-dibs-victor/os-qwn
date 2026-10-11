import { Request, Response, NextFunction } from 'express';
import UserModel from '../models/User.model';

const validNameRegex = /^[A-Za-z]{3,30}$/;
const user_typeRegex = /^[a-zA-Z]'?([a-zA-Z]|\.| |-){3,}$/;
const usernameRegex = /^[A-Za-z0-9]{3,20}$/;
const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex = /^[A-Za-z0-9]{6,}$/;
const phoneNumberRegex = /^(\+?234|0)?[789]\d{9}$/;
const lastnameRegex = /^[A-Za-z\d_-]+$/;

export default class DriverSanitizer {
  static async checkIfDriverDoesntExists(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    if (!emailRegex.test(email)) {
      return response.status(422).json({
        status: 422,
        error: 'Invalid email sent',
      });
    }

    try {
      const result = await UserModel.find({ email: email });
      if (result.length > 0) {
        return next();
      } else {
        return response.status(422).json({
          status: 422,
          error: 'User does not exist on this platform',
        });
      }
    } catch (err) {
      return response.status(400).json({
        status: 400,
        error: 'Email or Username must be unique: ' + err,
      });
    }
  }

  static async checkIfDriverIsBanned(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    if (!emailRegex.test(email)) {
      return response.status(422).json({
        status: 422,
        error: 'Invalid email sent',
      });
    }

    try {
      const result = await UserModel.find({ email: email, status: 'Active' });
      if (result.length <= 0) {
        return response.status(409).json({
          status: 409,
          error: 'User is either banned or suspended on this platform',
        });
      } else {
        return next();
      }
    } catch (err) {
      return response.status(400).json({
        status: 400,
        error: 'Email or Username must be unique: ' + err,
      });
    }
  }

  static async checkIfDriverExists(request: Request, response: Response, next: NextFunction) {
    const { email } = request.body;

    if (!emailRegex.test(email)) {
      return response.status(422).json({
        status: 422,
        error: 'Invalid email sent',
      });
    }

    try {
      const result = await UserModel.find({ email: email });
      if (result.length > 0) {
        return response.status(409).json({
          status: 409,
          error: 'Email already exists',
        });
      } else {
        return next();
      }
    } catch (err) {
      return response.status(400).json({
        status: 400,
        error: 'Email or Username must be unique: ' + err,
      });
    }
  }

  static validateSignUp(request: Request, response: Response, next: NextFunction) {
    const {
      firstname,
      lastname,
      user_type,
      username,
      email,
      phoneNumber,
      password,
      terms_and_cond,
    } = request.body;

    if (terms_and_cond == 'not selected') {
      return response.status(422).json({
        status: 422,
        error: 'Terms and conditions must be checked to sign up',
      });
    }
    if (!(firstname && firstname.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your firstname',
      });
    }
    if (!validNameRegex.test(firstname)) {
      return response.status(422).json({
        status: 422,
        error: 'firstname must be between 3 and 30 characters only',
      });
    }
    if (!(lastname && lastname.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your lastname',
      });
    }
    if (!lastnameRegex.test(lastname)) {
      return response.status(422).json({
        status: 422,
        error: 'lastname must be between 3 and 30 characters only',
      });
    }

    if (!(user_type && user_type.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your user_type',
      });
    }
    if (user_type == 'Select Category') {
      return response.status(422).json({
        status: 422,
        error: 'Please choose a plan category',
      });
    }

    if (!user_typeRegex.test(user_type)) {
      return response.status(422).json({
        status: 422,
        error: 'user_type must be a minimum of 3 characters',
      });
    }

    if (!(username && username.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your username',
      });
    }

    if (!usernameRegex.test(username)) {
      return response.status(422).json({
        status: 422,
        error: 'username must contain between 3 and 30 alphanumeric characters only',
      });
    }
    if (!(email && email.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your email',
      });
    }

    if (!emailRegex.test(email)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter a valid email',
      });
    }

    if (!(phoneNumber && phoneNumber.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your phone number',
      });
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter a valid phone number',
      });
    }

    if (!(password && password.length)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter your password',
      });
    }

    if (!passwordRegex.test(password)) {
      return response.status(422).json({
        status: 422,
        error: 'Password must be a minimum of 6 alphanumeric characters',
      });
    }

    return next();
  }

  static validateLogin(request: Request, response: Response, next: NextFunction) {
    const { email, password } = request.body;
    if (!(email && email.length)) {
      return response.status(422).json({
        status: 422,
        error: 'email is required',
      });
    }
    if (!emailRegex.test(email)) {
      return response.status(422).json({
        status: 422,
        error: 'Please enter a valid email',
      });
    }
    if (!(password && password.length)) {
      return response.status(422).json({
        status: 422,
        error: 'password is required',
      });
    }

    UserModel.find({ email: email })
      .then(result => {
        if (result.length <= 0) {
          return response.status(404).json({
            status: 404,
            error: 'Email does not exists',
          });
        } else {
          return next();
        }
      })
      .catch(err =>
        response.status(400).json({
          status: 400,
          error: 'Email or Username must be unique',
        }),
      );
  }
}
