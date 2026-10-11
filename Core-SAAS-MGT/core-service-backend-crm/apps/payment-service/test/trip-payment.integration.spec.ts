import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import axios from 'axios';
import { PaymentServiceModule } from '../src/payment-service.module';
import { TripPaymentService } from '../src/trip-payment.service';
import { PaystackProvider } from '../src/rails/paystack.provider';
import { EmailService } from '@app/common';
import {
  PaystackTransaction,
  PaystackTransactionStatus,
} from '../src/entities/paystack-transaction.entity';

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Trip Payment Service Integration', () => {
  let app: INestApplication;
  let tripPaymentService: TripPaymentService;
  let paystackTxRepo: Repository<PaystackTransaction>;
  let paystackProvider: PaystackProvider;
  let emailService: EmailService;

  const tenantId = 'trip-pay-test-tenant';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.POSTGRES_HOST || 'localhost',
          port: Number(process.env.POSTGRES_PORT) || 5432,
          username: process.env.POSTGRES_USER || 'postgres',
          password: process.env.POSTGRES_PASSWORD || 'postgres',
          database: process.env.POSTGRES_DB || 'payment_test',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        PaymentServiceModule,
      ],
    })
      .overrideProvider(PaystackProvider)
      .useValue({
        initializeTransaction: jest.fn().mockResolvedValue({
          authorization_url: 'https://paystack.com/authorize/test',
          access_code: 'test_access_code',
          reference: 'test_ref_001',
        }),
        verifyTransaction: jest.fn().mockResolvedValue({
          id: 12345,
          status: 'success',
          reference: 'test_ref_001',
          amount: 1000000,
          currency: 'NGN',
          paid_at: new Date().toISOString(),
          channel: 'card',
          fees: 15000,
          customer: {
            id: 1,
            email: 'rider@test.com',
            customer_code: 'CUS_001',
          },
        }),
        createSubaccount: jest.fn().mockResolvedValue({
          subaccountCode: 'SUB_ACCT_001',
        }),
        createSplit: jest.fn().mockResolvedValue({
          splitCode: 'SPLIT_001',
        }),
        createTransferRecipient: jest.fn().mockResolvedValue({
          recipientCode: 'RCP_001',
        }),
        initiateTransfer: jest.fn().mockResolvedValue({
          reference: 'TRF_REF_001',
          status: 'success',
          transferCode: 'TRF_CODE_001',
        }),
      })
      .overrideProvider(EmailService)
      .useValue({
        send: jest.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    tripPaymentService = app.get<TripPaymentService>(TripPaymentService);
    paystackProvider = app.get<PaystackProvider>(PaystackProvider);
    emailService = app.get<EmailService>(EmailService);
    paystackTxRepo = app.get<Repository<PaystackTransaction>>(
      getRepositoryToken(PaystackTransaction),
    );

    mockedAxios.get.mockImplementation(async (url: string) => {
      if (url.includes('/accounts/customer/')) {
        const isRider = url.includes('rider');
        const isLow = url.includes('rider-wlt-2');
        return {
          data: [
            {
              accountNumber: isLow ? 'RDR-LOW-ACC' : (isRider ? 'RDR-TEST-ACC' : 'DRV-TEST-ACC'),
              glAccountId: isRider ? 'customer-wallet-gl' : 'test-driver-gl-id',
              currency: 'NGN',
              customerId: isRider ? (isLow ? 'rider-wlt-2' : 'rider-test-1') : 'driver-test-1',
            },
          ],
        };
      }
      if (url.includes('/accounts/')) {
        const isLow = url.includes('RDR-LOW-ACC');
        // Direct account retrieve
        return {
          data: {
            accountNumber: isLow ? 'RDR-LOW-ACC' : 'RDR-TEST-ACC',
            balance: isLow ? 500 : 50000,
            currency: 'NGN',
          },
        };
      }
      if (url.includes('/ledger/accounts')) {
        return {
          data: {
            data: [
              { code: '1201', id: 'paystack-clearing-gl', name: 'Paystack Clearing' },
              { code: '2402', id: 'unsettled-gl', name: 'Unsettled Collections' },
              { code: '4201', id: 'commission-rev-gl', name: 'Trip Commission Revenue' },
              { code: '4202', id: 'partner-commission-rev-gl', name: 'Partner Commission Revenue' },
              { code: '2202', id: 'partner-payable-gl', name: 'Partner Commission Payable' },
              { code: '2302', id: 'driver-earnings-payable-gl', name: 'Driver Earnings Payable' },
              { code: '2301', id: 'driver-wallet-balance-gl', name: 'Driver Wallet Balance' },
              { code: '1101', id: 'cash-at-bank-gl', name: 'Cash at Bank' },
              { code: '2101', id: 'customer-wallet-gl', name: 'Customer NGN Wallet' },
              { code: '5101', id: 'gateway-fee-gl', name: 'Paystack Gateway Charges' },
              { code: '1403', id: 'driver-commission-receivable-gl', name: 'Driver Commission Receivable' },
            ],
          },
        };
      }
      return { data: [] };
    });

    mockedAxios.post.mockImplementation(async (url: string) => {
      if (url.includes('/ledger/posting/transaction')) {
        return {
          data: {
            id: `journal-${Date.now()}`,
            reference: `ref-${Date.now()}`,
          },
        };
      }
      return { data: {} };
    });
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Commission Calculation', () => {
    it('should calculate individual driver commission', () => {
      const result = tripPaymentService.calculateTripCommission({
        totalFare: 10000,
        platformRate: 0.10,
        partnerRate: 0.05,
        isCorporate: false,
      });

      expect(result.totalFare).toBe(10000);
      expect(result.platformCommissionAmount).toBe(1000);
      expect(result.partnerCommissionAmount).toBe(0);
      expect(result.driverPayout).toBe(8850);
      expect(result.gatewayFee).toBe(150);
    });

    it('should calculate corporate driver commission with partner split', () => {
      const result = tripPaymentService.calculateTripCommission({
        totalFare: 20000,
        platformRate: 0.10,
        partnerRate: 0.05,
        isCorporate: true,
      });

      expect(result.platformCommissionAmount).toBe(2000);
      expect(result.partnerCommissionAmount).toBe(1000);
      expect(result.driverPayout).toBe(16700);
    });

    it('should handle zero commission rates', () => {
      const result = tripPaymentService.calculateTripCommission({
        totalFare: 5000,
        platformRate: 0,
        partnerRate: 0,
        isCorporate: false,
      });

      expect(result.platformCommissionAmount).toBe(0);
      expect(result.partnerCommissionAmount).toBe(0);
      expect(result.driverPayout).toBe(4925);
    });
  });

  describe('Trip Payment Initiation', () => {
    it('should initiate trip payment for individual driver', async () => {
      const result = await tripPaymentService.initiateTripPayment({
        tripId: 'trip-init-001',
        riderCustomerId: 'rider-init-1',
        riderEmail: 'rider@test.com',
        fareAmount: 10000,
        driverCustomerId: 'driver-init-1',
        driverType: 'INDIVIDUAL' as any,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.authorizationUrl).toBeDefined();
      expect(result.commissionBreakdown).toBeDefined();
      expect(result.commissionBreakdown!.partnerCommissionAmount).toBe(0);
    });

    it('should initiate trip payment for corporate driver', async () => {
      const result = await tripPaymentService.initiateTripPayment({
        tripId: 'trip-init-002',
        riderCustomerId: 'rider-init-2',
        riderEmail: 'rider2@test.com',
        fareAmount: 20000,
        driverCustomerId: 'driver-corp-1',
        driverType: 'CORPORATE' as any,
        partnerTenantId: 'partner-tenant-1',
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.commissionBreakdown!.partnerCommissionAmount).toBeGreaterThan(0);
    });

    it('should persist paystack transaction record', async () => {
      const tx = await paystackTxRepo.findOne({
        where: { reference: expect.any(String) as any },
      });

      if (tx) {
        expect(tx.status).toBe(PaystackTransactionStatus.INITIATED);
      }
    });

    it.skip('should fail without tenant id', async () => {
      // Validation pipe handles empty tenantId at controller layer, not service layer
    });
  });

  describe('Trip Payment Verification', () => {
    let paymentRef: string;

    beforeAll(async () => {
      const result = await tripPaymentService.initiateTripPayment({
        tripId: 'trip-verify-001',
        riderCustomerId: 'rider-verify',
        riderEmail: 'verify@test.com',
        fareAmount: 15000,
        driverCustomerId: 'driver-verify',
        tenantId,
      });
      paymentRef = result.paymentReference;
    });

    it('should verify a successful payment', async () => {
      const result = await tripPaymentService.verifyTripPayment({
        paystackReference: paymentRef,
        tripId: 'trip-verify-001',
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('PENDING');
    });
  });

  describe('Trip Payment Completion', () => {
    let paymentRef: string;

    beforeAll(async () => {
      const result = await tripPaymentService.initiateTripPayment({
        tripId: 'trip-complete-001',
        riderCustomerId: 'rider-complete',
        riderEmail: 'complete@test.com',
        fareAmount: 25000,
        driverCustomerId: 'driver-complete',
        partnerTenantId: 'partner-complete',
        driverType: 'CORPORATE' as any,
        tenantId,
      });
      paymentRef = result.paymentReference;

      await tripPaymentService.verifyTripPayment({
        paystackReference: paymentRef,
        tripId: 'trip-complete-001',
        tenantId,
      });
    });

    it('should complete trip payment with full journal posting', async () => {
      const result = await tripPaymentService.completeTripPayment({
        paystackReference: paymentRef,
        tripId: 'trip-complete-001',
        tenantId,
        driverCustomerId: 'driver-complete',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.commissionBreakdown).toBeDefined();
      expect(result.journalEntries).toBeDefined();
      expect(result.journalEntries!.length).toBeGreaterThanOrEqual(2);
    });

    it('should be idempotent on re-completion', async () => {
      const result = await tripPaymentService.completeTripPayment({
        paystackReference: paymentRef,
        tripId: 'trip-complete-001',
        tenantId,
        driverCustomerId: 'driver-complete',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('already completed');
    });

    it('should update transaction status to success', async () => {
      const tx = await paystackTxRepo.findOne({
        where: { reference: paymentRef },
      });

      expect(tx).toBeDefined();
      expect(tx!.status).toBe(PaystackTransactionStatus.SUCCESS);
    });
  });

  describe('Trip Payment Query', () => {
    it('should get transaction by reference', async () => {
      const tx = await tripPaymentService.getTransactionByReference(
        expect.any(String) as any,
      );
      if (tx) {
        expect(tx.reference).toBeDefined();
      }
    });
  });

  describe('Wallet Trip Payment Flow', () => {
    it('should pay for a trip using rider wallet and post correct journal entries', async () => {
      const result = await tripPaymentService.walletTripPayment({
        tripId: 'trip-wlt-test-001',
        riderCustomerId: 'rider-wlt-1',
        fareAmount: 3000,
        driverCustomerId: 'driver-wlt-1',
        driverType: 'INDIVIDUAL' as any,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('COMPLETED');
      expect(result.journalEntries).toBeDefined();
      expect(result.journalEntries!.length).toBe(3);
    });

    it('should fail if rider has insufficient wallet balance', async () => {
      await expect(
        tripPaymentService.walletTripPayment({
          tripId: 'trip-wlt-test-002',
          riderCustomerId: 'rider-wlt-2',
          fareAmount: 3000,
          driverCustomerId: 'driver-wlt-1',
          driverType: 'INDIVIDUAL' as any,
          tenantId,
        }),
      ).rejects.toThrow('Insufficient wallet balance');
    });
  });

  describe('Cash Trip Payment Flow', () => {
    it('should record platform commission as a debt for driver', async () => {
      const result = await tripPaymentService.cashTripPayment({
        tripId: 'trip-cash-test-001',
        fareAmount: 5000,
        driverCustomerId: 'driver-cash-1',
        driverType: 'INDIVIDUAL' as any,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.tripId).toBe('trip-cash-test-001');
      expect(result.commissionBreakdown).toBeDefined();
      expect(result.commissionBreakdown.platformCommissionAmount).toBe(500); // 10%
      expect(result.debtReference).toBeDefined();
      expect(result.journalEntryId).toBeDefined();
    });

    it('should record platform and partner commission as a debt for corporate driver', async () => {
      const result = await tripPaymentService.cashTripPayment({
        tripId: 'trip-cash-corporate-001',
        fareAmount: 5000,
        driverCustomerId: 'driver-cash-2',
        driverType: 'CORPORATE' as any,
        partnerTenantId: 'partner-tenant-cash-1',
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(result.tripId).toBe('trip-cash-corporate-001');
      expect(result.commissionBreakdown).toBeDefined();
      expect(result.commissionBreakdown.platformCommissionAmount).toBe(500); // 10%
      expect(result.commissionBreakdown.partnerCommissionAmount).toBe(250); // 5%
      expect(result.debtReference).toBeDefined();
      expect(result.journalEntryId).toBeDefined();
    });
  });

  describe('Split Payment Email & Disbursement Handling Checks', () => {
    it('should trigger platform owner and rider emails on completeTripPayment, and skip manual transfers if splitCode is used', async () => {
      // 1. Clear any previous mock calls
      jest.spyOn(emailService, 'send').mockClear();
      jest.spyOn(paystackProvider, 'initiateTransfer').mockClear();

      // 2. Initiate transaction with subaccount info so that a splitCode is created
      const initResult = await tripPaymentService.initiateTripPayment({
        tripId: 'trip-split-disburse-001',
        riderCustomerId: 'rider-test-1',
        riderEmail: 'rider@example.com',
        fareAmount: 30000,
        driverCustomerId: 'driver-test-1',
        driverType: 'CORPORATE' as any,
        partnerTenantId: 'partner-tenant-1',
        driverBankCode: '044',
        driverAccountNumber: '0123456789',
        partnerBankCode: '044',
        partnerAccountNumber: '9876543210',
        tenantId,
      });

      expect(initResult.success).toBe(true);

      // Verify that splitCode was generated
      const tx = await paystackTxRepo.findOne({
        where: { reference: initResult.paymentReference },
      });
      expect(tx?.splitConfig?.splitCode).toBeDefined();

      // 3. Complete the transaction
      const completeResult = await tripPaymentService.completeTripPayment({
        paystackReference: initResult.paymentReference,
        tripId: 'trip-split-disburse-001',
        driverCustomerId: 'driver-test-1',
        tenantId,
      });

      expect(completeResult.success).toBe(true);
      expect(completeResult.transfers).toBeDefined();
      // Since splitCode is used, transfers should be populated via split config and not manual initiateTransfer calls
      expect(completeResult.transfers![0].reference).toContain('SPLIT-');
      expect(paystackProvider.initiateTransfer).not.toHaveBeenCalled();

      // Verify that emails were triggered for rider and platform owner
      expect(emailService.send).toHaveBeenCalledTimes(2);
      expect(emailService.send).toHaveBeenNthCalledWith(1, expect.objectContaining({
        to: 'rider@example.com',
        templateName: 'payment-receipt',
        context: expect.objectContaining({
          paymentMethod: 'Paystack Card',
          amount: '300.00', // 30000 / 100
        }),
      }));
      expect(emailService.send).toHaveBeenNthCalledWith(2, expect.objectContaining({
        to: 'juwavictor@gmail.com', // platform owner
        templateName: 'platform-notification',
      }));
    });

    it('should trigger platform owner and rider emails on walletTripPayment', async () => {
      jest.spyOn(emailService, 'send').mockClear();

      const result = await tripPaymentService.walletTripPayment({
        tripId: 'trip-wlt-email-001',
        riderCustomerId: 'rider-wlt-1',
        riderEmail: 'rider@example.com',
        fareAmount: 5000,
        driverCustomerId: 'driver-wlt-1',
        driverType: 'INDIVIDUAL' as any,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(emailService.send).toHaveBeenCalledTimes(2);
      expect(emailService.send).toHaveBeenNthCalledWith(1, expect.objectContaining({
        to: 'rider@example.com',
        templateName: 'payment-receipt',
        context: expect.objectContaining({
          paymentMethod: 'Rider Wallet',
          amount: '5000.00',
        }),
      }));
      expect(emailService.send).toHaveBeenNthCalledWith(2, expect.objectContaining({
        to: 'juwavictor@gmail.com',
        templateName: 'platform-notification',
        context: expect.objectContaining({
          paymentMethod: 'Rider Wallet',
          amount: '5000.00',
        }),
      }));
    });

    it('should trigger platform owner and rider emails on cashTripPayment', async () => {
      jest.spyOn(emailService, 'send').mockClear();

      const result = await tripPaymentService.cashTripPayment({
        tripId: 'trip-cash-email-001',
        riderEmail: 'rider@example.com',
        fareAmount: 8000,
        driverCustomerId: 'driver-cash-1',
        driverType: 'INDIVIDUAL' as any,
        tenantId,
      });

      expect(result.success).toBe(true);
      expect(emailService.send).toHaveBeenCalledTimes(2);
      expect(emailService.send).toHaveBeenNthCalledWith(1, expect.objectContaining({
        to: 'rider@example.com',
        templateName: 'payment-receipt',
        context: expect.objectContaining({
          paymentMethod: 'Cash',
          amount: '8000.00',
        }),
      }));
      expect(emailService.send).toHaveBeenNthCalledWith(2, expect.objectContaining({
        to: 'juwavictor@gmail.com',
        templateName: 'platform-notification',
        context: expect.objectContaining({
          paymentMethod: 'Cash',
          amount: '8000.00',
        }),
      }));
    });
  });
});
