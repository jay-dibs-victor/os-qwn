import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { PaystackProvider } from './providers/paystack.provider';
import { MoniepointProvider } from './providers/moniepoint.provider';
import { OPayProvider } from './providers/opay.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { GooglePayProvider } from './providers/googlepay.provider';
import { ApplePayProvider } from './providers/applepay.provider';
import { StripeProvider } from './providers/stripe.provider';
import { KudaProvider } from './providers/kuda.provider';
import { AlipayProvider } from './providers/alipay.provider';

export interface Plan {
  id: string;
  name: string;
  amount: number; // in NGN
  usdAmount: number; // in USD for PayPal/Apple/Google Pay
  billingCycle: string;
  features: string[];
}

export const SUBSCRIPTION_PLANS: Record<string, Plan> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter Plan',
    amount: 5000,
    usdAmount: 10,
    billingCycle: 'monthly',
    features: ['5 Rides / month', 'Standard support', 'No multi-city routes'],
  },
  PRO: {
    id: 'PRO',
    name: 'Pro Plan',
    amount: 15000,
    usdAmount: 30,
    billingCycle: 'monthly',
    features: ['Unlimited Rides', 'Priority support', 'Multi-city routes', 'Airport transfers'],
  },
  ENTERPRISE: {
    id: 'ENTERPRISE',
    name: 'Enterprise Plan',
    amount: 50000,
    usdAmount: 100,
    billingCycle: 'yearly',
    features: ['Custom rides', 'Dedicated dispatcher', 'API access', 'Corporate billing'],
  },
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly dbFilePath = path.join(process.cwd(), 'db.json');

  constructor(
    private paystackProvider: PaystackProvider,
    private moniepointProvider: MoniepointProvider,
    private opayProvider: OPayProvider,
    private paypalProvider: PayPalProvider,
    private googlePayProvider: GooglePayProvider,
    private applePayProvider: ApplePayProvider,
    private stripeProvider: StripeProvider,
    private kudaProvider: KudaProvider,
    private alipayProvider: AlipayProvider,
    private configService: ConfigService,
  ) {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!fs.existsSync(this.dbFilePath)) {
      const defaultData = {
        users: [
          { username: 'john_doe', email: 'john@example.com', activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null },
          { username: 'jane_smith', email: 'jane@example.com', activePlan: 'PRO', subscriptionStatus: 'ACTIVE', planExpiry: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() },
        ],
        transactions: [],
      };
      this.saveData(defaultData);
    }
  }

  private loadData(): { users: any[]; transactions: any[] } {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const fileContent = fs.readFileSync(this.dbFilePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return {
          users: data.users || [],
          transactions: data.transactions || [],
        };
      }
    } catch (error) {
      this.logger.error(`Failed to load JSON database: ${error.message}`);
    }

    return { users: [], transactions: [] };
  }

  private saveData(data: { users: any[]; transactions: any[] }) {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      this.logger.error(`Failed to save JSON database: ${error.message}`);
    }
  }

  private getProviderInstance(provider: string) {
    switch (provider.toLowerCase()) {
      case 'paystack':
      case 'verve': // Verve card routes through Paystack
        return this.paystackProvider;
      case 'moniepoint':
        return this.moniepointProvider;
      case 'opay':
        return this.opayProvider;
      case 'paypal':
        return this.paypalProvider;
      case 'googlepay':
        return this.googlePayProvider;
      case 'applepay':
        return this.applePayProvider;
      case 'stripe':
      case 'mastercard': // Mastercard routes through Stripe
        return this.stripeProvider;
      case 'kuda':
        return this.kudaProvider;
      case 'alipay':
        return this.alipayProvider;
      default:
        throw new BadRequestException(`Unsupported payment provider: ${provider}`);
    }
  }

  async initializePayment(userId: string, planId: string, provider: string, callbackUrl: string) {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    const isUsdGateway = ['paypal', 'applepay', 'googlepay', 'stripe', 'mastercard', 'alipay'].includes(provider.toLowerCase());
    const amount = isUsdGateway ? plan.usdAmount : plan.amount;
    const currency = isUsdGateway ? 'USD' : 'NGN';

    // Get User Details
    const dbData = this.loadData();
    let user = dbData.users.find(u => u.username === userId);
    if (!user) {
      user = { username: userId, email: `${userId}@example.com`, activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null };
      dbData.users.push(user);
      this.saveData(dbData);
    }
    const userEmail = user.email;

    // Generate Unique Transaction Reference
    const reference = `TX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const providerInstance = this.getProviderInstance(provider);
    const initResponse = await providerInstance.initialize({
      reference,
      amount,
      email: userEmail,
      planId,
      callbackUrl,
    });

    // Save transaction state
    const transactionData = {
      reference,
      userId,
      planId,
      amount,
      currency,
      provider,
      status: 'PENDING',
      paymentDetails: initResponse.extraData || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbData.transactions.push(transactionData);
    this.saveData(dbData);

    return {
      reference,
      amount,
      currency,
      checkoutUrl: initResponse.checkoutUrl,
      extraData: initResponse.extraData,
    };
  }

  async verifyPayment(reference: string, provider: string) {
    const dbData = this.loadData();
    const transaction = dbData.transactions.find(tx => tx.reference === reference);

    if (!transaction) {
      throw new NotFoundException(`Transaction with reference ${reference} not found`);
    }

    if (transaction.status === 'SUCCESS') {
      return { reference, status: 'SUCCESS', message: 'Transaction already successfully processed' };
    }

    const providerInstance = this.getProviderInstance(provider);
    const verification = await providerInstance.verify(reference);

    if (verification.status === 'SUCCESS') {
      this.markTransactionSuccessLocal(dbData, reference, verification.rawResponse);
    } else if (verification.status === 'FAILED') {
      this.markTransactionFailedLocal(dbData, reference, verification.rawResponse);
    }

    return {
      reference,
      status: verification.status,
      rawResponse: verification.rawResponse,
    };
  }

  async processGooglePayToken(reference: string, token: string, username: string, planId: string) {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) throw new NotFoundException(`Plan ${planId} not found`);

    const dbData = this.loadData();
    let user = dbData.users.find(u => u.username === username);
    if (!user) {
      user = { username, email: `${username}@example.com`, activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null };
      dbData.users.push(user);
      this.saveData(dbData);
    }
    const email = user.email;

    const verification = await this.googlePayProvider.processToken({
      reference,
      amount: plan.usdAmount,
      email,
      planId,
      paymentToken: token,
    });

    this.saveDirectTransactionLocal(dbData, reference, username, planId, plan.usdAmount, 'USD', 'googlepay', verification.status, verification.rawResponse);

    if (verification.status === 'SUCCESS') {
      this.updateUserSubscriptionLocal(dbData, username, planId);
    }

    this.saveData(dbData);
    return { reference, status: verification.status };
  }

  async processApplePayToken(reference: string, token: Record<string, any>, username: string, planId: string) {
    const plan = SUBSCRIPTION_PLANS[planId.toUpperCase()];
    if (!plan) throw new NotFoundException(`Plan ${planId} not found`);

    const dbData = this.loadData();
    let user = dbData.users.find(u => u.username === username);
    if (!user) {
      user = { username, email: `${username}@example.com`, activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null };
      dbData.users.push(user);
      this.saveData(dbData);
    }
    const email = user.email;

    const verification = await this.applePayProvider.processToken({
      reference,
      amount: plan.usdAmount,
      email,
      planId,
      paymentToken: token,
    });

    this.saveDirectTransactionLocal(dbData, reference, username, planId, plan.usdAmount, 'USD', 'applepay', verification.status, verification.rawResponse);

    if (verification.status === 'SUCCESS') {
      this.updateUserSubscriptionLocal(dbData, username, planId);
    }

    this.saveData(dbData);
    return { reference, status: verification.status };
  }

  async validateAppleSession(validationUrl: string) {
    return this.applePayProvider.validateSession(validationUrl);
  }

  private saveDirectTransactionLocal(
    dbData: { users: any[]; transactions: any[] },
    reference: string,
    userId: string,
    planId: string,
    amount: number,
    currency: string,
    provider: string,
    status: string,
    rawResponse: any,
  ) {
    const transactionData = {
      reference,
      userId,
      planId,
      amount,
      currency,
      provider,
      status,
      paymentDetails: rawResponse,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbData.transactions.push(transactionData);
  }

  private markTransactionSuccessLocal(dbData: { users: any[]; transactions: any[] }, reference: string, rawResponse: any) {
    const tx = dbData.transactions.find(t => t.reference === reference);
    if (tx) {
      tx.status = 'SUCCESS';
      tx.paymentDetails = rawResponse;
      tx.updatedAt = new Date().toISOString();
      this.updateUserSubscriptionLocal(dbData, tx.userId, tx.planId);
      this.saveData(dbData);
    }
  }

  private markTransactionFailedLocal(dbData: { users: any[]; transactions: any[] }, reference: string, rawResponse: any) {
    const tx = dbData.transactions.find(t => t.reference === reference);
    if (tx) {
      tx.status = 'FAILED';
      tx.paymentDetails = rawResponse;
      tx.updatedAt = new Date().toISOString();
      this.saveData(dbData);
    }
  }

  private updateUserSubscriptionLocal(dbData: { users: any[]; transactions: any[] }, username: string, planId: string) {
    const validityDays = planId.toUpperCase() === 'ENTERPRISE' ? 365 : 30;
    const planExpiry = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    let user = dbData.users.find(u => u.username === username);
    if (!user) {
      user = { username, email: `${username}@example.com`, activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null };
      dbData.users.push(user);
    }

    user.activePlan = planId.toUpperCase();
    user.planExpiry = planExpiry;
    user.subscriptionStatus = 'ACTIVE';
    this.logger.log(`Subscription updated in JSON DB for user ${username}: Plan ${planId}`);
  }

  async handleWebhook(provider: string, body: any, rawBodyString: string, signature: string) {
    this.logger.log(`Received webhook from ${provider}. Signature: ${signature}`);

    const providerInstance = this.getProviderInstance(provider);
    
    if ('verifyWebhookSignature' in providerInstance) {
      const isVerified = (providerInstance as any).verifyWebhookSignature(rawBodyString, signature);
      if (!isVerified) {
        this.logger.error(`Webhook signature verification failed for ${provider}`);
        throw new BadRequestException('Invalid signature');
      }
    }

    let reference = '';
    let isSuccess = false;

    const lowerProvider = provider.toLowerCase();

    if (lowerProvider === 'paystack' || lowerProvider === 'verve') {
      if (body.event === 'charge.success') {
        reference = body.data.reference;
        isSuccess = true;
      }
    } else if (lowerProvider === 'moniepoint') {
      if (body.eventType === 'SUCCESSFUL_TRANSACTION' || body.eventData?.paymentStatus === 'PAID') {
        reference = body.eventData?.paymentReference || body.data?.reference;
        isSuccess = true;
      }
    } else if (lowerProvider === 'opay') {
      if (body.status === 'SUCCESSFUL') {
        reference = body.reference;
        isSuccess = true;
      }
    } else if (lowerProvider === 'stripe' || lowerProvider === 'mastercard') {
      if (body.type === 'payment_intent.succeeded') {
        reference = body.data?.object?.metadata?.reference;
        isSuccess = true;
      }
    } else if (lowerProvider === 'kuda') {
      if (body.status === 'SUCCESSFUL') {
        reference = body.trackingReference;
        isSuccess = true;
      }
    } else if (lowerProvider === 'alipay') {
      if (body.notifyType === 'PAYMENT_RESULT' && body.result?.resultCode === 'SUCCESS') {
        reference = body.paymentRequestId;
        isSuccess = true;
      }
    }

    if (reference) {
      const dbData = this.loadData();
      if (isSuccess) {
        this.markTransactionSuccessLocal(dbData, reference, body);
        this.logger.log(`Webhook marked reference ${reference} as SUCCESS`);
      } else {
        this.markTransactionFailedLocal(dbData, reference, body);
        this.logger.log(`Webhook marked reference ${reference} as FAILED`);
      }
    }

    return { received: true };
  }

  async getTransactions(userId: string) {
    const dbData = this.loadData();
    return dbData.transactions
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getUser(username: string) {
    const dbData = this.loadData();
    let user = dbData.users.find((u) => u.username === username);
    if (!user) {
      user = { username, email: `${username}@example.com`, activePlan: 'FREE', subscriptionStatus: 'NONE', planExpiry: null };
      dbData.users.push(user);
      this.saveData(dbData);
    }
    return user;
  }

  async triggerSandboxWebhook(provider: string, reference: string) {
    const dbData = this.loadData();
    const tx = dbData.transactions.find(t => t.reference === reference);
    if (!tx) {
      throw new NotFoundException('Transaction not found');
    }

    const lowerProvider = provider.toLowerCase();
    let payload: any = {};
    let signatureHeaderName = '';
    let signatureValue = '';

    if (lowerProvider === 'stripe' || lowerProvider === 'mastercard') {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || 'whsec_test_secret';
      payload = {
        id: 'evt_test_' + Math.random().toString(36).substring(7),
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_test_' + reference,
            object: 'payment_intent',
            amount: tx.amount * 100,
            currency: 'usd',
            metadata: {
              reference: reference,
            },
          },
        },
      };

      const bodyString = JSON.stringify(payload);
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signedPayload = `${timestamp}.${bodyString}`;
      const computedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(signedPayload)
        .digest('hex');

      signatureHeaderName = 'stripe-signature';
      signatureValue = `t=${timestamp},v1=${computedSignature}`;
    } else if (lowerProvider === 'paystack' || lowerProvider === 'verve') {
      const secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || 'sk_test_placeholder';
      payload = {
        event: 'charge.success',
        data: {
          reference: reference,
          status: 'success',
          amount: tx.amount * 100,
          currency: tx.currency || 'NGN',
          customer: { email: tx.userId + '@example.com' },
        },
      };
      const bodyString = JSON.stringify(payload);
      const computedSignature = crypto
        .createHmac('sha512', secretKey)
        .update(bodyString)
        .digest('hex');

      signatureHeaderName = 'x-paystack-signature';
      signatureValue = computedSignature;
    } else if (lowerProvider === 'moniepoint') {
      const secretKey = this.configService.get<string>('MONIEPOINT_SECRET_KEY') || 'moniepoint_test_key';
      payload = {
        eventType: 'SUCCESSFUL_TRANSACTION',
        eventData: {
          paymentReference: reference,
          amount: tx.amount,
          currency: tx.currency || 'NGN',
          paymentMethod: 'ACCOUNT_TRANSFER',
          paymentStatus: 'PAID',
        },
      };
      const bodyString = JSON.stringify(payload);
      const computedSignature = crypto
        .createHmac('sha512', secretKey)
        .update(bodyString)
        .digest('hex');

      signatureHeaderName = 'moniepoint-signature';
      signatureValue = computedSignature;
    } else if (lowerProvider === 'opay') {
      const secretKey = this.configService.get<string>('OPAY_SECRET_KEY') || 'opay_test_key';
      payload = {
        amount: (tx.amount * 100).toString(),
        currency: tx.currency || 'NGN',
        reference: reference,
        status: 'SUCCESSFUL',
      };
      const bodyString = JSON.stringify(payload);
      const computedSignature = crypto
        .createHmac('sha512', secretKey)
        .update(bodyString)
        .digest('hex');

      signatureHeaderName = 'authorization';
      signatureValue = `Bearer ${computedSignature}`;
    } else if (lowerProvider === 'kuda') {
      const apiKey = this.configService.get<string>('KUDA_API_KEY') || 'kuda_test_key';
      payload = {
        status: 'SUCCESSFUL',
        trackingReference: reference,
        amount: tx.amount,
      };
      const bodyString = JSON.stringify(payload);
      const computedSignature = crypto
        .createHmac('sha256', apiKey)
        .update(bodyString)
        .digest('hex');

      signatureHeaderName = 'kuda-signature';
      signatureValue = computedSignature;
    } else if (lowerProvider === 'alipay') {
      const privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY') || '';
      payload = {
        notifyType: 'PAYMENT_RESULT',
        result: {
          resultCode: 'SUCCESS',
          resultMessage: 'success',
        },
        paymentRequestId: reference,
        paymentAmount: {
          currency: tx.currency || 'USD',
          value: (tx.amount * 100).toString(),
        },
      };
      const bodyString = JSON.stringify(payload);
      
      let signature = '';
      if (privateKey) {
        try {
          const signer = crypto.createSign('RSA-SHA256');
          signer.update(bodyString);
          signature = signer.sign(privateKey, 'base64');
        } catch {}
      }
      
      if (!signature) {
        signature = crypto
          .createHmac('sha256', 'alipay_test_key')
          .update(bodyString)
          .digest('base64');
      }

      signatureHeaderName = 'signature';
      signatureValue = `algorithm=RSA256,keyVersion=1,signature=${signature}`;
    } else {
      throw new BadRequestException('Provider does not support webhooks');
    }

    const rawBodyString = JSON.stringify(payload);
    return this.handleWebhook(provider, payload, rawBodyString, signatureValue);
  }
}
