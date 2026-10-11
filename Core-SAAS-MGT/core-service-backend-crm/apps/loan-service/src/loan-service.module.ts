import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { LoanServiceController } from './loan-service.controller';
import { LoanServiceService } from './loan-service.service';
import { LoanCalculationService } from './loan-calculation.service';
import { LoanEventsPublisher } from './loan-events.publisher';
import { LoanLedgerService } from './loan-ledger.service';
import { LoanProvisioningService } from './loan-provisioning.service';
import { LoanApplication } from './entities/loan-application.entity';
import { LoanAccount } from './entities/loan-account.entity';
import { LoanProduct } from './entities/loan-product.entity';
import { LoanProvision } from './entities/loan-provision.entity';
import { RepaymentSchedule } from './entities/repayment-schedule.entity';
import { DatabaseSeeder } from './database.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/loan-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      LoanApplication,
      LoanAccount,
      LoanProduct,
      LoanProvision,
      RepaymentSchedule,
    ]),
  ],
  controllers: [LoanServiceController],
  providers: [
    LoanServiceService,
    LoanCalculationService,
    LoanEventsPublisher,
    LoanLedgerService,
    LoanProvisioningService,
    DatabaseSeeder,
  ],
})
export class LoanServiceModule {}
