import axios from 'axios';

describe.skip('Comprehensive Financial Flow (E2E)', () => {
  const GATEWAY_URL = 'http://localhost:3000';
  const tenantId = 'SYSTEM';
  let glAccountCodes: Record<string, string> = {};

  const setupGlAccounts = async () => {
    const requiredAccounts = [
      { code: '1101', name: 'Cash at Bank', type: 'ASSET' },
      { code: '1201', name: 'Paystack Clearing Account', type: 'ASSET' },
      { code: '2101', name: 'Customer NGN Wallet', type: 'LIABILITY' },
      { code: '2202', name: 'Partner Commission Payable', type: 'LIABILITY' },
      { code: '2301', name: 'Driver Wallet Balance', type: 'LIABILITY' },
      { code: '2302', name: 'Driver Earnings Payable', type: 'LIABILITY' },
      { code: '2402', name: 'Unsettled Collections', type: 'LIABILITY' },
      { code: '4201', name: 'Trip Commission Revenue', type: 'INCOME' },
      { code: '4202', name: 'Partner Commission Revenue', type: 'INCOME' },
    ];

    const codes: Record<string, string> = {};

    for (const acc of requiredAccounts) {
      try {
        const res = await axios.post(
          `${GATEWAY_URL}/ledger/accounts`,
          acc,
          { headers: { 'x-tenant-id': tenantId } },
        );
        codes[acc.code] = res.data.id;
      } catch {
        const listRes = await axios.get(`${GATEWAY_URL}/ledger/accounts`, {
          params: { tenantId },
        });
        const found = listRes.data.find((a: any) => a.code === acc.code);
        if (found) {
          codes[acc.code] = found.id;
        }
      }
    }

    return codes;
  };

  const createAccount = async (customerId: string, currency: string = 'NGN') => {
    const res = await axios.post(`${GATEWAY_URL}/accounts`, {
      name: `Wallet ${customerId}`,
      type: 'SAVINGS',
      currency,
      customerId,
      tenantId,
      glAccountId: glAccountCodes['2101'],
    });
    return res.data as { accountNumber: string };
  };

  beforeAll(async () => {
    glAccountCodes = await setupGlAccounts();
  });

  describe('1. Trip Commission Calculation', () => {
    it('should calculate individual driver commissions', async () => {
      const res = await axios.get(`${GATEWAY_URL}/payments/trip/calculate-commission`, {
        params: {
          totalFare: 10000,
          platformRate: 0.10,
          partnerRate: 0.05,
          isCorporate: 'false',
        },
      });

      expect(res.data.totalFare).toBe(10000);
      expect(res.data.platformCommissionAmount).toBe(1000);
      expect(res.data.partnerCommissionAmount).toBe(0);
      expect(res.data.driverPayout).toBe(8850);
    });

    it('should calculate corporate driver commissions with partner split', async () => {
      const res = await axios.get(`${GATEWAY_URL}/payments/trip/calculate-commission`, {
        params: {
          totalFare: 20000,
          platformRate: 0.10,
          partnerRate: 0.05,
          isCorporate: 'true',
        },
      });

      expect(res.data.platformCommissionAmount).toBe(2000);
      expect(res.data.partnerCommissionAmount).toBe(1000);
      expect(res.data.driverPayout).toBe(16700);
    });
  });

  describe('2. Full Corporate Driver Payment Flow', () => {
    const tripId = `e2e-trip-corp-${Date.now()}`;
    const riderId = `rider-${Date.now()}`;
    const driverId = `driver-${Date.now()}`;
    const partnerId = `partner-${Date.now()}`;
    let riderAccount: { accountNumber: string };
    let driverAccount: { accountNumber: string };

    it('should create rider and driver accounts', async () => {
      riderAccount = await createAccount(riderId);
      driverAccount = await createAccount(driverId);
      expect(riderAccount.accountNumber).toBeDefined();
      expect(driverAccount.accountNumber).toBeDefined();
    });

    it('should fund rider wallet for trip payment', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/wallet/funding`,
        {
          accountNumber: riderAccount.accountNumber,
          amount: 50000,
          currency: 'NGN',
          description: 'E2E test funding',
          tenantId,
        },
      );
      expect(res.status).toBe(201);
    });

    it('should post a balanced journal entry simulating Paystack payment', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        {
          reference: `PAYSTACK-E2E-${tripId}`,
          description: `Paystack payment for trip ${tripId}`,
          postingDate: new Date(),
          currency: 'NGN',
          tenantId,
          entries: [
            {
              glAccountId: glAccountCodes['1201'],
              amount: 10000,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes['2402'],
              amount: 10000,
              side: 'CREDIT',
            },
          ],
        },
      );
      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
    });

    it('should post revenue allocation journal with commission splits', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        {
          reference: `TRIP-ALLOC-E2E-${tripId}`,
          description: `Revenue allocation for trip ${tripId}`,
          postingDate: new Date(),
          currency: 'NGN',
          tenantId,
          entries: [
            {
              glAccountId: glAccountCodes['2402'],
              amount: 10000,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes['4201'],
              amount: 1000,
              side: 'CREDIT',
            },
            {
              glAccountId: glAccountCodes['2202'],
              amount: 500,
              side: 'CREDIT',
              subLedgerId: partnerId,
              subLedgerType: 'PARTNER_ACCOUNT',
            },
            {
              glAccountId: glAccountCodes['2302'],
              amount: 8500,
              side: 'CREDIT',
              subLedgerId: driverId,
              subLedgerType: 'DRIVER_ACCOUNT',
            },
          ],
        },
      );
      expect(res.status).toBe(201);
    });

    it('should credit driver wallet from earnings payable', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        {
          reference: `DRV-CREDIT-E2E-${tripId}`,
          description: `Driver wallet credit for trip ${tripId}`,
          postingDate: new Date(),
          currency: 'NGN',
          tenantId,
          entries: [
            {
              glAccountId: glAccountCodes['2302'],
              amount: 8500,
              side: 'DEBIT',
              subLedgerId: driverId,
              subLedgerType: 'DRIVER_ACCOUNT',
            },
            {
              glAccountId: glAccountCodes['2301'],
              amount: 8500,
              side: 'CREDIT',
              subLedgerId: driverAccount.accountNumber,
              subLedgerType: 'CUSTOMER_ACCOUNT',
            },
          ],
        },
      );
      expect(res.status).toBe(201);
    });

    it('should post Paystack settlement to bank', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        {
          reference: `PAYSTACK-SETTLE-E2E-${tripId}`,
          description: `Paystack settlement to bank for trip ${tripId}`,
          postingDate: new Date(),
          currency: 'NGN',
          tenantId,
          entries: [
            {
              glAccountId: glAccountCodes['1101'],
              amount: 10000,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes['1201'],
              amount: 10000,
              side: 'CREDIT',
            },
          ],
        },
      );
      expect(res.status).toBe(201);
    });

    it('should settle partner commission payable', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        {
          reference: `PARTNER-SETTLE-E2E-${tripId}`,
          description: `Partner remittance for trip ${tripId}`,
          postingDate: new Date(),
          currency: 'NGN',
          tenantId,
          entries: [
            {
              glAccountId: glAccountCodes['2202'],
              amount: 500,
              side: 'DEBIT',
              subLedgerId: partnerId,
              subLedgerType: 'PARTNER_ACCOUNT',
            },
            {
              glAccountId: glAccountCodes['1101'],
              amount: 500,
              side: 'CREDIT',
            },
          ],
        },
      );
      expect(res.status).toBe(201);
    });
  });

  describe('3. Financial Audit & Reporting', () => {
    it('should return audit trail for a paystack reference', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/audit/trail/PAYSTACK-E2E-TEST`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
    });

    it('should return trial balance', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/audit/trial-balance`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(res.data.balanced).toBe(true);
    });

    it('should return profit and loss statement', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/audit/profit-loss`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(res.data.totalIncome).toBeGreaterThanOrEqual(0);
    });

    it('should return balance sheet', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/audit/balance-sheet`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
    });
  });

  describe('4. GL Account Verification', () => {
    it('should verify all journal entries are balanced', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/transactions`,
        { params: { tenantId, pageSize: 50 } },
      );
      expect(res.status).toBe(200);

      for (const journal of res.data.data) {
        let totalDebit = 0;
        let totalCredit = 0;
        for (const entry of journal.entries) {
          const amount = Number(entry.amount);
          if (entry.side === 'DEBIT') totalDebit += amount;
          else totalCredit += amount;
        }
        expect(Math.abs(totalDebit - totalCredit)).toBeLessThanOrEqual(0.001);
      }
    });

    it('should show correct GL account balances after all postings', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/accounts`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);

      const paystackClearing = res.data.find(
        (a: any) => a.code === '1201',
      );
      const unsettledCollections = res.data.find(
        (a: any) => a.code === '2402',
      );

      expect(paystackClearing).toBeDefined();
      expect(unsettledCollections).toBeDefined();
    });
  });

  describe('5. Revenue Recording via Service', () => {
    it('should record trip revenue through the revenue service', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/revenue/trip`,
        {
          tripId: `e2e-rev-${Date.now()}`,
          driverCustomerId: `e2e-driver-${Date.now()}`,
          riderCustomerId: `e2e-rider-${Date.now()}`,
          totalFare: 15000,
          platformCommissionRate: 0.10,
          tenantId,
        },
      );
      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.financialSummary.totalFare).toBe(15000);
      expect(res.data.journalEntries.length).toBeGreaterThanOrEqual(2);
    });

    it('should list trip financial records', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/revenue/trips`,
        { params: { tenantId, pageSize: 10 } },
      );
      expect(res.status).toBe(200);
      expect(res.data.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return revenue summary', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/revenue/summary`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(Number(res.data.grossRevenue)).toBeGreaterThan(0);
    });
  });

  describe('6. Commission Rules Management', () => {
    let ruleId: string;

    it('should create a commission rule', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/commissions/rules`,
        {
          tenantId,
          ruleType: 'PLATFORM',
          calculationMethod: 'PERCENTAGE',
          rate: 0.15,
          priority: 1,
          description: '15% premium platform commission',
        },
      );
      expect(res.status).toBe(201);
      ruleId = res.data.id;
    });

    it('should list commission rules', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/ledger/commissions/rules`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should calculate commissions using rules', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/ledger/commissions/calculate`,
        {
          amount: 10000,
          tenantId,
        },
      );
      expect(res.status).toBe(201);
      expect(res.data.breakdown.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('7. Partner Settlement Flow', () => {
    const partnerId = `e2e-partner-${Date.now()}`;
    let partnerAccount: { accountNumber: string };

    it('should create a partner settlement', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/partner-settlements`,
        {
          tenantId,
          partnerId,
          settlementType: 'COMMISSION',
          amount: 5000,
          description: 'E2E partner commission settlement',
        },
      );
      expect(res.status).toBe(201);
      expect(res.data.status).toBe('PENDING');
    });

    it('should create partner account for settlement payout', async () => {
      partnerAccount = await createAccount(partnerId);
      expect(partnerAccount.accountNumber).toBeDefined();
    });

    it('should settle partner (pay out)', async () => {
      const settlements = await axios.get(
        `${GATEWAY_URL}/partner-settlements`,
        { params: { tenantId, partnerId } },
      );

      if (settlements.data.data.length > 0) {
        const settlementId = settlements.data.data[0].id;

        const res = await axios.post(
          `${GATEWAY_URL}/partner-settlements/settle`,
          {
            settlementId,
            partnerAccountNumber: partnerAccount.accountNumber,
            tenantId,
          },
        );
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
      }
    });

    it('should get partner balance', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/partner-settlements/partner/${partnerId}/balance`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(res.data.partnerId).toBe(partnerId);
    });
  });

  describe('8. Driver Earnings Flow', () => {
    const driverId = `e2e-driver-earn-${Date.now()}`;
    const tripId = `e2e-trip-earn-${Date.now()}`;
    let driverEarningId: string;

    it('should record driver earning', async () => {
      const res = await axios.post(
        `${GATEWAY_URL}/driver-earnings/record`,
        {
          tenantId,
          driverCustomerId: driverId,
          tripId,
          tripFare: 12000,
          platformCommission: 1200,
          partnerCommission: 0,
          netEarnings: 10800,
          currency: 'NGN',
        },
      );
      expect(res.status).toBe(201);
      driverEarningId = res.data.id;
    });

    it('should get driver earnings summary', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/driver-earnings/driver/${driverId}`,
        { params: { tenantId } },
      );
      expect(res.status).toBe(200);
      expect(res.data.earnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should list all driver earnings', async () => {
      const res = await axios.get(
        `${GATEWAY_URL}/driver-earnings`,
        { params: { tenantId, pageSize: 10 } },
      );
      expect(res.status).toBe(200);
    });

    it('should payout driver', async () => {
      const driverAccount = await createAccount(driverId);

      const res = await axios.post(
        `${GATEWAY_URL}/driver-earnings/${driverEarningId}/payout`,
        {
          driverAccountNumber: driverAccount.accountNumber,
          tenantId,
        },
      );
      expect(res.status).toBe(201);
    });
  });

  describe('9. End-to-End Balance Verification', () => {
    it('should verify the accounting equation: Assets = Liabilities + Equity', async () => {
      const bs = await axios.get(
        `${GATEWAY_URL}/ledger/audit/balance-sheet`,
        { params: { tenantId } },
      );
      expect(bs.data.accountingEquation.balanced).toBe(true);
    });

    it('should verify trial balance is zero (debits = credits)', async () => {
      const tb = await axios.get(
        `${GATEWAY_URL}/ledger/audit/trial-balance`,
        { params: { tenantId } },
      );
      expect(tb.data.balanced).toBe(true);
      expect(Math.abs(tb.data.totalDebit - tb.data.totalCredit)).toBeLessThanOrEqual(0.01);
    });
  });
});
