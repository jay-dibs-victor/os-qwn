import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchJob, BatchJobStatus } from './entities/batch-job.entity';
import { BatchItem, BatchItemStatus } from './entities/batch-item.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PaymentResponse {
  id: string;
}

@Injectable()
export class BatchProcessorService {
  private readonly logger = new Logger(BatchProcessorService.name);

  constructor(
    @InjectRepository(BatchJob)
    private readonly batchJobRepo: Repository<BatchJob>,
    @InjectRepository(BatchItem)
    private readonly batchItemRepo: Repository<BatchItem>,
    private readonly configService: ConfigService,
  ) {}

  async processBatch(jobId: string) {
    const job = await this.batchJobRepo.findOne({
      where: { id: jobId },
      relations: ['items'],
    });

    if (!job || job.status !== BatchJobStatus.PENDING) {
      return;
    }

    job.status = BatchJobStatus.PROCESSING;
    await this.batchJobRepo.save(job);

    const paymentHost = this.configService.get<string>('PAYMENT_SERVICE_HOST');
    const paymentPort = this.configService.get<number>('PAYMENT_SERVICE_PORT');
    const paymentUrl = `http://${paymentHost}:${paymentPort}/payments/internal-transfer`;

    for (const item of job.items) {
      if (item.status !== BatchItemStatus.PENDING) continue;

      try {
        const response = await axios.post<PaymentResponse>(paymentUrl, {
          sourceAccountId: item.sourceAccountId,
          destinationAccountId: item.destinationAccountId,
          amount: item.amount,
          currency: item.currency,
          reference: `BATCH-${job.id}-${item.id}`,
          tenantId: job.tenantId,
        });

        item.status = BatchItemStatus.COMPLETED;
        item.transactionId = response.data.id;
        job.successItems++;
      } catch (error: unknown) {
        item.status = BatchItemStatus.FAILED;
        if (axios.isAxiosError(error) && error.response) {
          item.errorDetails = JSON.stringify(error.response.data);
        } else {
          item.errorDetails =
            error instanceof Error ? error.message : String(error);
        }
        job.failedItems++;
      }

      item.processedAt = new Date();
      await this.batchItemRepo.save(item);

      job.processedItems++;
      await this.batchJobRepo.save(job);
    }

    job.status =
      job.failedItems > 0 ? BatchJobStatus.PARTIAL : BatchJobStatus.COMPLETED;
    job.completedAt = new Date();
    await this.batchJobRepo.save(job);

    this.logger.log(`Batch ${job.id} completed with status ${job.status}`);
  }
}
