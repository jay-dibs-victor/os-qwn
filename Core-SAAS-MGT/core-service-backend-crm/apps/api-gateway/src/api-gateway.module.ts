import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { RmqModule } from '@app/common';
import {
  AuthProxyMiddleware,
  RbacProxyMiddleware,
  ApprovalProxyMiddleware,
  LedgerProxyMiddleware,
  AccountsProxyMiddleware,
  PaymentProxyMiddleware,
  BatchProxyMiddleware,
  ReversalProxyMiddleware,
  RetryProxyMiddleware,
  KycProxyMiddleware,
  ComplianceProxyMiddleware,
  AuditProxyMiddleware,
  LoanProxyMiddleware,
  CustomerProxyMiddleware,
  WalletProxyMiddleware,
  OverdraftProxyMiddleware,
  NotificationProxyMiddleware,
} from './middleware/proxy.middleware';
import { ApprovalMiddleware } from './middleware/approval.middleware';
import { TenantValidationMiddleware } from './middleware/tenant-validation.middleware';
import { OAuthTokenMiddleware } from './middleware/oauth-token.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        RABBITMQ_URI: Joi.string().required(),
        AUTH_SERVICE_HOST: Joi.string().default('localhost'),
        AUTH_SERVICE_PORT: Joi.number().required(),
        RBAC_SERVICE_HOST: Joi.string().required(),
        RBAC_SERVICE_PORT: Joi.number().required(),
        APPROVAL_SERVICE_HOST: Joi.string().required(),
        APPROVAL_SERVICE_PORT: Joi.number().required(),
        LEDGER_SERVICE_HOST: Joi.string().required(),
        LEDGER_SERVICE_PORT: Joi.number().required(),
        ACCOUNTS_SERVICE_HOST: Joi.string().required(),
        ACCOUNTS_SERVICE_PORT: Joi.number().required(),
        PAYMENT_SERVICE_HOST: Joi.string().required(),
        PAYMENT_SERVICE_PORT: Joi.number().required(),
        BATCH_SERVICE_HOST: Joi.string().required(),
        BATCH_SERVICE_PORT: Joi.number().required(),
        REVERSAL_SERVICE_HOST: Joi.string().required(),
        REVERSAL_SERVICE_PORT: Joi.number().required(),
        RETRY_SERVICE_HOST: Joi.string().required(),
        RETRY_SERVICE_PORT: Joi.number().required(),
        KYC_SERVICE_HOST: Joi.string().required(),
        KYC_SERVICE_PORT: Joi.number().required(),
        COMPLIANCE_SERVICE_HOST: Joi.string().required(),
        COMPLIANCE_SERVICE_PORT: Joi.number().required(),
        AUDIT_SERVICE_HOST: Joi.string().required(),
        AUDIT_SERVICE_PORT: Joi.number().required(),
        LOAN_SERVICE_HOST: Joi.string().required(),
        LOAN_SERVICE_PORT: Joi.number().required(),
        CUSTOMER_SERVICE_HOST: Joi.string().required(),
        CUSTOMER_SERVICE_PORT: Joi.number().required(),
        WALLET_SERVICE_HOST: Joi.string().default('localhost'),
        WALLET_SERVICE_PORT: Joi.number().default(3015),
        OVERDRAFT_SERVICE_HOST: Joi.string().required(),
        OVERDRAFT_SERVICE_PORT: Joi.number().required(),
        NOTIFICATION_SERVICE_HOST: Joi.string().default('localhost'),
        NOTIFICATION_SERVICE_PORT: Joi.number().default(3017),
      }),
      envFilePath: './apps/api-gateway/.env',
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'default-secret',
    }),
    RmqModule,
  ],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 1. OAuth Token Validation (must be first to extract OAuth context)
    consumer
      .apply(OAuthTokenMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 2. Tenant Validation (validates tenant from OAuth or JWT)
    consumer
      .apply(TenantValidationMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 3. Approval check
    consumer
      .apply(ApprovalMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // 4. Service Proxies
    consumer
      .apply(AuthProxyMiddleware)
      .forRoutes(
        { path: '/auth', method: RequestMethod.ALL },
        { path: '/auth/*path', method: RequestMethod.ALL },
        { path: '/scopes', method: RequestMethod.ALL },
        { path: '/scopes/*path', method: RequestMethod.ALL },
        { path: '/analytics', method: RequestMethod.ALL },
        { path: '/analytics/*path', method: RequestMethod.ALL },
        { path: '/customers', method: RequestMethod.ALL },
        { path: '/customers/*path', method: RequestMethod.ALL },
        { path: '/upload', method: RequestMethod.ALL },
        { path: '/upload/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(RbacProxyMiddleware)
      .forRoutes(
        { path: '/rbac', method: RequestMethod.ALL },
        { path: '/rbac/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(ApprovalProxyMiddleware)
      .forRoutes(
        { path: '/approval', method: RequestMethod.ALL },
        { path: '/approval/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(LedgerProxyMiddleware)
      .forRoutes(
        { path: '/ledger', method: RequestMethod.ALL },
        { path: '/ledger/*path', method: RequestMethod.ALL },
        { path: '/escrow', method: RequestMethod.ALL },
        { path: '/escrow/*path', method: RequestMethod.ALL },
        { path: '/site-wide-fare-config', method: RequestMethod.ALL },
        { path: '/site-wide-fare-config/*path', method: RequestMethod.ALL },
        { path: '/tenant-remittance-config', method: RequestMethod.ALL },
        { path: '/tenant-remittance-config/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(AccountsProxyMiddleware)
      .forRoutes(
        { path: '/accounts', method: RequestMethod.ALL },
        { path: '/accounts/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(PaymentProxyMiddleware)
      .forRoutes(
        { path: '/payments', method: RequestMethod.ALL },
        { path: '/payments/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(BatchProxyMiddleware)
      .forRoutes(
        { path: '/batch', method: RequestMethod.ALL },
        { path: '/batch/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(ReversalProxyMiddleware)
      .forRoutes(
        { path: '/reversal', method: RequestMethod.ALL },
        { path: '/reversal/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(RetryProxyMiddleware)
      .forRoutes(
        { path: '/retry', method: RequestMethod.ALL },
        { path: '/retry/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(KycProxyMiddleware)
      .forRoutes(
        { path: '/kyc', method: RequestMethod.ALL },
        { path: '/kyc/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(ComplianceProxyMiddleware)
      .forRoutes(
        { path: '/compliance', method: RequestMethod.ALL },
        { path: '/compliance/*path', method: RequestMethod.ALL },
        { path: '/aml-rules', method: RequestMethod.ALL },
        { path: '/aml-rules/*path', method: RequestMethod.ALL },
        { path: '/monitor', method: RequestMethod.ALL },
        { path: '/monitor/*path', method: RequestMethod.ALL },
        { path: '/sars', method: RequestMethod.ALL },
        { path: '/sars/*path', method: RequestMethod.ALL },
        { path: '/dashboard', method: RequestMethod.ALL },
        { path: '/dashboard/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(AuditProxyMiddleware)
      .forRoutes(
        { path: '/audit', method: RequestMethod.ALL },
        { path: '/audit/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(LoanProxyMiddleware)
      .forRoutes(
        { path: '/loans', method: RequestMethod.ALL },
        { path: '/loans/*path', method: RequestMethod.ALL },
        { path: '/loan-products', method: RequestMethod.ALL },
        { path: '/loan-products/*path', method: RequestMethod.ALL },
        { path: '/loan-applications', method: RequestMethod.ALL },
        { path: '/loan-applications/*path', method: RequestMethod.ALL },
        { path: '/loan-accounts', method: RequestMethod.ALL },
        { path: '/loan-accounts/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(CustomerProxyMiddleware)
      .forRoutes(
        { path: '/customer-accounts', method: RequestMethod.ALL },
        { path: '/customer-accounts/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(WalletProxyMiddleware)
      .forRoutes(
        { path: '/wallet', method: RequestMethod.ALL },
        { path: '/wallet/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(OverdraftProxyMiddleware)
      .forRoutes(
        { path: '/overdraft', method: RequestMethod.ALL },
        { path: '/overdraft/*path', method: RequestMethod.ALL },
      );

    consumer
      .apply(NotificationProxyMiddleware)
      .forRoutes(
        { path: '/mail-configs', method: RequestMethod.ALL },
        { path: '/mail-configs/*path', method: RequestMethod.ALL },
      );
  }
}
