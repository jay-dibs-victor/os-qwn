/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

import { getRepositoryToken } from '@nestjs/typeorm';
import { PaymentServiceController } from './../src/payment-service.controller';
import { PaymentServiceService } from './../src/payment-service.service';
import { SmartRoutingService } from './../src/smart-routing.service';
import { NibssProvider } from './../src/rails/nibss.provider';
import { RtgsProvider } from './../src/rails/rtgs.provider';
import { SwiftProvider } from './../src/rails/swift.provider';
import { PaystackProvider } from './../src/rails/paystack.provider';
import { LiquidityService } from './../src/liquidity.service';
import { PaymentEventsPublisher } from './../src/payment-events.publisher';
import { PaymentSlaService } from './../src/payment-sla.service';
import { ScheduledPaymentService } from './../src/scheduled-payment.service';
import { PaymentInstruction } from './../src/entities/payment-instruction.entity';
import { ScheduledPayment } from './../src/entities/scheduled-payment.entity';
import { PaymentStatusLog } from './../src/entities/payment-status-log.entity';
import { PaymentStatus } from './../src/constants/enums';

describe('PaymentService (e2e)', () => {
  let app: INestApplication;
  let service: PaymentServiceService;

  const mockPaymentRepo = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((entity) => {
      if (!entity.id) entity.id = 'mock-id-123';
      entity.createdAt = new Date();
      entity.updatedAt = new Date();
      return Promise.resolve(entity);
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PaymentServiceController],
      providers: [
        PaymentServiceService,
        SmartRoutingService,
        NibssProvider,
        RtgsProvider,
        SwiftProvider,
        { provide: PaystackProvider, useValue: { processPayment: jest.fn() } },
        LiquidityService,
        PaymentEventsPublisher,
        { provide: PaymentSlaService, useValue: { monitor: jest.fn() } },
        { provide: ScheduledPaymentService, useValue: { process: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn(() => 'mock') } },
        {
          provide: getRepositoryToken(PaymentInstruction),
          useValue: mockPaymentRepo,
        },
        {
          provide: getRepositoryToken(ScheduledPayment),
          useValue: mockPaymentRepo,
        },
        {
          provide: getRepositoryToken(PaymentStatusLog),
          useValue: mockPaymentRepo,
        },
      ],
    }).compile();

    service = moduleFixture.get<PaymentServiceService>(PaymentServiceService);

    // Mock axios for account checks and ledger posting
    mockedAxios.get.mockResolvedValue({ data: { restricted: false, glAccountId: 'gl-001', isActive: true } });
    mockedAxios.post.mockResolvedValue({ data: { id: 'txn-123' } });

    // Mock redis client
    Object.defineProperty(service, 'redisClient', {
      value: {
        set: jest.fn().mockResolvedValue('OK'),
        del: jest.fn().mockResolvedValue(1),
        on: jest.fn(),
      },
      configurable: true,
    });

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('/payments (POST) - should initiate a payment', () => {
    const payload = {
      sourceAccountId: 'acc1',
      targetAccountId: 'acc2',
      amount: 1000,
      currency: 'NGN',
      rail: 'INTERNAL',
      tenantId: 'tenant1',
    };

    return request(app.getHttpServer())
      .post('/payments')
      .set('idempotency-key', 'unique-key-1')
      .send(payload)
      .expect(201)
      .then((response) => {
        expect(response.body.id).toBeDefined();
        expect(response.body.status).toBe(PaymentStatus.COMPLETED);
      });
  });

  it('/payments/:id (GET) - should return payment details', () => {
    mockPaymentRepo.findOne.mockResolvedValue({
      id: 'mock-id-123',
      amount: 1000,
      status: PaymentStatus.COMPLETED,
    });

    return request(app.getHttpServer())
      .get('/payments/mock-id-123')
      .expect(200)
      .then((response) => {
        expect(response.body.id).toBe('mock-id-123');
      });
  });

  it('/payments (GET) - should list payments', () => {
    mockPaymentRepo.find.mockResolvedValue([
      { id: 'p1', amount: 500 },
      { id: 'p2', amount: 1500 },
    ]);

    return request(app.getHttpServer())
      .get('/payments')
      .expect(200)
      .then((response) => {
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(2);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
