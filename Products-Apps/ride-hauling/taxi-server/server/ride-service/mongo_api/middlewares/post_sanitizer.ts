import { Request, Response, NextFunction } from 'express';
import { ErrorHandler } from '../helpers/error_handler';

const locationRegex = /^([-+]?\d{1,2}([.]\d+)?),\s*([-+]?\d{1,3}([.]\d+)?)$/;
const validIdRegex = /^[1-9]{1,}/;

export default class SubmitEventValidator {
  static validateSubmit(request: Request, response: Response, next: NextFunction) {
    const { reportType, subject, comment } = request.body;

    if (!(reportType && reportType.length)) {
      return ErrorHandler.sendError(response, 'Category must be a string');
    }

    if (!subject) {
      return ErrorHandler.sendError(response, 'Please enter a subject');
    }

    if (!comment) {
      return ErrorHandler.sendError(response, 'Please enter a comment');
    }

    if (typeof comment !== 'string') {
      return ErrorHandler.sendError(response, 'comment must be a string of characters');
    }
    return next();
  }

  static validateLocation(request: Request, response: Response, next: NextFunction) {
    const { location } = request.body;
    if (!(location && location.length)) {
      return ErrorHandler.sendError(response, 'Location must be a string');
    }
    if (typeof location !== 'string' || !locationRegex.test(location)) {
      return ErrorHandler.sendError(response, 'location does not match a Lat Long coordinates');
    }
    return next();
  }

  static validateStatus(request: Request, response: Response, next: NextFunction) {
    const { status } = request.body;
    if (!(status && status.length)) {
      return ErrorHandler.sendError(response, 'Status is required');
    }
    if (
      typeof status !== 'string' ||
      (status !== 'under investigation' && status !== 'resolved' && status !== 'rejected')
    ) {
      return ErrorHandler.sendError(
        response,
        'Invalid status, status must be a string containing under investigation, resolved or rejected',
      );
    }
    return next();
  }

  static validateComment(request: Request, response: Response, next: NextFunction) {
    const { comment } = request.body;
    if (!comment) {
      return ErrorHandler.sendError(response, 'Please enter a comment');
    }

    if (typeof comment !== 'string') {
      return ErrorHandler.sendError(response, 'comment must be a string of characters');
    }
    return next();
  }

  static validateId(request: Request, response: Response, next: NextFunction) {
    if (!validIdRegex.test(request.params.id as string)) {
      console.log('error validating id');
      return ErrorHandler.sendError(response, 'The given id is not a number');
    }
    return next();
  }
}
