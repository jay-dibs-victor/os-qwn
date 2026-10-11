import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsModule } from '../src/accounts.module';
import { AccountsService } from '../src/accounts.service';
import { AccountStatus, AccountType } from '../src/entities/account.entity';
import { CurrencyService } from '../src/currency.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Accounts Integration (e2e)', () => {
  let app: INestApplication;
  let accountsService: AccountsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'accounts_test',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        AccountsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    accountsService = app.get<AccountsService>(AccountsService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should create an account with a valid NUBAN', async () => {
    const account = await accountsService.createAccount({
      name: 'Test Customer',
      type: AccountType.SAVINGS,
      customerId: 'cust-123',
      tenantId: 'tenant-1',
    });

    expect(account.accountNumber).toHaveLength(10);
    expect(account.status).toBe(AccountStatus.ACTIVE);
    expect(account.currency).toBe('NGN');
  });

  it('should enforce PND restrictions', async () => {
    const account = await accountsService.createAccount({
      name: 'Restricted Customer',
      type: AccountType.CURRENT,
      customerId: 'cust-456',
      tenantId: 'tenant-1',
    });

    // 1. Set to PND
    await accountsService.updateStatus(
      account.accountNumber,
      AccountStatus.PND,
    );

    // 2. Check restriction for DEBIT - should fail
    await expect(
      accountsService.checkRestriction(account.accountNumber, 'DEBIT'),
    ).rejects.toThrow(BadRequestException);

    // 3. Check restriction for CREDIT - should pass
    await expect(
      accountsService.checkRestriction(account.accountNumber, 'CREDIT'),
    ).resolves.not.toThrow();
  });

  it('should enforce PNC restrictions', async () => {
    const account = await accountsService.createAccount({
      name: 'Credit Restricted',
      type: AccountType.CURRENT,
      customerId: 'cust-789',
      tenantId: 'tenant-1',
    });

    // 1. Set to PNC
    await accountsService.updateStatus(
      account.accountNumber,
      AccountStatus.PNC,
    );

    // 2. Check restriction for CREDIT - should fail
    await expect(
      accountsService.checkRestriction(account.accountNumber, 'CREDIT'),
    ).rejects.toThrow(BadRequestException);

    // 3. Check restriction for DEBIT - should pass
    await expect(
      accountsService.checkRestriction(account.accountNumber, 'DEBIT'),
    ).resolves.not.toThrow();
  });

  it('should fetch exchange rates via CurrencyService', async () => {
    const currencyService = app.get<CurrencyService>(CurrencyService);

    mockedAxios.get.mockResolvedValueOnce({
      data: {
        result: 'success',
        base_code: 'USD',
        rates: { NGN: 750, GBP: 0.8 },
      },
    });

    const rates = (await currencyService.getExchangeRate('USD')) as Record<
      string,
      number
    >;
    expect(rates.NGN).toBe(750);
  });
});
