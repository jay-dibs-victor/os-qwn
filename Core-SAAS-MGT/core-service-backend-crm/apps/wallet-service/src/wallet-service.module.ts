import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { WalletTransaction } from './entities/wallet-transaction.entity';
import { DriverEarning } from './entities/driver-earning.entity';
import { PartnerSettlement } from './entities/partner-settlement.entity';
import { DriverSavingsPlan } from './entities/driver-savings-plan.entity';
import { RemittanceSchedule } from './entities/remittance-schedule.entity';
import { DriverLedger } from './entities/driver-ledger.entity';
import { DriverDebt } from './entities/driver-debt.entity';
import { PaymentDispute } from './entities/payment-dispute.entity';
import { BankTransfer } from './entities/bank-transfer.entity';
import { FraudFlag } from './entities/fraud-flag.entity';
import { WalletServiceService } from './wallet-service.service';
import { WalletServiceController } from './wallet-service.controller';
import { DriverEarningsService } from './driver-earnings.service';
import { DriverEarningsController } from './driver-earnings.controller';
import { PartnerSettlementService } from './partner-settlement.service';
import { PartnerSettlementController } from './partner-settlement.controller';
import { DriverSavingsService } from './services/driver-savings.service';
import { DriverSavingsController } from './controllers/driver-savings.controller';
import { RemittanceService } from './services/remittance.service';
import { RemittanceController } from './controllers/remittance.controller';
import { RemittanceSchedulerService } from './services/remittance-scheduler.service';
import { SavingsDisbursementSchedulerService } from './services/savings-disbursement-scheduler.service';
import { SchedulerController } from './controllers/scheduler.controller';
import { DriverLedgerService } from './services/driver-ledger.service';
import { DriverLedgerController } from './controllers/driver-ledger.controller';
import { DriverDebtService } from './services/driver-debt.service';
import { DriverDebtController } from './controllers/driver-debt.controller';
import { DriverDebtRecordController } from './controllers/driver-debt-record.controller';
import { DisputeService } from './services/dispute.service';
import { DisputeController } from './controllers/dispute.controller';
import { BankTransferPaymentService } from './services/bank-transfer-payment.service';
import { BankTransferController } from './controllers/bank-transfer.controller';
import { FraudDetectionService } from './services/fraud-detection.service';
import { FraudDetectionController } from './controllers/fraud-detection.controller';
import { AutoSettlementService } from './services/auto-settlement.service';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        PORT: Joi.number().required(),
        ACCOUNTS_SERVICE_HOST: Joi.string().required(),
        ACCOUNTS_SERVICE_PORT: Joi.number().required(),
        LEDGER_SERVICE_HOST: Joi.string().required(),
        LEDGER_SERVICE_PORT: Joi.number().required(),
        CASH_GL_ACCOUNT_ID: Joi.string().optional(),
        QCOIN_DEPOSITS_GL_ACCOUNT_ID: Joi.string().required(),
      }),
      envFilePath: './apps/wallet-service/.env',
    }),
    DatabaseModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      WalletTransaction,
      DriverEarning,
      PartnerSettlement,
      DriverSavingsPlan,
      RemittanceSchedule,
      DriverLedger,
      DriverDebt,
      PaymentDispute,
      BankTransfer,
      FraudFlag,
    ]),
  ],
  controllers: [
    WalletServiceController,
    DriverEarningsController,
    PartnerSettlementController,
    DriverSavingsController,
    RemittanceController,
    SchedulerController,
    DriverLedgerController,
    DriverDebtController,
    DriverDebtRecordController,
    DisputeController,
    BankTransferController,
    FraudDetectionController,
  ],
  providers: [
    WalletServiceService,
    DriverEarningsService,
    PartnerSettlementService,
    DriverSavingsService,
    RemittanceService,
    RemittanceSchedulerService,
    SavingsDisbursementSchedulerService,
    DriverLedgerService,
    DriverDebtService,
    DisputeService,
    BankTransferPaymentService,
    FraudDetectionService,
    AutoSettlementService,
    DatabaseSeeder,
  ],
})
export class WalletServiceModule {}
