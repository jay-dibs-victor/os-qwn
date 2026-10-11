/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerServiceModule } from '../src/ledger-service.module';
import { PostingEngineService } from '../src/posting-engine.service';
import { EodService } from '../src/eod.service';
import { EntrySide } from '../src/entities/ledger-entry.entity';
import { GlAccountsService } from '../src/gl-accounts.service';
import { GlAccountType, GlAccount } from '../src/entities/gl-account.entity';
import { TrialBalanceSnapshot } from '../src/entities/trial-balance-snapshot.entity';
import axios from 'axios';

describe('Ledger Integration (e2e)', () => {
  let app: INestApplication;
  let postingService: PostingEngineService;
  let eodService: EodService;
  let glAccountsService: GlAccountsService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'ledger_test',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        LedgerServiceModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    postingService = app.get<PostingEngineService>(PostingEngineService);
    eodService = app.get<EodService>(EodService);
    glAccountsService = app.get<GlAccountsService>(GlAccountsService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  let sharedAcc1: GlAccount;
  let sharedAcc2: GlAccount;

  it('should post a balanced transaction and pass EOD check', async () => {
    const tenantId = 'test-tenant';

    // 1. Create two accounts
    sharedAcc1 = await glAccountsService.createGlAccount({
      code: '1001',
      name: 'Cash',
      type: GlAccountType.ASSET,
      tenantId,
    });

    sharedAcc2 = await glAccountsService.createGlAccount({
      code: '2001',
      name: 'Equity',
      type: 'equity' as any,
      tenantId,
    });

    // 2. Post a transfer (Debit Cash, Credit Equity)
    await postingService.postTransaction({
      reference: 'INITIAL_FUNDING',
      description: 'Initial capital funding',
      postingDate: new Date(),
      tenantId,
      entries: [
        { glAccountId: sharedAcc1.id, amount: 1000, side: EntrySide.DEBIT },
        { glAccountId: sharedAcc2.id, amount: 1000, side: EntrySide.CREDIT },
      ],
    });

    // 3. Verify balances
    const cashAcc: GlAccount = await glAccountsService.getGlAccount(sharedAcc1.id, tenantId);
    const equityAcc: GlAccount = await glAccountsService.getGlAccount(sharedAcc2.id, tenantId);

    expect(Number(cashAcc.balance)).toBe(1000);
    expect(Number(equityAcc.balance)).toBe(-1000);

    // 4. Run EOD
    const snapshot: TrialBalanceSnapshot =
      await eodService.processEndOfDay(tenantId);
    expect(Number(snapshot.totalDebit)).toBe(1000);
    expect(Number(snapshot.totalCredit)).toBe(1000);
  });

  it('should block transaction if account is restricted (PND)', async () => {
    const tenantId = 'test-tenant';
    const acc1: GlAccount = await glAccountsService.getGlAccount(sharedAcc1.id, tenantId);

    // Mock axios to return error for PND
    (axios.get as jest.Mock).mockRejectedValueOnce({
      response: {
        data: { message: 'Debit restricted on account (Status: PND)' },
      },
    });

    await expect(
      postingService.postTransaction({
        reference: 'RESTRICTED_TX',
        description: 'Should fail',
        postingDate: new Date(),
        tenantId,
        entries: [
          {
            glAccountId: acc1.id,
            amount: 100,
            side: EntrySide.DEBIT,
            subLedgerId: 'restricted-acc',
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
          { glAccountId: acc1.id, amount: 100, side: EntrySide.CREDIT },
        ],
      }),
    ).rejects.toThrow('Debit restricted on account (Status: PND)');
  });
});
