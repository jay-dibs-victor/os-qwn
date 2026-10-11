/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as supertest from 'supertest';
const request = supertest.default || supertest;
import { AccountsModule } from '../src/accounts.module';
import { AccountStatus, KycTier } from '../src/entities/account.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Accounts Service (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'accounts_e2e',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        AccountsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  let accountNumber: string;

  it('/accounts (POST) - Create Account', async () => {
    const response = await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Jane Doe',
        type: 'SAVINGS',
        customerId: 'cust-999',
        tenantId: 'tenant-1',
        kycTier: 'TIER_1',
      })
      .expect(201);

    expect(response.body.accountNumber).toHaveLength(10);
    accountNumber = response.body.accountNumber;
  });

  it('/accounts/:accountNumber/check-restriction (GET) - Check ACTIVE', async () => {
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-restriction`)
      .query({ type: 'DEBIT' })
      .expect(200);
  });

  it('/accounts/:accountNumber/check-restriction (GET) - Block PND', async () => {
    // 1. Set to PND
    await request(app.getHttpServer())
      .patch(`/accounts/${accountNumber}/status`)
      .send({ status: AccountStatus.PND })
      .expect(200);

    // 2. Check DEBIT - should fail
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-restriction`)
      .query({ type: 'DEBIT' })
      .expect(400);

    // 3. Reset to ACTIVE
    await request(app.getHttpServer())
      .patch(`/accounts/${accountNumber}/status`)
      .send({ status: AccountStatus.ACTIVE })
      .expect(200);
  });

  it('/accounts/:accountNumber/check-kyc-limits (GET) - Enforce Tier 1 Limit', async () => {
    // Tier 1 Limit is 50k

    // 1. Below limit - OK
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-kyc-limits`)
      .query({ amount: 10000 })
      .expect(200);

    // 2. Above limit - Fail
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-kyc-limits`)
      .query({ amount: 60000 })
      .expect(400);
  });

  it('/accounts/:accountNumber/check-kyc-limits (GET) - Enforce Daily Limit', async () => {
    // Tier 1 Daily Limit is 500k

    // Mock ledger-service to return 490k daily total
    mockedAxios.get.mockResolvedValueOnce({
      data: 490000,
    });

    // 1. 20k more should fail (490 + 20 = 510 > 500)
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-kyc-limits`)
      .query({ amount: 20000 })
      .expect(400);

    // 2. 5k more should pass (490 + 5 = 495 < 500)
    mockedAxios.get.mockResolvedValueOnce({
      data: 490000,
    });
    await request(app.getHttpServer())
      .get(`/accounts/${accountNumber}/check-kyc-limits`)
      .query({ amount: 5000 })
      .expect(200);
  });
});
