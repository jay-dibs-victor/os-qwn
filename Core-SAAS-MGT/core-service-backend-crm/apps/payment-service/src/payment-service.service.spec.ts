import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { PaymentServiceService } from './payment-service.service';
import { PaymentInstruction } from './entities/payment-instruction.entity';
import { PaymentStatusLog } from './entities/payment-status-log.entity';
import { SmartRoutingService } from './smart-routing.service';
import { PaymentEventsPublisher } from './payment-events.publisher';
import { PaymentRail } from './constants/enums';
import { CreatePaymentDto } from './dto/create-payment.dto';

describe('PaymentServiceService', () => {
  let service: PaymentServiceService;
  let repo: { findOne: jest.Mock; create: jest.Mock; save: jest.Mock };

  const mockRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockPublisher = {
    publishInitiated: jest.fn(),
    publishCompleted: jest.fn(),
    publishFailed: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn((key: string) => {
      if (key === 'REDIS_HOST') return 'localhost';
      if (key === 'REDIS_PORT') return 6379;
      return null;
    }),
  };

  const mockSmartRouting = {
    executeExternalTransfer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentServiceService,
        { provide: getRepositoryToken(PaymentInstruction), useValue: mockRepo },
        { provide: getRepositoryToken(PaymentStatusLog), useValue: mockRepo },
        { provide: ConfigService, useValue: mockConfig },
        { provide: SmartRoutingService, useValue: mockSmartRouting },
        { provide: PaymentEventsPublisher, useValue: mockPublisher },
      ],
    }).compile();

    service = module.get<PaymentServiceService>(PaymentServiceService);
    repo = module.get(getRepositoryToken(PaymentInstruction));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processPayment', () => {
    it('should throw BadRequestException for amounts > 100k without approvalId', async () => {
      const dto: CreatePaymentDto = {
        sourceAccountId: 'acc1',
        targetAccountId: 'acc2',
        amount: 150000,
        currency: 'NGN',
        rail: PaymentRail.INTERNAL,
        tenantId: 'tenant1',
      };

      // Mock redis lock
      Object.defineProperty(service, 'redisClient', {
        value: {
          set: jest.fn().mockResolvedValue('OK'),
          del: jest.fn().mockResolvedValue(1),
        },
      });

      repo.findOne.mockResolvedValue(null);

      await expect(service.processPayment(dto, 'key1')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
