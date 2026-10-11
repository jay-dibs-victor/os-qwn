import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { GlAccount } from './entities/gl-account.entity';
import { LedgerEvent } from './entities/ledger-event.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { TrialBalanceSnapshot } from './entities/trial-balance-snapshot.entity';
import { CommissionRule } from './entities/commission-rule.entity';
import { TripFinancialRecord } from './entities/trip-financial-record.entity';
import { EscrowWallet } from './entities/escrow-wallet.entity';
import { CoinWallet } from './entities/coin-wallet.entity';
import { CoinTransaction } from './entities/coin-transaction.entity';
import { AccountBalanceOutbox } from './entities/account-balance-outbox.entity';
import { GlAccountsRepository } from './repositories/gl-accounts.repository';
import { GlAccountsService } from './gl-accounts.service';
import { GlAccountsController } from './gl-accounts.controller';
import { PostingController } from './posting.controller';
import { TransactionsController } from './transactions.controller';
import { RevenueController } from './revenue.controller';
import { CommissionController } from './commission.controller';
import { AuditController } from './audit.controller';
import { LedgerEventsRepository } from './repositories/ledger-events.repository';
import { EventStoreService } from './event-store.service';
import { PostingEngineService } from './posting-engine.service';
import { LedgerEntriesRepository } from './repositories/ledger-entries.repository';
import { BatchPostingService } from './batch-posting.service';
import { EodService } from './eod.service';
import { RevenueRecognitionService } from './revenue-recognition.service';
import { CommissionEngineService } from './commission-engine.service';
import { AuditService } from './audit.service';
import { EscrowService } from './services/escrow.service';
import { EscrowController } from './controllers/escrow.controller';
import { TenantDriverRemittanceConfig } from './entities/tenant-driver-remittance-config.entity';
import { SiteWideFareConfig } from './entities/site-wide-fare-config.entity';
import { TenantRemittanceConfigService } from './services/tenant-remittance-config.service';
import { TenantRemittanceConfigController } from './controllers/tenant-remittance-config.controller';
import { SiteWideFareConfigService } from './services/site-wide-fare-config.service';
import { SiteWideFareConfigController } from './controllers/site-wide-fare-config.controller';
import { CoinRewardService } from './coin-reward.service';
import { CoinRewardController } from './controllers/coin-reward.controller';
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
        ACCOUNTS_SERVICE_HOST: Joi.string().required(),
        ACCOUNTS_SERVICE_PORT: Joi.number().required(),
      }),
      envFilePath: './apps/ledger-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      GlAccount,
      LedgerEvent,
      JournalEntry,
      LedgerEntry,
      TrialBalanceSnapshot,
      CommissionRule,
      TripFinancialRecord,
      EscrowWallet,
      TenantDriverRemittanceConfig,
      SiteWideFareConfig,
      CoinWallet,
      CoinTransaction,
      AccountBalanceOutbox,
    ]),
  ],
  controllers: [
    GlAccountsController,
    PostingController,
    TransactionsController,
    RevenueController,
    CommissionController,
    AuditController,
    EscrowController,
    TenantRemittanceConfigController,
    SiteWideFareConfigController,
    CoinRewardController,
  ],
  providers: [
    GlAccountsService,
    GlAccountsRepository,
    EventStoreService,
    LedgerEventsRepository,
    LedgerEntriesRepository,
    PostingEngineService,
    BatchPostingService,
    EodService,
    RevenueRecognitionService,
    CommissionEngineService,
    AuditService,
    EscrowService,
    TenantRemittanceConfigService,
    SiteWideFareConfigService,
    CoinRewardService,
    DatabaseSeeder,
  ],
})
export class LedgerServiceModule {}
