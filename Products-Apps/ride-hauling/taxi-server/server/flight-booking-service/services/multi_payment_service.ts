import axios from 'axios';
import { FRONTEND_URL } from '../../shared/constants';

export class MultiPaymentService {
  /**
   * Initiate payment with the selected gateway
   */
  static async initiatePayment(gateway: string, amount: number, currency: string, email: string, metadata: any) {
    const amountInSubunit = Math.round(amount * 100);
    
    switch (gateway.toLowerCase()) {
      case 'paystack':
        return this.initiatePaystack(amountInSubunit, currency, email, metadata);
      case 'stripe':
        return this.initiateStripe(amountInSubunit, currency, email, metadata);
      case 'paypal':
        return this.initiatePayPal(amount, currency, email, metadata);
      case 'flutterwave':
        return this.initiateFlutterwave(amount, currency, email, metadata);
      default:
        throw new Error('Invalid payment gateway');
    }
  }

  private static async initiatePaystack(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount,
        email,
        currency: currency === 'NGN' ? 'NGN' : currency,
        metadata,
        callback_url: `${FRONTEND_URL}/flight/payment/callback/paystack`
      },
      {
        headers: { Authorization: `Bearer ${SECRET_KEY}` }
      }
    );
    return { status: true, data: response.data.data };
  }

  private static async initiateStripe(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('currency', currency.toLowerCase());
    params.append('receipt_email', email);
    params.append('description', `Queens Flight Booking - ${metadata.cartId}`);
    params.append('metadata[cartId]', metadata.cartId);

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
        authorization_url: null, // Stripe uses client secret for frontend
        client_secret: response.data.client_secret,
        reference: response.data.id
      }
    };
  }

  private static async initiatePayPal(amount: number, currency: string, email: string, metadata: any) {
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

    const response = await axios.post(
      'https://api-m.paypal.com/v2/checkout/orders',
      {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency === 'NGN' ? 'USD' : currency,
            value: amount.toFixed(2),
          },
          description: `Flight Booking ${metadata.cartId}`,
          reference_id: metadata.cartId
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
      data: {
        id: response.data.id,
        links: response.data.links,
        reference: response.data.id
      }
    };
  }

  private static async initiateFlutterwave(amount: number, currency: string, email: string, metadata: any) {
    const SECRET_KEY = process.env.FLW_SECRET_KEY;
    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: `flight-${Date.now()}-${metadata.cartId}`,
        amount,
        currency,
        redirect_url: `${FRONTEND_URL}/flight/payment/callback/flutterwave`,
        customer: { email },
        meta: metadata
      },
      {
        headers: { Authorization: `Bearer ${SECRET_KEY}` }
      }
    );
    return { status: true, data: response.data.data };
  }

  static async verifyPayment(gateway: string, reference: string) {
    switch (gateway.toLowerCase()) {
      case 'paystack':
        return this.verifyPaystack(reference);
      case 'stripe':
        return this.verifyStripe(reference);
      case 'flutterwave':
        return this.verifyFlutterwave(reference);
      default:
        return false;
    }
  }

  private static async verifyPaystack(reference: string) {
    const SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` },
    });
    return response.data.data.status === 'success';
  }

  private static async verifyStripe(paymentIntentId: string) {
    const SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const response = await axios.get(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` }
    });
    return response.data.status === 'succeeded';
  }

  private static async verifyFlutterwave(transactionId: string) {
    const SECRET_KEY = process.env.FLW_SECRET_KEY;
    const response = await axios.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
      headers: { Authorization: `Bearer ${SECRET_KEY}` }
    });
    return response.data.data.status === 'successful';
  }
}
