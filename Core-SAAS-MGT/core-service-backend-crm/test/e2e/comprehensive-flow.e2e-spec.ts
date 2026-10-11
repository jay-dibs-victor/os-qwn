/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unused-vars */
import axios from 'axios';

/**
 * COMPREHENSIVE E2E TEST
 * This test verifies:
 * 1. Auth & JWT Generation
 * 2. RBAC Permission Resolution (including REVERSAL_OFFICER role)
 * 3. Gateway Dynamic Interception
 * 4. Approval Workflow (Maker-Checker)
 * 5. Reversal Service Execution & 100k Approval Gate
 * 6. Partial Reversals & Scaled Ledger Postings
 */

describe.skip('Banking Service Comprehensive Flow (E2E)', () => {
  const GATEWAY_URL = 'http://localhost:3000';
  const tenantId = 'SYSTEM';
  let makerToken: string;
  let checkerToken: string;
  let officerToken: string;

  let makerId: string;
  let checkerId: string;
  let officerId: string;
  let requestId: string;

  let glAssetId: string;
  let glLiabilityId: string;
  let realTxId: string;
  let partialTxId: string;

  const makerEmail = `maker-${Date.now()}@test.com`;
  const checkerEmail = `checker-${Date.now()}@test.com`;
  const officerEmail = `officer-${Date.now()}@test.com`;
  const password = 'StrongPassword123!';

  beforeAll(async () => {
    // 1. Register Maker
    const res1 = await axios.post(`${GATEWAY_URL}/auth/register`, {
      email: makerEmail,
      password,
      firstName: 'Maker',
      lastName: 'User',
      phone: `+23480${Math.floor(10000000 + Math.random() * 90000000)}`,
      tenantId,
    });
    makerId = res1.data.id;
    await axios.post(`${GATEWAY_URL}/auth/verify-account`, { userId: makerId });

    // 2. Register Checker
    const res2 = await axios.post(`${GATEWAY_URL}/auth/register`, {
      email: checkerEmail,
      password,
      firstName: 'Checker',
      lastName: 'User',
      phone: `+23481${Math.floor(10000000 + Math.random() * 90000000)}`,
      tenantId,
    });
    checkerId = res2.data.id;
    await axios.post(`${GATEWAY_URL}/auth/verify-account`, { userId: checkerId });

    // 3. Register Reversal Officer
    const res3 = await axios.post(`${GATEWAY_URL}/auth/register`, {
      email: officerEmail,
      password,
      firstName: 'Reversal',
      lastName: 'Officer',
      phone: `+23490${Math.floor(10000000 + Math.random() * 90000000)}`,
      tenantId,
    });
    officerId = res3.data.id;
    await axios.post(`${GATEWAY_URL}/auth/verify-account`, { userId: officerId });

    // 4. Logins
    const loginMaker = await axios.post(`${GATEWAY_URL}/auth/login`, {
      email: makerEmail,
      password,
      tenantId,
    });
    makerToken = loginMaker.data.access_token;

    const loginChecker = await axios.post(`${GATEWAY_URL}/auth/login`, {
      email: checkerEmail,
      password,
      tenantId,
    });
    checkerToken = loginChecker.data.access_token;

    const loginOfficer = await axios.post(`${GATEWAY_URL}/auth/login`, {
      email: officerEmail,
      password,
      tenantId,
    });
    officerToken = loginOfficer.data.access_token;
  });

  describe('RBAC & Permission Injection', () => {
    it('should initially have no permissions in JWT', async () => {
      try {
        await axios.post(
          `${GATEWAY_URL}/reversal`,
          { transactionId: 'some-id', reason: 'DUPLICATE_PAYMENT', requestedBy: 'test', tenantId },
          {
            headers: {
              Authorization: `Bearer ${makerToken}`,
              'x-tenant-id': tenantId,
            },
          },
        );
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should assign roles to maker, checker, and reversal officer', async () => {
      const rolesRes = await axios.get(`${GATEWAY_URL}/rbac/roles`, {
        params: { tenantId },
      });
      const adminRole = rolesRes.data.find((r) => r.name === 'ADMIN');
      const officerRole = rolesRes.data.find((r) => r.name === 'REVERSAL_OFFICER');
      expect(adminRole).toBeDefined();
      expect(officerRole).toBeDefined();

      // Assign ADMIN role to Maker and Checker
      await axios.post(`${GATEWAY_URL}/rbac/users/${makerId}/roles`, {
        roleIds: [adminRole.id],
        tenantId,
      });
      await axios.post(`${GATEWAY_URL}/rbac/users/${checkerId}/roles`, {
        roleIds: [adminRole.id],
        tenantId,
      });

      // Assign REVERSAL_OFFICER role to Officer
      await axios.post(`${GATEWAY_URL}/rbac/users/${officerId}/roles`, {
        roleIds: [officerRole.id],
        tenantId,
      });

      // Re-login to get updated JWTs
      const loginMaker = await axios.post(`${GATEWAY_URL}/auth/login`, {
        email: makerEmail,
        password,
        tenantId,
      });
      makerToken = loginMaker.data.access_token;

      const loginChecker = await axios.post(`${GATEWAY_URL}/auth/login`, {
        email: checkerEmail,
        password,
        tenantId,
      });
      checkerToken = loginChecker.data.access_token;

      const loginOfficer = await axios.post(`${GATEWAY_URL}/auth/login`, {
        email: officerEmail,
        password,
        tenantId,
      });
      officerToken = loginOfficer.data.access_token;
    });
  });

  describe('Ledger Setup & Transaction Posting', () => {
    it('should seed or create GL accounts for transaction posting', async () => {
      try {
        const assetRes = await axios.post(
          `${GATEWAY_URL}/ledger/accounts`,
          {
            code: '1100-TEST',
            name: 'CASH',
            type: 'ASSET',
            tenantId,
          },
          {
            headers: {
              Authorization: `Bearer ${makerToken}`,
              'x-tenant-id': tenantId,
            },
          },
        );
        glAssetId = assetRes.data.id;
      } catch (err) {
        const res = await axios.get(`${GATEWAY_URL}/ledger/accounts`, {
          params: { tenantId },
          headers: {
            Authorization: `Bearer ${makerToken}`,
            'x-tenant-id': tenantId,
          },
        });
        const acc = res.data.find((a) => a.code === '1100-TEST');
        glAssetId = acc.id;
      }

      try {
        const liabilityRes = await axios.post(
          `${GATEWAY_URL}/ledger/accounts`,
          {
            code: '2100-TEST',
            name: 'DEPOSITS',
            type: 'LIABILITY',
            tenantId,
          },
          {
            headers: {
              Authorization: `Bearer ${makerToken}`,
              'x-tenant-id': tenantId,
            },
          },
        );
        glLiabilityId = liabilityRes.data.id;
      } catch (err) {
        const res = await axios.get(`${GATEWAY_URL}/ledger/accounts`, {
          params: { tenantId },
          headers: {
            Authorization: `Bearer ${makerToken}`,
            'x-tenant-id': tenantId,
          },
        });
        const acc = res.data.find((a) => a.code === '2100-TEST');
        glLiabilityId = acc.id;
      }

      expect(glAssetId).toBeDefined();
      expect(glLiabilityId).toBeDefined();
    });

    it('should post a real balanced transaction to the ledger', async () => {
      const postingDto = {
        reference: `TX-${Date.now()}`,
        description: 'Initial customer deposit',
        postingDate: new Date(),
        tenantId,
        entries: [
          { glAccountId: glAssetId, amount: 150000, side: 'DEBIT' },
          { glAccountId: glLiabilityId, amount: 150000, side: 'CREDIT' },
        ],
      };

      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        postingDto,
        {
          headers: {
            Authorization: `Bearer ${makerToken}`,
            'x-tenant-id': tenantId,
          },
        },
      );
      expect(res.status).toBe(201);
      expect(res.data.id).toBeDefined();
      realTxId = res.data.id;
    });

    it('should post another transaction for partial reversals', async () => {
      const postingDto = {
        reference: `TX-PARTIAL-${Date.now()}`,
        description: 'Partial test deposit',
        postingDate: new Date(),
        tenantId,
        entries: [
          { glAccountId: glAssetId, amount: 200000, side: 'DEBIT' },
          { glAccountId: glLiabilityId, amount: 200000, side: 'CREDIT' },
        ],
      };

      const res = await axios.post(
        `${GATEWAY_URL}/ledger/posting/transaction`,
        postingDto,
        {
          headers: {
            Authorization: `Bearer ${makerToken}`,
            'x-tenant-id': tenantId,
          },
        },
      );
      expect(res.status).toBe(201);
      partialTxId = res.data.id;
    });
  });

  describe('Approval Workflow & Reversal Officer Execution', () => {
    it('should allow a Reversal Officer to initiate a reversal > 100k, returning 202', async () => {
      const reversalData = {
        transactionId: realTxId,
        reason: 'DUPLICATE_PAYMENT',
        requestedBy: officerId,
        tenantId,
      };

      const response = await axios.post(
        `${GATEWAY_URL}/reversal`,
        reversalData,
        {
          headers: {
            Authorization: `Bearer ${officerToken}`,
            'x-tenant-id': tenantId,
          },
        },
      );

      expect(response.status).toBe(202);
      expect(response.data.message).toContain('intercepted');
      expect(response.data.requestId).toBeDefined();
      requestId = response.data.requestId;
    });

    it('should show the pending request in approval-service', async () => {
      const response = await axios.get(`${GATEWAY_URL}/approval/requests`, {
        headers: {
          Authorization: `Bearer ${checkerToken}`,
          'x-tenant-id': tenantId,
        },
      });

      const request = response.data.find((r) => r.id === requestId);
      expect(request).toBeDefined();
      expect(request.status).toBe('PENDING');
      expect(request.initiatorId).toBe(officerId);
    });

    it('should allow the checker to approve the request, trigger background bypass execution', async () => {
      const response = await axios.post(
        `${GATEWAY_URL}/approval/requests/${requestId}/approve`,
        {
          approverId: checkerId,
          comment: 'Looks valid to me',
        },
        {
          headers: {
            Authorization: `Bearer ${checkerToken}`,
            'x-tenant-id': tenantId,
          },
        },
      );

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('APPROVED');
    });

    it('should verify the request was executed in reversal-service', async () => {
      // Give a tiny moment for async execution forwarding to run
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await axios.get(`${GATEWAY_URL}/reversal/${realTxId}`, {
        headers: {
          Authorization: `Bearer ${officerToken}`,
          'x-tenant-id': tenantId,
        },
      });

      expect(response.status).toBe(200);
      expect(response.data.transactionId).toBe(realTxId);
      expect(response.data.status).toBe('COMPLETED');
    });
  });

  describe('Partial Reversal & Scaling Ledger Flow', () => {
    it('should allow a partial reversal under 100k immediately', async () => {
      const reversalData = {
        transactionId: partialTxId,
        reason: 'CUSTOMER_REQUEST',
        type: 'PARTIAL_REVERSAL',
        amount: 50000,
        requestedBy: officerId,
        tenantId,
      };

      const response = await axios.post(
        `${GATEWAY_URL}/reversal`,
        reversalData,
        {
          headers: {
            Authorization: `Bearer ${officerToken}`,
            'x-tenant-id': tenantId,
            'x-bypass-approval': 'true', // Skip gateway dynamic approval for direct test
          },
        },
      );

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('COMPLETED');
      expect(response.data.amount).toBe(50000);
      expect(response.data.type).toBe('PARTIAL_REVERSAL');
    });

    it('should allow a second partial reversal', async () => {
      const reversalData = {
        transactionId: partialTxId,
        reason: 'CUSTOMER_REQUEST',
        type: 'PARTIAL_REVERSAL',
        amount: 100000,
        requestedBy: officerId,
        tenantId,
      };

      const response = await axios.post(
        `${GATEWAY_URL}/reversal`,
        reversalData,
        {
          headers: {
            Authorization: `Bearer ${officerToken}`,
            'x-tenant-id': tenantId,
            'x-bypass-approval': 'true',
          },
        },
      );

      expect(response.status).toBe(201);
      expect(response.data.status).toBe('COMPLETED');
      expect(response.data.amount).toBe(100000);
    });

    it('should prevent reversing more than original transaction amount', async () => {
      const reversalData = {
        transactionId: partialTxId,
        reason: 'CUSTOMER_REQUEST',
        type: 'PARTIAL_REVERSAL',
        amount: 60000, // Total: 50k + 100k + 60k = 210k > 200k original
        requestedBy: officerId,
        tenantId,
      };

      try {
        await axios.post(
          `${GATEWAY_URL}/reversal`,
          reversalData,
          {
            headers: {
              Authorization: `Bearer ${officerToken}`,
              'x-tenant-id': tenantId,
              'x-bypass-approval': 'true',
            },
          },
        );
        fail('Should have failed due to amount limit');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('would exceed the original transaction amount');
      }
    });
  });
});
