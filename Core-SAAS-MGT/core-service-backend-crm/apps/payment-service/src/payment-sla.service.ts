import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaymentInstruction } from './entities/payment-instruction.entity';
import { PaymentRail, PaymentStatus } from './constants/enums';

@Injectable()
export class PaymentSlaService {
  private readonly logger = new Logger(PaymentSlaService.name);

  // SLA Time-to-Live in milliseconds
  private readonly SLA_CONFIG = {
    [PaymentRail.INTERNAL]: 10000, // 10s
    [PaymentRail.NIBSS]: 30000, // 30s
    [PaymentRail.RTGS]: 120000, // 2m
    [PaymentRail.SWIFT]: 86400000, // 1d
  };

  constructor(
    @InjectRepository(PaymentInstruction)
    private readonly paymentInstructionRepo: Repository<PaymentInstruction>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async monitorSla() {
    this.logger.log('Running SLA monitoring for processing payments...');

    const processingPayments = await this.paymentInstructionRepo.find({
      where: { status: PaymentStatus.PROCESSING },
    });

    for (const payment of processingPayments) {
      const slaTtl = this.SLA_CONFIG[payment.rail] || 300000; // Default 5m
      const elapsed = Date.now() - new Date(payment.updatedAt).getTime();

      if (elapsed > slaTtl) {
        this.logger.warn(
          `SLA Breached: Payment ${payment.id} via ${payment.rail} has been processing for ${elapsed}ms`,
        );
        // In a real system, this would emit an alert or trigger a status re-check
        // For now, we log it.
      }
    }
  }
}
