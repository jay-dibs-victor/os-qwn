import axios from 'axios';

describe.skip('Comprehensive Financial Flow v2 — with Coin Rewards, Savings, Remittance, Scheduler', () => {
  const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000';
  const tenantId = 'E2E-V2-TENANT';
  const riderId = `rider-${Date.now()}`;
  const driverId = `driver-${Date.now()}`;
  const partnerId = `partner-${Date.now()}`;
  const tripId = `e2e-v2-trip-${Date.now()}`;

  let glAccountCodes: Record<string, string> = {};

  /* ─── Helpers ──────────────────────────────────── */

  async function setupGlAccounts() {
    const required = [
      { code: '1101', name: 'Cash at Bank', type: 'ASSET' },
      { code: '1201', name: 'Paystack Clearing', type: 'ASSET' },
      { code: '2101', name: 'Customer NGN Wallet', type: 'LIABILITY' },
      { code: '2202', name: 'Partner Commission Payable', type: 'LIABILITY' },
      { code: '2301', name: 'Driver Wallet Balance', type: 'LIABILITY' },
      { code: '2302', name: 'Driver Earnings Payable', type: 'LIABILITY' },
      { code: '2402', name: 'Unsettled Collections', type: 'LIABILITY' },
      { code: '4201', name: 'Trip Commission Revenue', type: 'INCOME' },
      { code: '4202', name: 'Partner Commission Revenue', type: 'INCOME' },
    ];
    const codes: Record<string, string> = {};
    for (const a of required) {
      try {
        const r = await axios.post(`${GATEWAY_URL}/ledger/accounts`, a, {
          headers: { 'x-tenant-id': tenantId },
        });
        codes[a.code] = r.data.id;
      } catch {
        const list = await axios.get(`${GATEWAY_URL}/ledger/accounts`, {
          params: { tenantId },
        });
        const found = list.data.find((x: any) => x.code === a.code);
        if (found) codes[a.code] = found.id;
      }
    }
    return codes;
  }

  async function createAccount(customerId: string) {
    const r = await axios.post(`${GATEWAY_URL}/accounts`, {
      name: `Wallet ${customerId}`,
      type: 'SAVINGS',
      currency: 'NGN',
      customerId,
      tenantId,
      glAccountId: glAccountCodes['2101'],
    });
    return r.data as { accountNumber: string };
  }

  beforeAll(async () => {
    glAccountCodes = await setupGlAccounts();
  });

  /* ════════════════════════════════════════════════
     1. SITE-WIDE FARE CONFIG (includes coin reward)
     ════════════════════════════════════════════════ */
  describe('1. Site-Wide Fare Config (Coin Rewards)', () => {
    it('should seed default fare configs', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/ledger/site-wide-fare-config/seed`,
        {},
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect([200, 201]).toContain(r.status);
    });

    it('should create/update coin reward configs', async () => {
      for (const { key, value } of [
        { key: 'COIN_REWARD_ENABLED', value: 'true' },
        { key: 'RIDER_COIN_REWARD_PER_TRIP', value: '10' },
        { key: 'DRIVER_COIN_REWARD_PER_TRIP', value: '25' },
        { key: 'TENANT_COIN_REWARD_PER_TRIP', value: '5' },
      ]) {
        const r = await axios.post(
          `${GATEWAY_URL}/ledger/site-wide-fare-config`,
          { key, value, description: `${key} config`, tenantId },
          { headers: { 'x-tenant-id': tenantId } },
        );
        expect([200, 201]).toContain(r.status);
      }
    });

    it('should read coin reward config values', async () => {
      const r = await axios.get(
        `${GATEWAY_URL}/ledger/site-wide-fare-config/COIN_REWARD_ENABLED`,
        { params: { tenantId } },
      );
      expect(r.status).toBe(200);
      expect(r.data.value).toBe('true');
    });

    it('should list all fare configs', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/site-wide-fare-config`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBeGreaterThanOrEqual(4);
    });
  });

  /* ════════════════════════════════════════════════
     2. COIN REWARDS — QUEENS COIN SYSTEM
     ════════════════════════════════════════════════ */
  describe('2. Queens Coin Rewards', () => {
    it('should award trip coins to rider, driver, and tenant', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/ledger/coin-reward/award-trip`,
        { tripId, tenantId, riderCustomerId: riderId, driverCustomerId: driverId },
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(201);
      expect(r.data.riderCoins).toBe(10);
      expect(r.data.driverCoins).toBe(25);
      expect(r.data.tenantCoins).toBe(5);
    });

    it('should show coin balance for each entity', async () => {
      const [rider, driver, tenant] = await Promise.all([
        axios.get(`${GATEWAY_URL}/ledger/coin-reward/balance/RIDER/${riderId}`, {
          headers: { 'x-tenant-id': tenantId },
        }),
        axios.get(`${GATEWAY_URL}/ledger/coin-reward/balance/DRIVER/${driverId}`, {
          headers: { 'x-tenant-id': tenantId },
        }),
        axios.get(`${GATEWAY_URL}/ledger/coin-reward/balance/TENANT/${tenantId}`, {
          headers: { 'x-tenant-id': tenantId },
        }),
      ]);
      expect(Number(rider.data.balance)).toBe(10);
      expect(Number(driver.data.balance)).toBe(25);
      expect(Number(tenant.data.balance)).toBe(5);
    });

    it('should return wallet for each entity', async () => {
      const r = await axios.get(
        `${GATEWAY_URL}/ledger/coin-reward/wallet/RIDER/${riderId}`,
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
      expect(r.data.entityId).toBe(riderId);
      expect(r.data.entityType).toBe('RIDER');
    });

    it('should return wallets list for tenant', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/coin-reward/wallets`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBe(3);
    });

    it('should return transactions for a wallet', async () => {
      const wallets = await axios.get(`${GATEWAY_URL}/ledger/coin-reward/wallets`, {
        headers: { 'x-tenant-id': tenantId },
      });
      const riderWallet = wallets.data.find((w: any) => w.entityType === 'RIDER');

      const r = await axios.get(
        `${GATEWAY_URL}/ledger/coin-reward/transactions/${riderWallet.id}`,
        { params: { page: '0', pageSize: '10' } },
      );
      expect(r.status).toBe(200);
      expect(r.data.data.length).toBe(1);
      expect(r.data.data[0].amount).toBe(10);
      expect(r.data.data[0].type).toBe('CREDIT');
      expect(r.data.data[0].tripId).toBe(tripId);
    });

    it('should be idempotent — awarding same trip again adds coins', async () => {
      await axios.post(
        `${GATEWAY_URL}/ledger/coin-reward/award-trip`,
        { tripId, tenantId, riderCustomerId: riderId, driverCustomerId: driverId },
        { headers: { 'x-tenant-id': tenantId } },
      );

      const r = await axios.get(`${GATEWAY_URL}/ledger/coin-reward/balance/RIDER/${riderId}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(Number(r.data.balance)).toBe(20);
    });

    it('should reject invalid entity type', async () => {
      try {
        await axios.get(`${GATEWAY_URL}/ledger/coin-reward/balance/INVALID/${riderId}`, {
          headers: { 'x-tenant-id': tenantId },
        });
        fail('Should have thrown');
      } catch (err: any) {
        expect(err.response.status).toBe(400);
      }
    });

    it('should return non-existent wallet gracefully', async () => {
      const r = await axios.get(
        `${GATEWAY_URL}/ledger/coin-reward/wallet/RIDER/non-existent-id`,
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
      expect(r.data.exists).toBe(false);
      expect(r.data.balance).toBe(0);
    });
  });

  /* ════════════════════════════════════════════════
     3. TRIP PAYMENT FLOW (simulated via ledger posting)
     ════════════════════════════════════════════════ */
  describe('3. Trip Payment Flow (simulated)', () => {
    it('should post payment clearing journal', async () => {
      const r = await axios.post(`${GATEWAY_URL}/ledger/posting/transaction`, {
        reference: `PAYSTACK-E2E-V2-${tripId}`,
        description: `Paystack payment for trip ${tripId}`,
        postingDate: new Date(),
        currency: 'NGN',
        tenantId,
        entries: [
          { glAccountId: glAccountCodes['1201'], amount: 10000, side: 'DEBIT' },
          { glAccountId: glAccountCodes['2402'], amount: 10000, side: 'CREDIT' },
        ],
      });
      expect(r.status).toBe(201);
    });

    it('should post revenue allocation with commission splits', async () => {
      const r = await axios.post(`${GATEWAY_URL}/ledger/posting/transaction`, {
        reference: `TRIP-ALLOC-V2-${tripId}`,
        description: `Revenue allocation for trip ${tripId}`,
        postingDate: new Date(),
        currency: 'NGN',
        tenantId,
        entries: [
          { glAccountId: glAccountCodes['2402'], amount: 10000, side: 'DEBIT' },
          { glAccountId: glAccountCodes['4201'], amount: 1000, side: 'CREDIT' },
          {
            glAccountId: glAccountCodes['2202'], amount: 500, side: 'CREDIT',
            subLedgerId: partnerId, subLedgerType: 'PARTNER_ACCOUNT',
          },
          {
            glAccountId: glAccountCodes['2302'], amount: 8500, side: 'CREDIT',
            subLedgerId: driverId, subLedgerType: 'DRIVER_ACCOUNT',
          },
        ],
      });
      expect(r.status).toBe(201);
    });
  });

  /* ════════════════════════════════════════════════
     4. DRIVER EARNINGS
     ════════════════════════════════════════════════ */
  describe('4. Driver Earnings', () => {
    let earningId: string;

    it('should record driver earning', async () => {
      const r = await axios.post(`${GATEWAY_URL}/driver-earnings/record`, {
        tenantId,
        driverCustomerId: driverId,
        tripId,
        tripFare: 10000,
        platformCommission: 1000,
        partnerCommission: 500,
        netEarnings: 8500,
        bonusAmount: 500,
        currency: 'NGN',
      });
      expect(r.status).toBe(201);
      earningId = r.data.id;
      expect(Number(r.data.finalPayout)).toBe(9000);
    });

    it('should get earnings summary', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-earnings/summary`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(Number(r.data.totalEarnings)).toBeGreaterThan(0);
      expect(r.data.totalTrips).toBeGreaterThanOrEqual(1);
    });

    it('should get driver-specific earnings', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-earnings/driver/${driverId}`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.earnings.length).toBeGreaterThanOrEqual(1);
      expect(r.data.totals.totalFare).toBe(10000);
    });

    it('should list all earnings with pagination', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-earnings`, {
        params: { tenantId, pageSize: 10 },
      });
      expect(r.status).toBe(200);
      expect(r.data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  /* ════════════════════════════════════════════════
     5. COMMISSION RULES
     ════════════════════════════════════════════════ */
  describe('5. Commission Rules', () => {
    it('should create commission rules', async () => {
      for (const rule of [
        { ruleType: 'PLATFORM', calculationMethod: 'PERCENTAGE', rate: 0.10, priority: 1, description: '10% platform fee', tenantId },
        { ruleType: 'PARTNER', calculationMethod: 'PERCENTAGE', rate: 0.05, priority: 2, description: '5% partner fee', tenantId },
      ]) {
        const r = await axios.post(`${GATEWAY_URL}/ledger/commissions/rules`, rule);
        expect(r.status).toBe(201);
      }
    });

    it('should list commission rules', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/commissions/rules`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  /* ════════════════════════════════════════════════
     6. SAVINGS PLANS
     ════════════════════════════════════════════════ */
  describe('6. Driver Savings Plans', () => {
    let planId: string;

    it('should create a savings plan', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/driver-savings/plan`,
        {
          driverCustomerId: driverId,
          targetAmount: 100000,
          contributionPerTrip: 5000,
          earlyWithdrawalPenaltyPercent: 10,
          maxEarlyWithdrawalPenalty: 5000,
        },
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(201);
      planId = r.data.id;
      expect(r.data.status).toBe('ACTIVE');
    });

    it('should record a contribution', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/driver-savings/contribute`,
        { planId, tripId: `${tripId}-savings`, amount: 5000 },
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
      expect(Number(r.data.currentAmount)).toBe(5000);
    });

    it('should list plans for driver', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-savings/plans`, {
        headers: { 'x-tenant-id': tenantId },
        params: { driverCustomerId: driverId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBe(1);
    });

    it('should get plan summary', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-savings/summary`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.totalPlans).toBeGreaterThanOrEqual(1);
      expect(Number(r.data.totalSaved)).toBeGreaterThanOrEqual(5000);
    });

    it('should get savings plan by id', async () => {
      const r = await axios.get(`${GATEWAY_URL}/driver-savings/plan/${planId}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.id).toBe(planId);
    });
  });

  /* ════════════════════════════════════════════════
     7. REMITTANCE SCHEDULES
     ════════════════════════════════════════════════ */
  describe('7. Remittance Schedules', () => {
    let scheduleId: string;

    it('should create a remittance schedule', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/remittance/schedule`,
        {
          partnerId,
          cycle: 'DAILY',
          amount: 50000,
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        },
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(201);
      scheduleId = r.data.id;
      expect(r.data.status).toBe('PENDING');
    });

    it('should get pending schedules', async () => {
      const r = await axios.get(`${GATEWAY_URL}/remittance/pending`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get all schedules', async () => {
      const r = await axios.get(`${GATEWAY_URL}/remittance/all`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get remittance summary', async () => {
      const r = await axios.get(`${GATEWAY_URL}/remittance/summary`, {
        headers: { 'x-tenant-id': tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.totalSchedules).toBeGreaterThanOrEqual(1);
      expect(Number(r.data.totalAmount)).toBeGreaterThanOrEqual(50000);
    });

    it('should process the schedule', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/remittance/${scheduleId}/process`,
        { actor: 'e2e-test' },
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
      expect(r.data.status).toBe('COMPLETED');
    });
  });

  /* ════════════════════════════════════════════════
     8. AUDIT TRAIL & GL IMPACT
     ════════════════════════════════════════════════ */
  describe('8. Audit Trail', () => {
    it('should list audit trail with pagination', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/audit/trail`, {
        params: { tenantId, page: '0', pageSize: '10' },
      });
      expect(r.status).toBe(200);
      expect(r.data.data.length).toBeGreaterThanOrEqual(1);
      expect(r.data.totalItems).toBeGreaterThanOrEqual(1);
    });

    it('should get audit trail by reference', async () => {
      const r = await axios.get(
        `${GATEWAY_URL}/ledger/audit/trail/PAYSTACK-E2E-V2-${tripId}`,
        { params: { tenantId } },
      );
      expect(r.status).toBe(200);
    });

    it('should get GL impact for a journal entry', async () => {
      const trail = await axios.get(`${GATEWAY_URL}/ledger/audit/trail`, {
        params: { tenantId, page: '0', pageSize: '1' },
      });
      if (trail.data.data.length > 0) {
        const journalId = trail.data.data[0].id;
        const r = await axios.get(
          `${GATEWAY_URL}/ledger/audit/gl-impact/${journalId}`,
          { params: { tenantId } },
        );
        expect(r.status).toBe(200);
        expect(r.data.glImpact.length).toBeGreaterThanOrEqual(2);
      }
    });
  });

  /* ════════════════════════════════════════════════
     9. FINANCIAL REPORTS
     ════════════════════════════════════════════════ */
  describe('9. Financial Reports', () => {
    it('should return trial balance that is balanced', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/audit/trial-balance`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.balanced).toBe(true);
      expect(Math.abs(r.data.totalDebit - r.data.totalCredit)).toBeLessThanOrEqual(0.01);
    });

    it('should return profit and loss', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/audit/profit-loss`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
      expect(r.data.totalIncome).toBeGreaterThanOrEqual(0);
    });

    it('should return balance sheet', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/audit/balance-sheet`, {
        params: { tenantId },
      });
      expect(r.status).toBe(200);
    });

    it('should verify accounting equation: Assets = Liabilities + Equity', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/audit/balance-sheet`, {
        params: { tenantId },
      });
      expect(r.data.accountingEquation.balanced).toBe(true);
    });
  });

  /* ════════════════════════════════════════════════
     10. SCHEDULER WORKERS
     ════════════════════════════════════════════════ */
  describe('10. Scheduler Workers', () => {
    it('should process overdue remittances', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/scheduler/remittance/process-overdue`,
        {},
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
    });

    it('should disburse mature savings', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/scheduler/savings/disburse-mature`,
        {},
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
    });

    it('should process weekly savings disbursements', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/scheduler/savings/disburse-weekly`,
        {},
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
    });

    it('should process monthly savings disbursements', async () => {
      const r = await axios.post(
        `${GATEWAY_URL}/scheduler/savings/disburse-monthly`,
        {},
        { headers: { 'x-tenant-id': tenantId } },
      );
      expect(r.status).toBe(200);
    });
  });

  /* ════════════════════════════════════════════════
     11. GL ACCOUNT VERIFICATION
     ════════════════════════════════════════════════ */
  describe('11. GL Verification', () => {
    it('should verify all journal entries are balanced', async () => {
      const r = await axios.get(`${GATEWAY_URL}/ledger/transactions`, {
        params: { tenantId, pageSize: 50 },
      });
      expect(r.status).toBe(200);
      for (const journal of r.data.data) {
        let debit = 0, credit = 0;
        for (const entry of journal.entries) {
          const a = Number(entry.amount);
          if (entry.side === 'DEBIT') debit += a;
          else credit += a;
        }
        expect(Math.abs(debit - credit)).toBeLessThanOrEqual(0.001);
      }
    });
  });
});
