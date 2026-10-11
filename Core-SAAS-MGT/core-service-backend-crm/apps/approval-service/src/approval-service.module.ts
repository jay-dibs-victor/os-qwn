import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { ApprovalServiceController } from './approval-service.controller';
import { ApprovalServiceService } from './approval-service.service';
import { ApprovalConfig } from './entities/approval-config.entity';
import { ApprovalRequest } from './entities/approval-request.entity';
import { ApprovalStep } from './entities/approval-step.entity';
import { ApprovalConfigsRepository } from './repositories/approval-configs.repository';
import { ApprovalRequestsRepository } from './repositories/approval-requests.repository';
import { ApprovalStepsRepository } from './repositories/approval-steps.repository';

import { SeedService } from './seed.service';

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
        API_GATEWAY_URL: Joi.string().required(),
      }),
      envFilePath: './apps/approval-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([ApprovalConfig, ApprovalRequest, ApprovalStep]),
  ],
  controllers: [ApprovalServiceController],
  providers: [
    ApprovalServiceService,
    ApprovalConfigsRepository,
    ApprovalRequestsRepository,
    ApprovalStepsRepository,
    SeedService,
  ],
})
export class ApprovalServiceModule {}
