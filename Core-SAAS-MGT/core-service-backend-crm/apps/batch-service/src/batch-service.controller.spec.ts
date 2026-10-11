import { Test, TestingModule } from '@nestjs/testing';
import { BatchServiceController } from './batch-service.controller';
import { BatchServiceService } from './batch-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BatchJob } from './entities/batch-job.entity';
import { BatchItem } from './entities/batch-item.entity';
import { BatchProcessorService } from './batch-processor.service';

describe('BatchServiceController', () => {
  let batchServiceController: BatchServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [BatchServiceController],
      providers: [
        BatchServiceService,
        {
          provide: getRepositoryToken(BatchJob),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(BatchItem),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: BatchProcessorService,
          useValue: { processBatch: jest.fn() },
        },
      ],
    }).compile();

    batchServiceController = app.get<BatchServiceController>(
      BatchServiceController,
    );
  });

  it('should be defined', () => {
    expect(batchServiceController).toBeDefined();
  });
});
