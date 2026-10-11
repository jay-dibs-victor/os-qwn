import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RmqModule } from '@app/common';
import { PaymentInstruction } from './entities/payment-instruction.entity';
import { PaymentStatusLog } from './entities/payment-status-log.entity';
import { ScheduledPayment } from './entities/scheduled-payment.entity';
import { PaystackTransaction } from './entities/paystack-transaction.entity';
import { PaymentAccount } from './entities/payment-account.entity';
import { FleetContract } from './entities/fleet-contract.entity';
import { MarketplaceLedgerEntry } from './entities/marketplace-ledger.entity';
import { PaymentProviderConfig } from './entities/payment-provider-config.entity';
import { ProviderRegion } from './entities/provider-region.entity';
import { PaymentServiceController } from './payment-service.controller';
import { TripPaymentController } from './trip-payment.controller';
import { PaymentAccountController } from './payment-account.controller';
import { FleetContractController } from './fleet-contract.controller';
import { MarketplaceLedgerController } from './marketplace-ledger.controller';
import { PaymentProviderConfigController } from './payment-provider-config.controller';
import { ProviderRegionController } from './provider-region.controller';
import { PaymentGatewayRegistry } from './payment-gateway-registry.service';
import { StripeGateway } from './rails/stripe.gateway';
import { NibbsGateway } from './rails/nibbs-gateway.provider';
import { PaymentServiceService } from './payment-service.service';
import { TripPaymentService } from './trip-payment.service';
import { PaymentAccountService } from './payment-account.service';
import { FleetContractService } from './fleet-contract.service';
import { MarketplaceLedgerService } from './marketplace-ledger.service';
import { RemittanceScheduler } from './remittance-scheduler.service';
import { DatabaseSeeder } from './database.seeder';
import { SmartRoutingService } from './smart-routing.service';
import { NibssProvider } from './rails/nibss.provider';
import { RtgsProvider } from './rails/rtgs.provider';
import { SwiftProvider } from './rails/swift.provider';
import { PaystackProvider } from './rails/paystack.provider';
import { LiquidityService } from './liquidity.service';
import { PaymentEventsPublisher } from './payment-events.publisher';
import { PaymentSlaService } from './payment-sla.service';
import { ScheduledPaymentService } from './scheduled-payment.service';
import { EmailModule } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/payment-service/.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: (configService.get('POSTGRES_TYPE') || 'postgres') as 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: configService.get<number>('POSTGRES_PORT'),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      PaymentInstruction,
      PaymentStatusLog,
      ScheduledPayment,
      PaystackTransaction,
      PaymentAccount,
      FleetContract,
      MarketplaceLedgerEntry,
      PaymentProviderConfig,
      ProviderRegion,
    ]),
    ScheduleModule.forRoot(),
    RmqModule,
    EmailModule.forRoot('apps/payment-service/src/email/templates'),
  ],
  controllers: [
    PaymentProviderConfigController,
    ProviderRegionController,
    FleetContractController,
    MarketplaceLedgerController,
    PaymentAccountController,
    TripPaymentController,
    PaymentServiceController,
  ],
  providers: [
    PaymentServiceService,
    TripPaymentService,
    PaymentAccountService,
    FleetContractService,
    MarketplaceLedgerService,
    RemittanceScheduler,
    DatabaseSeeder,
    SmartRoutingService,
    NibssProvider,
    RtgsProvider,
    SwiftProvider,
    PaystackProvider,
    StripeGateway,
    NibbsGateway,
    PaymentGatewayRegistry,
    LiquidityService,
    PaymentEventsPublisher,
    PaymentSlaService,
    ScheduledPaymentService,
  ],
})
export class PaymentServiceModule {}
