import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BatchJob, BatchJobStatus } from './entities/batch-job.entity';
import { BatchItem, BatchItemStatus } from './entities/batch-item.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { BatchProcessorService } from './batch-processor.service';

@Injectable()
export class BatchServiceService {
  private readonly logger = new Logger(BatchServiceService.name);

  constructor(
    @InjectRepository(BatchJob)
    private readonly batchJobRepo: Repository<BatchJob>,
    @InjectRepository(BatchItem)
    private readonly batchItemRepo: Repository<BatchItem>,
    private readonly batchProcessor: BatchProcessorService,
  ) {}

  async createBatch(dto: CreateBatchDto): Promise<BatchJob> {
    const totalAmount = dto.items.reduce((sum, item) => sum + item.amount, 0);
    this.logger.log(
      `Ingesting batch: ${dto.name} with ${dto.items.length} items. Total: ${totalAmount}`,
    );

    const job = this.batchJobRepo.create({
      name: dto.name,
      tenantId: dto.tenantId,
      createdBy: dto.createdBy,
      totalItems: dto.items.length,
      status: BatchJobStatus.PENDING,
    });

    const savedJob = await this.batchJobRepo.save(job);

    const items = dto.items.map((itemDto) =>
      this.batchItemRepo.create({
        ...itemDto,
        batchJob: savedJob,
        status: BatchItemStatus.PENDING,
      }),
    );

    await this.batchItemRepo.save(items);

    // If total amount is small, maybe auto-start?
    // But roadmap says "REQUIRE approval", so we wait for approval.
    return savedJob;
  }

  async executeBatch(id: string) {
    await this.getBatch(id);
    // In a real system, we would check if approvalId is present/valid here

    // Start processing asynchronously
    this.batchProcessor.processBatch(id).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Async batch processing failed: ${message}`);
    });

    return { message: 'Batch processing started', jobId: id };
  }

  async retryBatch(id: string) {
    const job = await this.getBatch(id);

    // Reset status to pending to allow reprocessing
    job.status = BatchJobStatus.PENDING;
    // We only reset failed items count, success items stay
    job.failedItems = 0;
    job.processedItems = job.successItems;
    await this.batchJobRepo.save(job);

    // Reset failed items status
    const failedItems = job.items.filter(
      (item) => item.status === BatchItemStatus.FAILED,
    );
    for (const item of failedItems) {
      item.status = BatchItemStatus.PENDING;
      await this.batchItemRepo.save(item);
    }

    this.batchProcessor.processBatch(id).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Async batch retry failed: ${message}`);
    });

    return { message: 'Batch retry started', jobId: id };
  }

  async getBatch(id: string): Promise<BatchJob> {
    const job = await this.batchJobRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!job) {
      throw new NotFoundException(`Batch job ${id} not found`);
    }
    return job;
  }
}
