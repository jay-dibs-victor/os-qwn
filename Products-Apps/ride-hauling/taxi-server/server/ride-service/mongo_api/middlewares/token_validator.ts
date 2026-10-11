import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
// ResponseHandler is default export in its .ts file but the .js used it as named in some places? 
// Actually response_handler.ts has 'export default class ResponseHandler'.
import ResponseHandler from '../helpers/response_handler';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export default class TokenVerification {
  static userAuthentication(request: AuthenticatedRequest, response: Response, next: NextFunction) {
    let token = request.header('x-access-token') || request.header('Authorization');
    
    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    if (!token) {
      console.log('error validating token: No token provided');
      return response.status(401).json({
        status: 401,
        error: 'You must signup or login to access this route',
      });
    }
    try {
      const secret = process.env.SECRET || 'default_secret';
      const decoded = jwt.verify(token, secret);
      request.user = decoded;
      return next();
    } catch (err) {
      console.log('error validating token: JWT verification failed', err.message);
      return response.status(403).json({
        status: 403,
        error: 'Authentication failed',
      });
    }
  }

  static adminAuthentication(request: AuthenticatedRequest, response: Response, next: NextFunction) {
    let token = request.header('x-access-token') || request.header('Authorization');

    if (token && token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }

    if (!token) {
      console.log('error validating token: No token provided');
      return response.status(401).json({
        status: 401,
        error: 'You must signup or login to access this route',
      });
    }
    try {
      const secret = process.env.SECRET || 'default_secret';
      const decoded: any = jwt.verify(token, secret);
      request.user = decoded;

      if (request.user.isAdmin === false) {
        return response.status(403).json({
          status: 403,
          error: 'You do not have the admin rights to perform this action',
        });
      }
      return next();
    } catch (err) {
      console.log('error validating token: JWT verification failed', err.message);
      return response.status(403).json({
        status: 403,
        error: 'Authentication failed',
      });
    }
  }
}
