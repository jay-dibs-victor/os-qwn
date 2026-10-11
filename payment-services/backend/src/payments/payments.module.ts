import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaystackProvider } from './providers/paystack.provider';
import { MoniepointProvider } from './providers/moniepoint.provider';
import { OPayProvider } from './providers/opay.provider';
import { PayPalProvider } from './providers/paypal.provider';
import { GooglePayProvider } from './providers/googlepay.provider';
import { ApplePayProvider } from './providers/applepay.provider';
import { StripeProvider } from './providers/stripe.provider';
import { KudaProvider } from './providers/kuda.provider';
import { AlipayProvider } from './providers/alipay.provider';

@Module({
  imports: [
    ConfigModule,
  ],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    PaystackProvider,
    MoniepointProvider,
    OPayProvider,
    PayPalProvider,
    GooglePayProvider,
    ApplePayProvider,
    StripeProvider,
    KudaProvider,
    AlipayProvider,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
