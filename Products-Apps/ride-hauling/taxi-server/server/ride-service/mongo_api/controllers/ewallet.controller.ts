import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import { omit } from 'lodash';
import UserModel from '../models/User.model';
import Transaction from '../models/transaction.model';
import * as paymentService from '../services/paymentService';
import * as withdrawalService from '../services/withdrawalService';
import * as transferService from '../services/transferService';
import { handler as errorHandler } from '../middlewares/error';
import { getIO } from '../App';
import { LocationService } from '../services/location_service';
import { PaymentRouterService } from '../services/payment_router_service';
import { CurrencyService } from '../services/currency_service';

interface AuthenticatedRequest extends Request {
  user?: any;
  customer?: any;
}

/**
 * Get customer balance
 * @public
 */
export const getBalance = (request: Request, response: Response) => {
  (UserModel as any).find({ email: request.params.id })
    .then((data: any[]) => {
      const redFlag = data;
      if (redFlag.length <= 0) {
        return response.status(404).json({
          status: 404,
          error: 'The id of the given user was not found',
        });
      }
      const accountBalance = data[0].balance;
      return response.status(200).json({
        status: 200,
        data: [
          {
            accountBalance,
            message: 'Get balance was successful',
          },
        ],
      });
    })
    .catch((err: any) =>
      response.status(400).json({
        status: 400,
        error: 'some error occured',
      }),
    );
};

/**
 * Get customer transactions
 * @public
 */
export const getTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    req.query.accountNumber = req.user.accountNumber;
    const transactions = await (Transaction as any).list(req.query);
    const transformedTransactions = transactions.map((transaction: any) => transaction.transform());
    console.log(transformedTransactions);
    res.json(transformedTransactions);
  } catch (error) {
    next(error);
  }
};

/**
 * eWallet Deposit
 * @public
 */
export const deposit = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let { amount, card, lat, lng, gateway } = req.body;
    const ip = req.ip || req.headers['x-forwarded-for'] as string;
    
    // 1. Detect Location & Country
    const location = await LocationService.detectFromCoords(lat, lng, ip);
    
    // 2. Select Gateway if not provided
    if (!gateway) {
      gateway = PaymentRouterService.getBestGateway(location.countryCode);
    }

    // 3. Get Currency Info for this location
    const currencyInfo = await CurrencyService.getLocalCurrencyInfo(lat, lng, location.countryCode);

    const paymentResponse = await (paymentService as any).debitCard(
      req.customer.accountNumber,
      card,
      amount,
      { 
        lat, 
        lng, 
        email: req.user?.email || req.customer?.email,
        gateway: gateway,
        currencyCode: currencyInfo.code,
        currencySymbol: currencyInfo.symbol,
        exchangeRate: currencyInfo.rate
      }
    );
    try {
        const io = getIO();
        if (io && paymentResponse.customer) { // 'customer' holds the new balance
          io.to(`user-${req.customer.id || req.customer._id}`).emit('walletUpdated', {
            action: 'WALLET_TOPUP',
            amount: req.body.amount,
            balance: paymentResponse.customer
          });
        }
    } catch(err) { console.error('Emit failed', err); }
    res.json(paymentResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * eWallet Transfer
 * @public
 */
export const transfer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const transferResponse = await (transferService as any).transfer(
      req.customer.accountNumber,
      req.body.amount,
      req.body.destinationAccountNumber,
    );
    try {
        const io = getIO();
        if (io && transferResponse.customer) { 
          io.to(`user-${req.customer.id || req.customer._id}`).emit('walletUpdated', {
            action: 'WALLET_TRANSFER',
            amount: req.body.amount,
            balance: transferResponse.customer
          });
        }
    } catch(err) { console.error('Emit failed', err); }
    res.json(transferResponse);
  } catch (error) {
    next(error);
  }
};

/**
 * eWallet Withdrawal
 * @public
 */
export const withdrawal = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const withdrawalResponse = await (withdrawalService as any).withdrawal(
      req.customer.accountNumber,
      req.body.card,
      req.body.amount,
    );
    try {
        const io = getIO();
        if (io && withdrawalResponse.customer) {
          io.to(`user-${req.customer.id || req.customer._id}`).emit('walletUpdated', {
            action: 'WALLET_WITHDRAWAL',
            amount: req.body.amount,
            balance: withdrawalResponse.customer
          });
        }
    } catch(err) { console.error('Emit failed', err); }
    res.json(withdrawalResponse);
  } catch (error) {
    next(error);
  }
};
