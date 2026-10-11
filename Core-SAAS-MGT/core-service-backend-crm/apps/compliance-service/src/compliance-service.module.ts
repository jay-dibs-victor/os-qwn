import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from '@app/common';
import { ComplianceServiceController } from './compliance-service.controller';
import { ComplianceServiceService } from './compliance-service.service';
import { AmlRuleEvaluatorService } from './aml-rule-evaluator.service';
import { ComplianceEventsPublisher } from './compliance-events.publisher';
import { SanctionsScreeningService } from './sanctions-screening.service';
import { AmlRule } from './entities/aml-rule.entity';
import { ComplianceAlert } from './entities/compliance-alert.entity';
import { MonitoredTransaction } from './entities/monitored-transaction.entity';
import { SuspiciousActivityReport } from './entities/suspicious-activity-report.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/compliance-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([
      AmlRule,
      ComplianceAlert,
      MonitoredTransaction,
      SuspiciousActivityReport,
    ]),
  ],
  controllers: [ComplianceServiceController],
  providers: [
    ComplianceServiceService,
    AmlRuleEvaluatorService,
    ComplianceEventsPublisher,
    SanctionsScreeningService,
  ],
})
export class ComplianceServiceModule {}
