import axios from 'axios';
import APIError from '../utils/APIError';
import httpStatus from 'http-status';
import GatewayTransaction from '../models/gatewayTransaction.model';
import { CurrencyService } from './currency_service';
import { PaymentRouterService } from './payment_router_service';
import { LocationService } from './location_service';
import { FRONTEND_URL } from '../../../shared/constants';

export class MultiPaymentService {
  /**
   * Initiate payment with the selected gateway
   */
  static async initiatePayment(gateway: string, amount: number, email: string, metadata: any) {
    metadata = metadata || {};
    const lat = metadata.lat;
    const lng = metadata.lng;
    const ip = metadata.ip;

    // 1. Detect Location
    const location = await LocationService.detectFromCoords(lat, lng, ip);

    // 2. Select Gateway if missing
    let activeGateway = gateway;
    if (!activeGateway) {
      activeGateway = PaymentRouterService.getBestGateway(location.countryCode);
    }

    // 3. Detect currency from location or fallback to NGN
    const currencyInfo = await CurrencyService.getLocalCurrencyInfo(lat, lng, location.countryCode);

    const amountInSubunit = Math.round(amount * 100);

    switch (activeGateway.toLowerCase()) {
      case 'paystack':
        return this.initiatePaystack(amountInSubunit, currencyInfo.code, email, metadata);
      case 'stripe':
        return this.initiateStripe(amountInSubunit, currencyInfo.code, email, metadata);
      case 'paypal':
        return this.initiatePayPal(amount, currencyInfo.code, email, metadata);
      case 'flutterwave':
        return this.initiateFlutterwave(amount, currencyInfo.code, email, metadata);
      default:
        throw new APIError({
          message: 'Invalid payment gateway',
          status: httpStatus.BAD_REQUEST,
        });
    }
  }

  private static async initiatePaystack(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      return { status: false, message: 'Paystack not configured', authorization_url: null };
    }
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          amount,
          email,
          currency: currency === 'NGN' ? 'NGN' : currency, // Paystack supports NGN, GHS, ZAR, KES
          metadata,
          callback_url: `${FRONTEND_URL}/payment/callback/paystack`
        },
        {
          headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (err: any) {
      throw new APIError({
        message: `Paystack Error: ${err.response?.data?.message || err.message}`,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }


  private static async initiateStripe(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    // Stripe prefers x-www-form-urlencoded but accepts JSON in some libs. 
    // We'll use URLSearchParams for native axios compatibility with Stripe API.
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('currency', currency.toLowerCase());
    params.append('receipt_email', email);
    params.append('description', `Queens Ride - ${metadata.ride_id}`);
    params.append('metadata[ride_id]', metadata.ride_id);

    try {
      const response = await axios.post(
        'https://api.stripe.com/v1/payment_intents',
        params,
        {
          headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      return {
        status: true,
        data: {
          client_secret: response.data.client_secret,
          id: response.data.id
        }
      };
    } catch (err: any) {
      throw new APIError({
        message: `Stripe Error: ${err.response?.data?.error?.message || err.message}`,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }


  private static async initiatePayPal(amount: number, currency: string, email: string, metadata: any) {
    // 1. Get Access Token
    const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    const tokenResponse = await axios.post(
      'https://api-m.paypal.com/v1/oauth2/token',
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    const accessToken = tokenResponse.data.access_token;

    // Convert to USD if target is not USD, as PayPal sandbox often defaults to USD
    // But here we use the currency detected.
    const finalAmount = amount;

    // 2. Create Order
    try {
      const response = await axios.post(
        'https://api-m.paypal.com/v2/checkout/orders',
        {
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency === 'NGN' ? 'USD' : currency, // PayPal doesn't support NGN
              value: currency === 'NGN' ? (amount / (await CurrencyService.getRate('usd') || 1300)).toFixed(2) : amount.toFixed(2),
            },
            description: `Ride ${metadata.ride_id}`,
            reference_id: metadata.ride_id
          }]
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        status: true,
        data: response.data
      };
    } catch (err: any) {
      throw new APIError({
        message: `PayPal Error: ${err.response?.data?.message || err.message}`,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private static async initiateFlutterwave(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.FLW_SECRET_KEY;
    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: `goom-${Date.now()}-${metadata.ride_id || 'wallet'}`,
          amount,
          currency: currency,
          redirect_url: `${FRONTEND_URL}/payment/callback/flutterwave`,
          customer: {
            email: email,
            phonenumber: metadata.phone || '',
            name: metadata.name || 'Goom User'
          },
          meta: metadata,
          customizations: {
            title: 'Queens Ride Payment',
            description: 'Payment for your premium ride',
            logo: 'https://queens.com/logo.png'
          }
        },
        {
          headers: {
            Authorization: `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (err: any) {
      throw new APIError({
        message: `Flutterwave Error: ${err.response?.data?.message || err.message}`,
        status: httpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  /**
   * Verify transaction after user completes it on the frontend
   */
  static async verifyPayment(gateway: string, reference: string) {
    switch (gateway.toLowerCase()) {
      case 'paystack':
        return this.verifyPaystack(reference);
      case 'flutterwave':
        return this.verifyFlutterwave(reference);
      case 'stripe':
        return this.verifyStripe(reference); // reference here is payment_intent_id
      default:
        throw new APIError({
          message: 'Verification not supported for this gateway via this route',
          status: httpStatus.BAD_REQUEST,
        });
    }
  }

  private static async verifyPaystack(reference: string) {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    if (!SECRET_KEY) {
      return false;
    }
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
    });
    return response.data.data.status === 'success';
  }

  private static async verifyFlutterwave(transactionId: string) {
    const SECRET_KEY = process.env.FLW_SECRET_KEY;
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` }
    });
    return response.data.data.status === 'successful';
  }

  private static async verifyStripe(paymentIntentId: string) {
    const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const response = await axios.get(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` }
    });
    return response.data.status === 'succeeded';
  }
}
