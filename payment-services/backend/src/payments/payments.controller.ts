import { Controller, Post, Get, Body, Param, Query, Headers, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService, SUBSCRIPTION_PLANS } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('plans')
  getPlans() {
    return { plans: Object.values(SUBSCRIPTION_PLANS) };
  }

  @Get('user/:username')
  async getUser(@Param('username') username: string) {
    return this.paymentsService.getUser(username);
  }

  @Get('transactions/:username')
  async getTransactions(@Param('username') username: string) {
    return this.paymentsService.getTransactions(username);
  }

  @Post('initialize')
  async initialize(
    @Body('userId') userId: string,
    @Body('planId') planId: string,
    @Body('provider') provider: string,
    @Body('callbackUrl') callbackUrl: string,
  ) {
    return this.paymentsService.initializePayment(userId, planId, provider, callbackUrl);
  }

  @Get('verify/:reference')
  async verify(
    @Param('reference') reference: string,
    @Query('provider') provider: string,
  ) {
    return this.paymentsService.verifyPayment(reference, provider);
  }

  @Post('googlepay/charge')
  async chargeGooglePay(
    @Body('reference') reference: string,
    @Body('token') token: string,
    @Body('username') username: string,
    @Body('planId') planId: string,
  ) {
    return this.paymentsService.processGooglePayToken(reference, token, username, planId);
  }

  @Post('applepay/charge')
  async chargeApplePay(
    @Body('reference') reference: string,
    @Body('token') token: Record<string, any>,
    @Body('username') username: string,
    @Body('planId') planId: string,
  ) {
    return this.paymentsService.processApplePayToken(reference, token, username, planId);
  }

  @Post('applepay/validate-session')
  async validateAppleSession(@Body('validationUrl') validationUrl: string) {
    return this.paymentsService.validateAppleSession(validationUrl);
  }

  @Post('sandbox/trigger-webhook')
  async triggerSandboxWebhook(
    @Body('provider') provider: string,
    @Body('reference') reference: string,
  ) {
    return this.paymentsService.triggerSandboxWebhook(provider, reference);
  }

  @Post('webhooks/:provider')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Param('provider') provider: string,
    @Headers('x-paystack-signature') paystackSig: string,
    @Headers('monnify-signature') moniepointSig: string,
    @Headers('authorization') authorizationHeader: string,
    @Headers('stripe-signature') stripeSig: string,
    @Headers('kuda-signature') kudaSig: string,
    @Headers('signature') alipayRawSig: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    // Determine the signature
    let signature = '';
    const lower = provider.toLowerCase();
    if (lower === 'paystack' || lower === 'verve') {
      signature = paystackSig;
    } else if (lower === 'moniepoint') {
      // Monnify sends webhook signature in monnify-signature header
      signature = moniepointSig;
    } else if (lower === 'opay') {
      // OPay sends HMAC-SHA512 in Authorization: Bearer {hash}
      signature = authorizationHeader ? authorizationHeader.replace('Bearer ', '') : '';
    } else if (lower === 'stripe' || lower === 'mastercard') {
      signature = stripeSig;
    } else if (lower === 'kuda') {
      signature = kudaSig;
    } else if (lower === 'alipay') {
      // Alipay+ sends: "algorithm=RSA256,keyVersion=1,signature={base64}"
      signature = alipayRawSig;
    }

    // Capture raw body for verification if needed. 
    // Fall back to JSON stringification if raw body middleware is not enabled.
    const rawBodyString = (req as any).rawBody || JSON.stringify(body);

    return this.paymentsService.handleWebhook(provider, body, rawBodyString, signature);
  }
}
