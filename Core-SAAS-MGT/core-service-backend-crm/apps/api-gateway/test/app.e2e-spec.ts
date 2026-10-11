import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ApiGatewayModule } from './../src/api-gateway.module';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication;

  beforeAll(() => {
    process.env.PORT = '3000';
    process.env.RABBITMQ_URI = 'amqp://localhost:5672';
    process.env.AUTH_SERVICE_HOST = 'localhost';
    process.env.AUTH_SERVICE_PORT = '3001';
    process.env.RBAC_SERVICE_HOST = 'localhost';
    process.env.RBAC_SERVICE_PORT = '3002';
    process.env.APPROVAL_SERVICE_HOST = 'localhost';
    process.env.APPROVAL_SERVICE_PORT = '3003';
    process.env.LEDGER_SERVICE_HOST = 'localhost';
    process.env.LEDGER_SERVICE_PORT = '3004';
    process.env.ACCOUNTS_SERVICE_HOST = 'localhost';
    process.env.ACCOUNTS_SERVICE_PORT = '3005';
    process.env.PAYMENT_SERVICE_HOST = 'localhost';
    process.env.PAYMENT_SERVICE_PORT = '3006';
    process.env.BATCH_SERVICE_HOST = 'localhost';
    process.env.BATCH_SERVICE_PORT = '3007';
    process.env.REVERSAL_SERVICE_HOST = 'localhost';
    process.env.REVERSAL_SERVICE_PORT = '3008';
    process.env.RETRY_SERVICE_HOST = 'localhost';
    process.env.RETRY_SERVICE_PORT = '3009';
    process.env.KYC_SERVICE_HOST = 'localhost';
    process.env.KYC_SERVICE_PORT = '3010';
    process.env.COMPLIANCE_SERVICE_HOST = 'localhost';
    process.env.COMPLIANCE_SERVICE_PORT = '3011';
    process.env.AUDIT_SERVICE_HOST = 'localhost';
    process.env.AUDIT_SERVICE_PORT = '3012';
    process.env.LOAN_SERVICE_HOST = 'localhost';
    process.env.LOAN_SERVICE_PORT = '3013';
    process.env.CUSTOMER_SERVICE_HOST = 'localhost';
    process.env.CUSTOMER_SERVICE_PORT = '3014';
    process.env.OVERDRAFT_SERVICE_HOST = 'localhost';
    process.env.OVERDRAFT_SERVICE_PORT = '3016';
  });

  beforeEach(async () => {
    // Mock tenant validation to succeed
    mockedAxios.get.mockResolvedValue({
      data: { tenantId: 'test-tenant', isActive: true, isRoot: false },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiGatewayModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
 
  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('X-Tenant-ID', 'test-tenant')
      .expect(200)
      .expect('Hello World!');
  });
});
