import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { omit } from 'lodash';
// Assuming customer.model.ts will exist or exists. 
// Original was require('../models/customer.model')
import Customer from '../models/User.model'; 
import { handler as errorHandler } from '../middlewares/error';

interface AuthenticatedRequest extends Request {
  locals?: any;
  customer?: any;
  user?: any;
}

/**
 * Load customer and append to req.
 * @public
 */
export const load = async (req: AuthenticatedRequest, res: Response, next: NextFunction, id: string) => {
  try {
    const customer = await (Customer as any).get(id);
    req.locals = { customer };
    return next();
  } catch (error) {
    return errorHandler(error, req, res, next);
  }
};

/**
 * Get customer
 * @public
 */
export const get = (req: AuthenticatedRequest, res: Response) => res.json(req.locals.customer.transform());

/**
 * Get logged in customer info
 * @public
 */
export const loggedIn = (req: AuthenticatedRequest, res: Response) => res.json(req.customer.transform());

/**
 * Create new customer
 * @public
 */
export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customer = new (Customer as any)(req.body);
    const savedCustomer = await customer.save();
    res.status(httpStatus.CREATED as number);
    res.json(savedCustomer.transform());
  } catch (error) {
    next((Customer as any).checkDuplicateEmail(error));
  }
};

/**
 * Replace existing customer
 * @public
 */
export const replace = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { customer } = req.locals;
    const newCustomer = new (Customer as any)(req.body);
    const ommitRole = customer.role !== 'admin' ? 'role' : '';
    const newCustomerObject = omit(newCustomer.toObject(), '_id', ommitRole);

    await customer.update(newCustomerObject, { override: true, upsert: true });
    const savedCustomer = await (Customer as any).findById(customer._id);

    res.json(savedCustomer.transform());
  } catch (error) {
    next((Customer as any).checkDuplicateEmail(error));
  }
};

/**
 * Update existing customer
 * @public
 */
export const update = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const ommitRole = req.locals.customer.role !== 'admin' ? 'role' : '';
  const updatedCustomer = omit(req.body, ommitRole);
  const customer = Object.assign(req.locals.customer, updatedCustomer);

  customer
    .save()
    .then((savedCustomer: any) => res.json(savedCustomer.transform()))
    .catch((e: any) => next((Customer as any).checkDuplicateEmail(e)));
};

/**
 * Get customer list
 * @public
 */
export const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const customers = await (Customer as any).list(req.query);
    const transformedCustomers = customers.map((customer: any) => customer.transform());
    res.json(transformedCustomers);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete customer
 * @public
 */
export const remove = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { customer } = req.locals;

  customer
    .remove()
    .then(() => res.status(httpStatus.NO_CONTENT as number).end())
    .catch((e: any) => next(e));
};
