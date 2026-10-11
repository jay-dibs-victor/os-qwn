import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import APIError from '../utils/APIError';

/**
 * Error handler. Send stacktrace only during development
 * @public
 */
export const handler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const response = {
    status: err.status || httpStatus.INTERNAL_SERVER_ERROR,
    message: err.message || httpStatus[err.status as keyof typeof httpStatus],
    errors: err.errors,
    stack: err.stack,
  };

  if (process.env.NODE_ENV !== 'development') {
    delete response.stack;
  }

  res.status(response.status);
  res.json(response);
};

/**
 * If error is not an instanceOf APIError, convert it.
 * @public
 */
export const converter = (err: any, req: Request, res: Response, next: NextFunction) => {
  let convertedError = err;

  if (!(err instanceof APIError)) {
    convertedError = new APIError({
      message: err.message,
      status: err.status,
      stack: err.stack,
    });
  }

  return handler(convertedError, req, res, next);
};

/**
 * Catch 404 and forward to error handler
 * @public
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const err = new APIError({
    message: 'Not found',
    status: httpStatus.NOT_FOUND as number,
  });
  return handler(err, req, res, next);
};
