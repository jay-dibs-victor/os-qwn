import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { Account } from './entities/account.entity';
import { AccountPostingLog } from './entities/account-posting-log.entity';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { AccountsRepository } from './repositories/accounts.repository';
import { AccountPostingLogsRepository } from './repositories/account-posting-logs.repository';
import { CurrencyService } from './currency.service';

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
        LEDGER_SERVICE_HOST: Joi.string().default('localhost'),
        LEDGER_SERVICE_PORT: Joi.number().default(3003),
      }),
      envFilePath: './apps/accounts-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Account, AccountPostingLog]),
  ],
  controllers: [AccountsController],
  providers: [
    AccountsService,
    AccountsRepository,
    AccountPostingLogsRepository,
    CurrencyService,
  ],
})
export class AccountsModule {}
