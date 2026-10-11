import { Test, TestingModule } from '@nestjs/testing';
import { ReversalServiceController } from './reversal-service.controller';
import { ReversalServiceService } from './reversal-service.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReversalRecord } from './entities/reversal-record.entity';
import { ConfigService } from '@nestjs/config';
import { ReversalEventsPublisher } from './reversal-events.publisher';

describe('ReversalServiceController', () => {
  let reversalServiceController: ReversalServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReversalServiceController],
      providers: [
        ReversalServiceService,
        {
          provide: getRepositoryToken(ReversalRecord),
          useValue: { create: jest.fn(), save: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ReversalEventsPublisher,
          useValue: {
            publishInitiated: jest.fn(),
            publishCompleted: jest.fn(),
            publishFailed: jest.fn(),
            publishChargebackCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    reversalServiceController = app.get<ReversalServiceController>(
      ReversalServiceController,
    );
  });

  it('should be defined', () => {
    expect(reversalServiceController).toBeDefined();
  });
});
