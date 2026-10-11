import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  ScheduledPayment,
  ScheduleFrequency,
} from './entities/scheduled-payment.entity';
import { PaymentServiceService } from './payment-service.service';
import { PaymentRail } from './constants/enums';

@Injectable()
export class ScheduledPaymentService {
  private readonly logger = new Logger(ScheduledPaymentService.name);

  constructor(
    @InjectRepository(ScheduledPayment)
    private readonly scheduledPaymentRepo: Repository<ScheduledPayment>,
    private readonly paymentService: PaymentServiceService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processScheduledPayments() {
    this.logger.log('Processing scheduled payments...');

    const duePayments = await this.scheduledPaymentRepo.find({
      where: {
        isActive: true,
        nextRunAt: LessThanOrEqual(new Date()),
      },
    });

    for (const schedule of duePayments) {
      try {
        this.logger.log(
          `Executing scheduled payment for tenant ${schedule.tenantId}`,
        );

        // Generate a unique idempotency key for this run
        const runIdempotencyKey = `scheduled:${schedule.id}:${schedule.nextRunAt.toISOString()}`;

        let rail = PaymentRail.INTERNAL;
        if (schedule.targetBankCode) {
          rail =
            schedule.amount >= 50000000 ? PaymentRail.RTGS : PaymentRail.NIBSS;
        }

        await this.paymentService.processPayment(
          {
            sourceAccountId: schedule.sourceAccountId,
            targetAccountId: schedule.targetAccountId,
            targetBankCode: schedule.targetBankCode,
            amount: schedule.amount,
            currency: schedule.currency,
            rail,
            tenantId: schedule.tenantId,
          },
          runIdempotencyKey,
        );

        // Update schedule for next run
        schedule.lastRunAt = new Date();
        schedule.nextRunAt = this.calculateNextRun(
          schedule.nextRunAt,
          schedule.frequency,
        );

        if (schedule.endDate && schedule.nextRunAt > schedule.endDate) {
          schedule.isActive = false;
        }

        await this.scheduledPaymentRepo.save(schedule);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Failed to execute scheduled payment ${schedule.id}: ${message}`,
        );
      }
    }
  }

  private calculateNextRun(current: Date, frequency: ScheduleFrequency): Date {
    const next = new Date(current);
    if (frequency === ScheduleFrequency.DAILY) {
      next.setDate(next.getDate() + 1);
    } else if (frequency === ScheduleFrequency.WEEKLY) {
      next.setDate(next.getDate() + 7);
    } else if (frequency === ScheduleFrequency.MONTHLY) {
      next.setMonth(next.getMonth() + 1);
    }
    return next;
  }
}
