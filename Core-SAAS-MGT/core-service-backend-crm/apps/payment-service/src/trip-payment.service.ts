import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  PaystackTransaction,
  PaystackTransactionStatus,
} from './entities/paystack-transaction.entity';
import { PaymentGatewayProvider } from './rails/gateway-provider.interface';
import { PaymentGatewayRegistry } from './payment-gateway-registry.service';
import { PaymentAccountService } from './payment-account.service';
import { PaymentAccountEntityType } from './entities/payment-account.entity';
import { MarketplaceLedgerService } from './marketplace-ledger.service';
import { FleetContractService } from './fleet-contract.service';
import { LedgerEntityType, LedgerEntryType } from './entities/marketplace-ledger.entity';
import { EmailService } from '@app/common';
import {
  InitiateTripPaymentDto,
  VerifyTripPaymentDto,
  CompleteTripPaymentDto,
  TripPaymentResponse,
  TripCommissionBreakdown,
  DriverType,
  WalletTripPaymentDto,
  CashTripPaymentDto,
} from './dto/trip-payment.dto';

@Injectable()
export class TripPaymentService {
  private readonly logger = new Logger(TripPaymentService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
    private readonly paymentAccountService: PaymentAccountService,
    private readonly marketplaceLedger: MarketplaceLedgerService,
    private readonly fleetContractService: FleetContractService,
    private readonly emailService: EmailService,
    @InjectRepository(PaystackTransaction)
    private readonly paystackTxRepo: Repository<PaystackTransaction>,
  ) {}

  private async resolveGateway(countryCode?: string): Promise<PaymentGatewayProvider> {
    if (countryCode) {
      const regionProvider = await this.gatewayRegistry.getProviderForRegion(countryCode);
      if (regionProvider) return regionProvider;
    }
    return this.gatewayRegistry.getActiveProvider();
  }

  private get gateway(): PaymentGatewayProvider {
    return this.gatewayRegistry.getActiveProvider();
  }

  private get ledgerBaseUrl() {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT');
    return `http://${host}:${port}/ledger`;
  }

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  private async getCustomerAccount(customerId: string, tenantId: string) {
    const { data } = await axios.get(
      `${this.accountsBaseUrl}/customer/${customerId}`,
      { params: { tenantId } },
    );
    return data as Array<{
      accountNumber: string;
      currency: string;
      glAccountId: string | null;
      customerId: string;
    }>;
  }

  private async lookupFleetSplit(
    tenantId: string,
    driverId: string,
    partnerTenantId?: string,
  ): Promise<{ contractId: string; partnerAmount: number; driverAmount: number; partnerRate: number } | null> {
    try {
      const contract = await this.fleetContractService.findActiveForDriver(tenantId, driverId, partnerTenantId);
      if (!contract) return null;

      const split = this.fleetContractService.calculateSplit({
        totalFare: 0,
        platformRate: 0,
        contract,
      });

      return {
        contractId: contract.id,
        partnerAmount: 0,
        driverAmount: 0,
        partnerRate: split.partnerRate,
      };
    } catch {
      return null;
    }
  }

  private async recordFleetSplit(params: {
    tenantId: string;
    tripId: string;
    currency: string;
    totalFare: number;
    platformRate: number;
    driverCustomerId: string;
    partnerTenantId?: string;
    fareAmountUsedInCommission?: number;
    driverType?: string;
  }): Promise<{
    platformAmount: number;
    partnerAmount: number;
    driverAmount: number;
    partnerId: string | null;
    contractId: string | null;
  }> {
    const { tenantId, tripId, currency, totalFare, platformRate, driverCustomerId, partnerTenantId, fareAmountUsedInCommission, driverType } = params;
    const fare = fareAmountUsedInCommission ?? totalFare;
    const isCorporate = driverType === 'CORPORATE' && !!partnerTenantId;

    const contract = await this.fleetContractService.findActiveForDriver(tenantId, driverCustomerId, partnerTenantId || undefined);
    let platformAmount: number;
    let partnerAmount: number;
    let driverAmount: number;
    let partnerId: string | null = null;
    let contractId: string | null = null;

    if (contract) {
      contractId = contract.id;
      const split = this.fleetContractService.calculateSplit({
        totalFare: fare,
        platformRate,
        contract,
      });
      platformAmount = split.platformAmount;
      partnerAmount = split.partnerAmount;
      driverAmount = split.driverAmount;

      partnerId = contract.partnerId;
      this.logger.log(`Fleet split: driver=${driverCustomerId} partner=${partnerId} platform=${platformAmount} partner=${partnerAmount} driver=${driverAmount}`);
    } else if (isCorporate) {
      partnerAmount = Math.round(fare * 0.05 * 100) / 100;
      platformAmount = Math.round(fare * platformRate * 100) / 100;
      driverAmount = Math.round((fare - platformAmount - partnerAmount) * 100) / 100;
      partnerId = partnerTenantId!;
      this.logger.log(`Corporate split (no contract): driver=${driverCustomerId} partner=${partnerId}`);
    } else {
      platformAmount = Math.round(fare * platformRate * 100) / 100;
      partnerAmount = 0;
      driverAmount = Math.round((fare - platformAmount) * 100) / 100;
      this.logger.log(`Individual split: driver=${driverCustomerId} no partner`);
    }

    await this.marketplaceLedger.recordEntry({
      tenantId, entityType: LedgerEntityType.PLATFORM, entityId: tenantId,
      type: LedgerEntryType.COMMISSION_DEBIT, amount: platformAmount,
      currency, tripId,
      description: `Platform commission ${platformAmount} for trip ${tripId}`,
    });

    if (partnerAmount > 0 && partnerId) {
      await this.marketplaceLedger.recordEntry({
        tenantId, entityType: LedgerEntityType.PARTNER, entityId: partnerId,
        type: LedgerEntryType.FLEET_SPLIT_CREDIT, amount: partnerAmount,
        currency, tripId,
        description: `Partner share ${partnerAmount} for trip ${tripId}`,
      });
    }

    await this.marketplaceLedger.recordEntry({
      tenantId, entityType: LedgerEntityType.DRIVER, entityId: driverCustomerId,
      type: LedgerEntryType.FARE_CREDIT, amount: driverAmount,
      currency, tripId,
      description: `Driver fare credit ${driverAmount} for trip ${tripId}`,
    });

    return { platformAmount, partnerAmount, driverAmount, partnerId, contractId };
  }

  async initiateTripPayment(
    dto: InitiateTripPaymentDto,
  ): Promise<TripPaymentResponse> {
    const gateway = await this.resolveGateway(dto.countryCode);
    const reference = `TRIP-PAY-${uuidv4().slice(0, 12)}`;
    const platformRate = dto.platformCommissionRate || 0.10;
    const partnerRate = dto.partnerCommissionRate || 0.05;
    const isCorporate =
      dto.driverType === DriverType.CORPORATE && !!dto.partnerTenantId;

    const commissionBreakdown = this.calculateTripCommission({
      totalFare: dto.fareAmount,
      platformRate,
      partnerRate,
      isCorporate,
    });

    const paystackTx = this.paystackTxRepo.create({
      reference,
      amount: dto.fareAmount,
      currency: dto.currency || 'NGN',
      status: PaystackTransactionStatus.INITIATED,
      driverCustomerId: dto.driverCustomerId,
      riderCustomerId: dto.riderCustomerId,
      tenantId: dto.tenantId,
      partnerId: dto.partnerTenantId || undefined,
      metadata: {
        tripId: dto.tripId,
        driverType: dto.driverType,
        commissionBreakdown,
        riderEmail: dto.riderEmail,
      },
    });
    await this.paystackTxRepo.save(paystackTx);

    let paystackResult;
    let fleetContractId: string | null = null;

    try {
      const contract = await this.fleetContractService.findActiveForDriver(dto.tenantId, dto.driverCustomerId, dto.partnerTenantId);
      if (contract) {
        fleetContractId = contract.id;
        this.logger.log(`Fleet contract ${contract.id} found for driver ${dto.driverCustomerId}`);
      }

      paystackResult = await gateway.initializeTransaction({
        email: dto.riderEmail,
        amount: dto.fareAmount,
        reference,
        currency: dto.currency || 'NGN',
        metadata: {
          tripId: dto.tripId,
          driverCustomerId: dto.driverCustomerId,
          riderCustomerId: dto.riderCustomerId,
          platformCommission: commissionBreakdown.platformCommissionAmount,
          partnerCommission: commissionBreakdown.partnerCommissionAmount,
          driverPayout: commissionBreakdown.driverPayout,
          isCorporate,
          partnerTenantId: dto.partnerTenantId,
          fleetContractId,
        },
      });

      paystackTx.accessCode = paystackResult.access_code;
      paystackTx.authorizationUrl = paystackResult.authorization_url;
      paystackTx.paystackReference = paystackResult.reference;
      paystackTx.splitConfig = {
        isCorporate,
        platformRate,
        partnerRate,
        commissionBreakdown,
        fleetContractId,
        driverType: dto.driverType,
        driverBankCode: dto.driverBankCode,
        driverAccountNumber: dto.driverAccountNumber,
        partnerBankCode: dto.partnerBankCode,
        partnerAccountNumber: dto.partnerAccountNumber,
      };
      await this.paystackTxRepo.save(paystackTx);
    } catch (error: unknown) {
      paystackTx.status = PaystackTransactionStatus.FAILED;
      await this.paystackTxRepo.save(paystackTx);
      throw error;
    }

    return {
      success: true,
      message: 'Trip payment initialized successfully',
      tripId: dto.tripId,
      paymentReference: reference,
      authorizationUrl: paystackResult.authorization_url,
      accessCode: paystackResult.access_code,
      status: 'INITIATED',
      commissionBreakdown,
    };
  }

  async verifyTripPayment(dto: VerifyTripPaymentDto): Promise<TripPaymentResponse> {
    const paystackTx = await this.paystackTxRepo.findOne({
      where: { reference: dto.paystackReference },
    });
    if (!paystackTx) {
      throw new BadRequestException(
        `Paystack transaction ${dto.paystackReference} not found`,
      );
    }

    if (paystackTx.status === PaystackTransactionStatus.SUCCESS) {
      const meta = (paystackTx.metadata || {}) as Record<string, any>;
      return {
        success: true,
        message: 'Payment already verified',
        tripId: dto.tripId,
        paymentReference: dto.paystackReference,
        status: 'COMPLETED',
        commissionBreakdown: meta.commissionBreakdown as TripCommissionBreakdown,
      };
    }

    const verifiedData = await this.gateway.verifyTransaction(
      dto.paystackReference,
    );

    paystackTx.paystackResponse = verifiedData as any;
    await this.paystackTxRepo.save(paystackTx);

    if (verifiedData.status !== 'success') {
      paystackTx.status = PaystackTransactionStatus.FAILED;
      await this.paystackTxRepo.save(paystackTx);
      return {
        success: false,
        message: `Paystack payment status: ${verifiedData.status}`,
        tripId: dto.tripId,
        paymentReference: dto.paystackReference,
        status: 'FAILED',
      };
    }

    paystackTx.status = PaystackTransactionStatus.PENDING;
    await this.paystackTxRepo.save(paystackTx);

    const meta = (paystackTx.metadata || {}) as Record<string, any>;
    return {
      success: true,
      message: 'Payment verified, ready for completion',
      tripId: dto.tripId,
      paymentReference: dto.paystackReference,
      status: 'PENDING',
      commissionBreakdown: meta.commissionBreakdown as TripCommissionBreakdown,
    };
  }

  async completeTripPayment(
    dto: CompleteTripPaymentDto,
  ): Promise<TripPaymentResponse> {
    const paystackTx = await this.paystackTxRepo.findOne({
      where: { reference: dto.paystackReference },
    });
    if (!paystackTx) {
      throw new BadRequestException(
        `Paystack transaction ${dto.paystackReference} not found`,
      );
    }

    if (paystackTx.status === PaystackTransactionStatus.SUCCESS) {
      const meta = (paystackTx.metadata || {}) as Record<string, any>;
      return {
        success: true,
        message: 'Trip payment already completed',
        tripId: dto.tripId,
        paymentReference: dto.paystackReference,
        status: 'COMPLETED',
        commissionBreakdown: meta.commissionBreakdown as TripCommissionBreakdown,
      };
    }

    if (paystackTx.status !== PaystackTransactionStatus.PENDING) {
      const verified = await this.verifyTripPayment({
        paystackReference: dto.paystackReference,
        tripId: dto.tripId,
        tenantId: dto.tenantId,
      });
      if (!verified.success) {
        return verified;
      }
    }

    const meta = (paystackTx.metadata || {}) as Record<string, any>;
    const commission = meta.commissionBreakdown as TripCommissionBreakdown;
    const isCorporate = meta.isCorporate as boolean;
    const glAccountCodes = await this.resolveGlAccounts(dto.tenantId);

    const journalEntries: Array<{ reference: string; description: string; id: string }> = [];

    const paymentRef = `PAYSTACK-${paystackTx.reference}`;
    const revenueRef = `TRIP-REV-${paystackTx.reference}`;
    const escrowRef = `DRIVER-PAY-${paystackTx.reference}`;

    try {
      const paymentJournal = await axios.post(
        `${this.ledgerBaseUrl}/posting/transaction`,
        {
          reference: paymentRef,
          description: `Paystack payment received for trip ${dto.tripId}`,
          postingDate: new Date(),
          currency: paystackTx.currency || 'NGN',
          tenantId: dto.tenantId,
          entries: [
            {
              glAccountId: glAccountCodes.paystackClearing,
              amount: paystackTx.amount,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes.unsettledCollections,
              amount: paystackTx.amount,
              side: 'CREDIT',
            },
          ],
        },
      );
      journalEntries.push({
        reference: paymentRef,
        description: 'Paystack payment clearing',
        id: paymentJournal.data.id,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Payment journal failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to post payment journal entry');
    }

    try {
      const revenueJournal = await axios.post(
        `${this.ledgerBaseUrl}/posting/transaction`,
        {
          reference: revenueRef,
          description: `Trip revenue allocation for trip ${dto.tripId}`,
          postingDate: new Date(),
          currency: paystackTx.currency || 'NGN',
          tenantId: dto.tenantId,
          entries: [
            {
              glAccountId: glAccountCodes.unsettledCollections,
              amount: paystackTx.amount,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes.tripCommissionRevenue,
              amount: commission.platformCommissionAmount,
              side: 'CREDIT',
            },
            {
              glAccountId: glAccountCodes.gatewayFeePayable,
              amount: commission.gatewayFee,
              side: 'CREDIT',
            },
            ...(isCorporate && commission.partnerCommissionAmount > 0
              ? [
                  {
                    glAccountId: glAccountCodes.partnerCommissionPayable,
                    amount: commission.partnerCommissionAmount,
                    side: 'CREDIT',
                    subLedgerId: dto.partnerId || '',
                    subLedgerType: 'PARTNER_ACCOUNT',
                  },
                ]
              : []),
            {
              glAccountId: glAccountCodes.driverEarningsPayable,
              amount: commission.driverPayout,
              side: 'CREDIT',
              subLedgerId: dto.driverCustomerId,
              subLedgerType: 'DRIVER_ACCOUNT',
            },
          ],
        },
      );
      journalEntries.push({
        reference: revenueRef,
        description: 'Trip revenue allocation',
        id: revenueJournal.data.id,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Revenue journal failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to post revenue allocation journal');
    }

    try {
      const driverAccounts = await this.getCustomerAccount(
        dto.driverCustomerId,
        dto.tenantId,
      );
      const driverWalletAccount = driverAccounts.find(
        (a) => a.currency === (paystackTx.currency || 'NGN'),
      );

      if (driverWalletAccount?.glAccountId) {
        const driverCreditJournal = await axios.post(
          `${this.ledgerBaseUrl}/posting/transaction`,
          {
            reference: escrowRef,
            description: `Driver wallet credit for trip ${dto.tripId}`,
            postingDate: new Date(),
            currency: paystackTx.currency || 'NGN',
            tenantId: dto.tenantId,
            entries: [
              {
                glAccountId: glAccountCodes.driverEarningsPayable,
                amount: commission.driverPayout,
                side: 'DEBIT',
                subLedgerId: dto.driverCustomerId,
                subLedgerType: 'DRIVER_ACCOUNT',
              },
              {
                glAccountId: driverWalletAccount.glAccountId,
                amount: commission.driverPayout,
                side: 'CREDIT',
                subLedgerId: driverWalletAccount.accountNumber,
                subLedgerType: 'CUSTOMER_ACCOUNT',
              },
            ],
          },
        );
        journalEntries.push({
          reference: escrowRef,
          description: 'Driver wallet credit',
          id: driverCreditJournal.data.id,
        });
      }
    } catch (error: unknown) {
      this.logger.error(
        `Driver credit failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to credit driver wallet');
    }

    // Initiate Paystack transfers for driver, platform, and partner
    const transfers: Array<{ recipient: string; amount: number; reference: string; status: string; transferCode?: string }> = [];
    const splitCfg = (paystackTx.splitConfig || {}) as Record<string, any>;
    const splitCode = splitCfg.splitCode;

    // Record marketplace_ledger entries for fleet split
    try {
      const fleetResult = await this.recordFleetSplit({
        tenantId: dto.tenantId,
        tripId: dto.tripId,
        currency: paystackTx.currency || 'NGN',
        totalFare: paystackTx.amount,
        platformRate: splitCfg.platformRate || 0.10,
        driverCustomerId: dto.driverCustomerId,
        partnerTenantId: splitCfg.fleetContractId ? undefined : dto.partnerId,
        fareAmountUsedInCommission: paystackTx.amount,
        driverType: splitCfg.driverType,
      });
      if (fleetResult.contractId) this.logger.log(`Fleet contract ${fleetResult.contractId} applied`);
      if (fleetResult.partnerId) {
        this.logger.log(`Partner ${fleetResult.partnerId} split: ${fleetResult.partnerAmount}`);
      }
    } catch (mlErr: any) {
      this.logger.warn(`Marketplace ledger recording failed (non-fatal): ${mlErr.message}`);
    }

    if (splitCode) {
      this.logger.log(`Disbursement managed automatically via Paystack Split: ${splitCode}`);
      transfers.push({
        recipient: `driver:${dto.driverCustomerId} (via Paystack Split)`,
        amount: commission.driverPayout,
        reference: `SPLIT-DRV-${paystackTx.reference}`,
        status: 'success',
      });
      if (isCorporate && commission.partnerCommissionAmount > 0) {
        transfers.push({
          recipient: `partner:${dto.partnerId || paystackTx.partnerId} (via Paystack Split)`,
          amount: commission.partnerCommissionAmount,
          reference: `SPLIT-PRT-${paystackTx.reference}`,
          status: 'success',
        });
      }
    } else {
      let driverBankCode = dto.driverBankCode || splitCfg.driverBankCode;
      let driverAccountNumber = dto.driverAccountNumber || splitCfg.driverAccountNumber;
      const partnerBankCode = splitCfg.partnerBankCode;
      let partnerAccountNumber = dto.partnerAccountNumber || splitCfg.partnerAccountNumber;

      if (!driverBankCode || !driverAccountNumber) {
        const driverAcc = await this.paymentAccountService.findByEntity(
          dto.tenantId, PaymentAccountEntityType.DRIVER, dto.driverCustomerId,
        );
        if (driverAcc) {
          driverBankCode = driverAcc.bankCode || driverBankCode;
          driverAccountNumber = driverAcc.accountNumber || driverAccountNumber;
        }
      }

      if (commission.driverPayout > 0 && driverAccountNumber && driverBankCode) {
        try {
          const driverRecipientCode = await this.paymentAccountService.getOrCreateRecipient(
            dto.tenantId,
            PaymentAccountEntityType.DRIVER,
            dto.driverCustomerId,
            driverBankCode,
            driverAccountNumber,
            `Driver ${dto.driverCustomerId}`,
          );
          const driverTransfer = await this.gateway.initiateTransfer({
            amount: commission.driverPayout,
            recipient: driverRecipientCode,
            reference: `DRV-TRF-${paystackTx.reference}`,
            reason: `Driver payout for trip ${dto.tripId}`,
          });
          transfers.push({
            recipient: `driver:${dto.driverCustomerId}`,
            amount: commission.driverPayout,
            reference: driverTransfer.reference,
            status: driverTransfer.status,
            transferCode: driverTransfer.transferCode,
          });
          this.logger.log(`Driver payout transfer initiated: ${driverTransfer.reference}`);
        } catch (drvErr) {
          this.logger.warn(`Driver payout transfer failed (non-fatal): ${drvErr instanceof Error ? drvErr.message : String(drvErr)}`);
        }
      }

      if (commission.platformCommissionAmount > 0) {
        try {
          let platformRecipientCode: string | undefined;
          const platformAccount = await this.paymentAccountService.findByEntity(
            dto.tenantId,
            PaymentAccountEntityType.PLATFORM,
            dto.tenantId,
          );
          if (platformAccount?.recipientCode) {
            platformRecipientCode = platformAccount.recipientCode;
          } else {
            const pltBankAcc = this.configService.get<string>('PLATFORM_BANK_ACCOUNT');
            const pltBankCode = this.configService.get<string>('PLATFORM_BANK_CODE');
            if (pltBankAcc && pltBankCode) {
              platformRecipientCode = await this.paymentAccountService.getOrCreateRecipient(
                dto.tenantId,
                PaymentAccountEntityType.PLATFORM,
                dto.tenantId,
                pltBankCode,
                pltBankAcc,
                `Platform ${paystackTx.tenantId}`,
              );
            }
          }
          if (platformRecipientCode) {
            const platformTransfer = await this.gateway.initiateTransfer({
              amount: commission.platformCommissionAmount,
              recipient: platformRecipientCode,
              reference: `PLT-TRF-${paystackTx.reference}`,
              reason: `Platform commission for trip ${dto.tripId}`,
            });
            transfers.push({
              recipient: `platform:${paystackTx.tenantId}`,
              amount: commission.platformCommissionAmount,
              reference: platformTransfer.reference,
              status: platformTransfer.status,
              transferCode: platformTransfer.transferCode,
            });
            this.logger.log(`Platform commission transfer initiated: ${platformTransfer.reference}`);
          } else {
            this.logger.warn('Platform commission transfer skipped — no bank details configured');
          }
        } catch (pltErr) {
          this.logger.warn(`Platform commission transfer failed (non-fatal): ${pltErr instanceof Error ? pltErr.message : String(pltErr)}`);
        }
      }

      if (isCorporate && commission.partnerCommissionAmount > 0 && partnerAccountNumber && partnerBankCode) {
        try {
          const partnerRecipientCode = await this.paymentAccountService.getOrCreateRecipient(
            dto.tenantId,
            PaymentAccountEntityType.PARTNER,
            dto.partnerId || paystackTx.partnerId || '',
            partnerBankCode,
            partnerAccountNumber,
            `Partner ${dto.partnerId || paystackTx.partnerId}`,
          );
          const partnerTransfer = await this.gateway.initiateTransfer({
            amount: commission.partnerCommissionAmount,
            recipient: partnerRecipientCode,
            reference: `PRT-TRF-${paystackTx.reference}`,
            reason: `Partner commission for trip ${dto.tripId}`,
          });
          transfers.push({
            recipient: `partner:${dto.partnerId || paystackTx.partnerId}`,
            amount: commission.partnerCommissionAmount,
            reference: partnerTransfer.reference,
            status: partnerTransfer.status,
            transferCode: partnerTransfer.transferCode,
          });
          this.logger.log(`Partner commission transfer initiated: ${partnerTransfer.reference}`);
        } catch (prtErr) {
          this.logger.warn(`Partner commission transfer failed (non-fatal): ${prtErr instanceof Error ? prtErr.message : String(prtErr)}`);
        }
      }
    }

    paystackTx.status = PaystackTransactionStatus.SUCCESS;
    paystackTx.journalEntryId = journalEntries[0]?.id ?? undefined;
    await this.paystackTxRepo.save(paystackTx);

    // Send emails
    const platformOwnerEmail = this.configService.get<string>('PLATFORM_OWNER_EMAIL') || 'juwavictor@gmail.com';
    const amountInNGN = paystackTx.amount / 100;

    // 1. Send payment receipt to Rider
    try {
      const riderEmail = paystackTx.metadata?.riderEmail as string || '';
      if (riderEmail) {
        await this.emailService.send({
          to: riderEmail,
          subject: `Trip Payment Receipt — ${dto.tripId}`,
          templateName: 'payment-receipt',
          context: {
            riderName: 'Valued Rider',
            tripId: dto.tripId,
            amount: amountInNGN.toFixed(2),
            paymentMethod: 'Paystack Card',
            currency: paystackTx.currency || 'NGN',
            driverPayout: commission.driverPayout.toFixed(2),
            platformCommission: commission.platformCommissionAmount.toFixed(2),
            partnerCommission: commission.partnerCommissionAmount.toFixed(2),
            gatewayFee: commission.gatewayFee.toFixed(2),
            reference: dto.paystackReference,
            year: new Date().getFullYear(),
          },
        });
      }
    } catch (emailError) {
      this.logger.warn(`Rider payment receipt email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    // 2. Send platform notification to Platform Owner
    try {
      await this.emailService.send({
        to: platformOwnerEmail,
        subject: `[Split Commission Alert] Trip #${dto.tripId} Completed`,
        templateName: 'platform-notification',
        context: {
          tripId: dto.tripId,
          amount: amountInNGN.toFixed(2),
          paymentMethod: 'Paystack Card',
          currency: paystackTx.currency || 'NGN',
          platformCommission: commission.platformCommissionAmount.toFixed(2),
          driverPayout: commission.driverPayout.toFixed(2),
          partnerCommission: commission.partnerCommissionAmount.toFixed(2),
          gatewayFee: commission.gatewayFee.toFixed(2),
          reference: dto.paystackReference,
          year: new Date().getFullYear(),
        },
      });
    } catch (emailError) {
      this.logger.warn(`Platform owner notification email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    // Award Queens coins to rider, driver, and tenant
    try {
      await axios.post(`${this.ledgerBaseUrl}/coin-reward/award-trip`, {
        tripId: dto.tripId,
        tenantId: dto.tenantId,
        riderCustomerId: paystackTx.riderCustomerId,
        driverCustomerId: dto.driverCustomerId,
      }, { timeout: 5000 });
      this.logger.log(`Coin rewards awarded for trip ${dto.tripId}`);
    } catch (coinError) {
      this.logger.warn(`Coin reward award failed (non-fatal): ${coinError instanceof Error ? coinError.message : String(coinError)}`);
    }

    return {
      success: true,
      message: 'Trip payment completed successfully',
      tripId: dto.tripId,
      paymentReference: dto.paystackReference,
      status: 'COMPLETED',
      commissionBreakdown: commission,
      journalEntries,
      transfers,
    };
  }

  async handlePaystackWebhook(
    rawBody: string,
    signature: string | undefined,
    body: Record<string, any>,
  ): Promise<{ status: string; message: string }> {
    const isValid = this.gateway.verifyWebhookSignature?.(signature || '', rawBody) ?? false;
    if (!isValid && signature) {
      this.logger.warn('Paystack webhook: invalid signature (continuing for test mode)');
    }

    const event = body?.event || '';
    const eventData = body?.data || {};

    if (event === 'charge.success') {
      const reference = eventData.reference;
      if (!reference) {
        this.logger.warn('Paystack webhook: charge.success without reference');
        return { status: 'skipped', message: 'No reference in event data' };
      }

      const paystackTx = await this.paystackTxRepo.findOne({
        where: { reference },
      });
      if (!paystackTx) {
        this.logger.warn(`Paystack webhook: transaction ${reference} not found`);
        return { status: 'skipped', message: 'Transaction not found' };
      }

      if (paystackTx.status === PaystackTransactionStatus.SUCCESS) {
        this.logger.log(`Paystack webhook: transaction ${reference} already completed`);
        return { status: 'skipped', message: 'Already completed' };
      }

      paystackTx.status = PaystackTransactionStatus.PENDING;
      paystackTx.paystackResponse = eventData;
      await this.paystackTxRepo.save(paystackTx);

      const meta = (paystackTx.metadata || {}) as Record<string, any>;
      const splitCfg = (paystackTx.splitConfig || {}) as Record<string, any>;

      await this.completeTripPayment({
        paystackReference: reference,
        tripId: meta.tripId || '',
        driverCustomerId: paystackTx.driverCustomerId || '',
        driverBankCode: splitCfg.driverBankCode,
        driverAccountNumber: splitCfg.driverAccountNumber,
        partnerAccountNumber: splitCfg.partnerAccountNumber,
        partnerId: paystackTx.partnerId,
        tenantId: paystackTx.tenantId || 'root-admin',
      });

      this.logger.log(`Paystack webhook: trip payment completed for ${reference}`);
      return { status: 'completed', message: 'Trip payment completed' };
    }

    this.logger.log(`Paystack webhook: unhandled event ${event}`);
    return { status: 'ignored', message: `Unhandled event: ${event}` };
  }

  calculateTripCommission(params: {
    totalFare: number;
    platformRate: number;
    partnerRate: number;
    isCorporate: boolean;
    gatewayFeeRate?: number;
  }): TripCommissionBreakdown {
    const gatewayFeeRate = params.gatewayFeeRate ?? 0.015;
    const totalFare = Number(params.totalFare);
    const platformCommissionAmount = Math.round(totalFare * params.platformRate * 100) / 100;
    const partnerCommissionAmount = params.isCorporate
      ? Math.round(totalFare * params.partnerRate * 100) / 100
      : 0;
    const gatewayFee = Math.round(totalFare * gatewayFeeRate * 100) / 100;
    const driverPayout = Math.round(
      (totalFare - platformCommissionAmount - partnerCommissionAmount - gatewayFee) * 100,
    ) / 100;

    return {
      totalFare,
      platformCommissionRate: params.platformRate,
      platformCommissionAmount,
      partnerCommissionRate: params.partnerRate,
      partnerCommissionAmount,
      driverPayout,
      gatewayFee,
      netSettlement: totalFare - gatewayFee,
    };
  }

  private async resolveGlAccounts(tenantId: string) {
    const { data: { data: accounts } } = await axios.get(
      `${this.ledgerBaseUrl}/accounts`,
      { params: { tenantId } },
    );

    const findByCode = (code: string) => {
      const acc = (accounts as Array<{ code: string; id: string }>).find(
        (a: { code: string }) => a.code === code,
      );
      if (!acc)
        throw new BadRequestException(`GL Account ${code} not found for tenant ${tenantId}`);
      return acc.id;
    };

    return {
      paystackClearing: findByCode('1201'),
      unsettledCollections: findByCode('2402'),
      tripCommissionRevenue: findByCode('4201'),
      partnerCommissionPayable: findByCode('2202'),
      partnerCommissionRevenue: findByCode('4202'),
      driverWalletLiability: findByCode('2101'),
      driverEarningsPayable: findByCode('2302'),
      driverWalletBalance: findByCode('2301'),
      cashAtBank: findByCode('1101'),
      gatewayFeePayable: findByCode('5101'),
      driverCommissionReceivable: findByCode('1403'),
    };
  }

  async walletTripPayment(
    dto: WalletTripPaymentDto,
  ): Promise<TripPaymentResponse> {
    const gateway = await this.resolveGateway(dto.countryCode);
    const reference = `TRIP-WLT-${uuidv4().slice(0, 12)}`;
    const platformRate = dto.platformCommissionRate || 0.10;
    const partnerRate = dto.partnerCommissionRate || 0.05;
    const isCorporate =
      dto.driverType === DriverType.CORPORATE && !!dto.partnerTenantId;

    const commission = this.calculateTripCommission({
      totalFare: dto.fareAmount,
      platformRate,
      partnerRate,
      isCorporate,
      gatewayFeeRate: 0,
    });

    const glAccountCodes = await this.resolveGlAccounts(dto.tenantId);

    const riderAccounts = await this.getCustomerAccount(
      dto.riderCustomerId,
      dto.tenantId,
    );
    const currency = dto.currency || 'NGN';
    const riderWallet = riderAccounts.find((a) => a.currency === currency);
    if (!riderWallet) {
      throw new BadRequestException(
        `Rider has no wallet for currency ${currency}`,
      );
    }

    const { data: accountDetails } = await axios.get(
      `${this.accountsBaseUrl}/${riderWallet.accountNumber}`,
    );
    if (Number(accountDetails.balance) < dto.fareAmount) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    const journalEntries: Array<{ reference: string; description: string; id: string }> = [];

    const paymentRef = `WLT-PAY-${reference}`;
    const revenueRef = `TRIP-REV-${reference}`;
    const escrowRef = `DRIVER-PAY-${reference}`;

    try {
      const paymentJournal = await axios.post(
        `${this.ledgerBaseUrl}/posting/transaction`,
        {
          reference: paymentRef,
          description: `Wallet payment received for trip ${dto.tripId}`,
          postingDate: new Date(),
          currency,
          tenantId: dto.tenantId,
          entries: [
            {
              glAccountId: riderWallet.glAccountId || glAccountCodes.driverWalletLiability,
              amount: dto.fareAmount,
              side: 'DEBIT',
              subLedgerId: riderWallet.accountNumber,
              subLedgerType: 'CUSTOMER_ACCOUNT',
            },
            {
              glAccountId: glAccountCodes.unsettledCollections,
              amount: dto.fareAmount,
              side: 'CREDIT',
            },
          ],
        },
      );
      journalEntries.push({
        reference: paymentRef,
        description: 'Rider wallet debit',
        id: paymentJournal.data.id,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Wallet payment journal failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException(
        `Failed to post wallet payment journal entry: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // Record marketplace_ledger entries for fleet split (wallet payment)
    try {
      await this.recordFleetSplit({
        tenantId: dto.tenantId,
        tripId: dto.tripId,
        currency,
        totalFare: dto.fareAmount,
        platformRate: dto.platformCommissionRate || 0.10,
        driverCustomerId: dto.driverCustomerId,
        partnerTenantId: dto.partnerTenantId,
        driverType: dto.driverType,
      });
    } catch (mlErr: any) {
      this.logger.warn(`Marketplace ledger recording failed (non-fatal): ${mlErr.message}`);
    }

    try {
      const revenueJournal = await axios.post(
        `${this.ledgerBaseUrl}/posting/transaction`,
        {
          reference: revenueRef,
          description: `Trip revenue allocation for trip ${dto.tripId}`,
          postingDate: new Date(),
          currency,
          tenantId: dto.tenantId,
          entries: [
            {
              glAccountId: glAccountCodes.unsettledCollections,
              amount: dto.fareAmount,
              side: 'DEBIT',
            },
            {
              glAccountId: glAccountCodes.tripCommissionRevenue,
              amount: commission.platformCommissionAmount,
              side: 'CREDIT',
            },
            ...(commission.gatewayFee > 0
              ? [
                  {
                    glAccountId: glAccountCodes.gatewayFeePayable,
                    amount: commission.gatewayFee,
                    side: 'CREDIT',
                  },
                ]
              : []),
            ...(isCorporate && commission.partnerCommissionAmount > 0
              ? [
                  {
                    glAccountId: glAccountCodes.partnerCommissionPayable,
                    amount: commission.partnerCommissionAmount,
                    side: 'CREDIT',
                    subLedgerId: dto.partnerTenantId || '',
                    subLedgerType: 'PARTNER_ACCOUNT',
                  },
                ]
              : []),
            {
              glAccountId: glAccountCodes.driverEarningsPayable,
              amount: commission.driverPayout,
              side: 'CREDIT',
              subLedgerId: dto.driverCustomerId,
              subLedgerType: 'DRIVER_ACCOUNT',
            },
          ],
        },
      );
      journalEntries.push({
        reference: revenueRef,
        description: 'Trip revenue allocation',
        id: revenueJournal.data.id,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Revenue journal failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to post revenue allocation journal');
    }

    try {
      const driverAccounts = await this.getCustomerAccount(
        dto.driverCustomerId,
        dto.tenantId,
      );
      const driverWalletAccount = driverAccounts.find(
        (a) => a.currency === currency,
      );

      if (driverWalletAccount?.glAccountId) {
        const driverCreditJournal = await axios.post(
          `${this.ledgerBaseUrl}/posting/transaction`,
          {
            reference: escrowRef,
            description: `Driver wallet credit for trip ${dto.tripId}`,
            postingDate: new Date(),
            currency,
            tenantId: dto.tenantId,
            entries: [
              {
                glAccountId: glAccountCodes.driverEarningsPayable,
                amount: commission.driverPayout,
                side: 'DEBIT',
                subLedgerId: dto.driverCustomerId,
                subLedgerType: 'DRIVER_ACCOUNT',
              },
              {
                glAccountId: driverWalletAccount.glAccountId,
                amount: commission.driverPayout,
                side: 'CREDIT',
                subLedgerId: driverWalletAccount.accountNumber,
                subLedgerType: 'CUSTOMER_ACCOUNT',
              },
            ],
          },
        );
        journalEntries.push({
          reference: escrowRef,
          description: 'Driver wallet credit',
          id: driverCreditJournal.data.id,
        });
      }
    } catch (error: unknown) {
      this.logger.error(
        `Driver credit failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Failed to credit driver wallet');
    }

    try {
      await axios.post(`${this.ledgerBaseUrl}/coin-reward/award-trip`, {
        tripId: dto.tripId,
        tenantId: dto.tenantId,
        riderCustomerId: dto.riderCustomerId,
        driverCustomerId: dto.driverCustomerId,
      }, { timeout: 5000 });
      this.logger.log(`Coin rewards awarded for trip ${dto.tripId}`);
    } catch (coinError) {
      this.logger.warn(`Coin reward award failed (non-fatal): ${coinError instanceof Error ? coinError.message : String(coinError)}`);
    }

    // Send emails
    const platformOwnerEmail = this.configService.get<string>('PLATFORM_OWNER_EMAIL') || 'juwavictor@gmail.com';
    const amountInNGN = dto.fareAmount;

    // 1. Send payment receipt to Rider
    try {
      const riderEmail = dto.riderEmail || '';
      if (riderEmail) {
        await this.emailService.send({
          to: riderEmail,
          subject: `Trip Payment Receipt — ${dto.tripId}`,
          templateName: 'payment-receipt',
          context: {
            riderName: 'Valued Rider',
            tripId: dto.tripId,
            amount: amountInNGN.toFixed(2),
            paymentMethod: 'Rider Wallet',
            currency,
            driverPayout: commission.driverPayout.toFixed(2),
            platformCommission: commission.platformCommissionAmount.toFixed(2),
            partnerCommission: commission.partnerCommissionAmount.toFixed(2),
            gatewayFee: '0.00',
            reference: paymentRef,
            year: new Date().getFullYear(),
          },
        });
      }
    } catch (emailError) {
      this.logger.warn(`Rider payment receipt email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    // 2. Send platform notification to Platform Owner
    try {
      await this.emailService.send({
        to: platformOwnerEmail,
        subject: `[Split Commission Alert] Trip #${dto.tripId} Completed`,
        templateName: 'platform-notification',
        context: {
          tripId: dto.tripId,
          amount: amountInNGN.toFixed(2),
          paymentMethod: 'Rider Wallet',
          currency,
          platformCommission: commission.platformCommissionAmount.toFixed(2),
          driverPayout: commission.driverPayout.toFixed(2),
          partnerCommission: commission.partnerCommissionAmount.toFixed(2),
          gatewayFee: '0.00',
          reference: paymentRef,
          year: new Date().getFullYear(),
        },
      });
    } catch (emailError) {
      this.logger.warn(`Platform owner notification email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    return {
      success: true,
      message: 'Trip payment completed successfully via Rider Wallet',
      tripId: dto.tripId,
      paymentReference: reference,
      status: 'COMPLETED',
      commissionBreakdown: commission,
      journalEntries,
    };
  }

  /**
   * Cash Trip Payment Flow
   * ─────────────────────
   * Driver collects cash from rider at end of trip.
   * Platform records the owed commission as a DEBT against the driver.
   *
   * Ledger journal (double-entry):
   *   DR  1403  Driver Commission Receivable  (what driver owes platform)
   *   CR  4201  Trip Commission Revenue       (platform earned)
   *   CR  2202  Partner Commission Payable    (if corporate, partner share)
   *
   * The total DR always equals total CR (balanced).
   */
  async cashTripPayment(
    dto: CashTripPaymentDto,
  ): Promise<TripPaymentResponse> {
    const gateway = await this.resolveGateway(dto.countryCode);
    const reference = `CASH-TRIP-${uuidv4().slice(0, 12)}`;
    const platformRate = dto.platformCommissionRate || 0.10;
    const partnerRate = dto.partnerCommissionRate || 0.05;
    const isCorporate = dto.driverType === DriverType.CORPORATE && !!dto.partnerTenantId;

    // No gateway fee for cash trips — rider pays exact cash
    const commission = this.calculateTripCommission({
      totalFare: dto.fareAmount,
      platformRate,
      partnerRate,
      isCorporate,
      gatewayFeeRate: 0,
    });

    const glAccountCodes = await this.resolveGlAccounts(dto.tenantId);
    let journalEntryId: string | null = null;

    // Build balanced journal entries for the cash commission
    const entries: Array<{
      glAccountId: string;
      amount: number;
      side: string;
      subLedgerId?: string;
      subLedgerType?: string;
    }> = [
      // DR: Driver owes the platform commission
      {
        glAccountId: glAccountCodes.driverCommissionReceivable,
        amount: commission.platformCommissionAmount + commission.partnerCommissionAmount,
        side: 'DEBIT',
        subLedgerId: dto.driverCustomerId,
        subLedgerType: 'DRIVER_ACCOUNT',
      },
      // CR: Platform revenue earned
      {
        glAccountId: glAccountCodes.tripCommissionRevenue,
        amount: commission.platformCommissionAmount,
        side: 'CREDIT',
      },
    ];

    if (isCorporate && commission.partnerCommissionAmount > 0) {
      entries.push({
        glAccountId: glAccountCodes.partnerCommissionPayable,
        amount: commission.partnerCommissionAmount,
        side: 'CREDIT',
        subLedgerId: dto.partnerTenantId || '',
        subLedgerType: 'PARTNER_ACCOUNT',
      });
    }

    try {
      const { data: journal } = await axios.post(
        `${this.ledgerBaseUrl}/posting/transaction`,
        {
          reference,
          description: `Cash trip commission accrual — trip ${dto.tripId}`,
          postingDate: new Date(),
          currency: dto.currency || 'NGN',
          tenantId: dto.tenantId,
          entries,
        },
      );
      journalEntryId = (journal as { id: string }).id;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : String(error);
      this.logger.error(`Cash trip ledger posting failed: ${message}`);
      throw new BadRequestException(`Failed to post cash trip journal: ${message}`);
    }

    // Record marketplace_ledger entries for cash trip fleet split
    try {
      const fleetSplit = await this.recordFleetSplit({
        tenantId: dto.tenantId,
        tripId: dto.tripId,
        currency: dto.currency || 'NGN',
        totalFare: dto.fareAmount,
        platformRate: dto.platformCommissionRate || 0.10,
        driverCustomerId: dto.driverCustomerId,
        partnerTenantId: dto.partnerTenantId,
        driverType: dto.driverType,
      });

      // Driver cash collected debit (driver collected full fare, owes the system)
      await this.marketplaceLedger.recordEntry({
        tenantId: dto.tenantId,
        entityType: LedgerEntityType.DRIVER,
        entityId: dto.driverCustomerId,
        type: LedgerEntryType.CASH_COLLECTED_DEBIT,
        amount: -dto.fareAmount,
        currency: dto.currency || 'NGN',
        tripId: dto.tripId,
        description: `Driver collected cash ${dto.fareAmount} for trip ${dto.tripId}`,
      });

      this.logger.log(
        `Cash trip marketplace ledger: platform=${fleetSplit.platformAmount} partner=${fleetSplit.partnerAmount} driver=${fleetSplit.driverAmount}`,
      );
    } catch (mlErr: any) {
      this.logger.warn(`Cash trip marketplace ledger failed (non-fatal): ${mlErr.message}`);
    }

    // Notify wallet-service to record the commission as a debt against the driver
    try {
      const walletHost = this.configService.get<string>('WALLET_SERVICE_HOST');
      const walletPort = this.configService.get<number>('WALLET_SERVICE_PORT');
      await axios.post(
        `http://${walletHost}:${walletPort}/wallet/driver-debt/record-commission`,
        {
          tenantId: dto.tenantId,
          driverCustomerId: dto.driverCustomerId,
          commissionAmount: commission.platformCommissionAmount + commission.partnerCommissionAmount,
          tripId: dto.tripId,
        },
      );
    } catch (debtError: unknown) {
      // Non-fatal: log but don't fail the whole transaction — debt can be reconciled later
      this.logger.warn(
        `Wallet debt record call failed (non-fatal): ${debtError instanceof Error ? debtError.message : String(debtError)}`,
      );
    }

    // Award Queens coins for cash trip (driver earns coins too)
    try {
      await axios.post(
        `${this.ledgerBaseUrl}/coin-reward/award-trip`,
        {
          tripId: dto.tripId,
          tenantId: dto.tenantId,
          driverCustomerId: dto.driverCustomerId,
        },
        { timeout: 5000 },
      );
    } catch (coinError) {
      this.logger.warn(
        `Coin reward award failed (non-fatal): ${coinError instanceof Error ? coinError.message : String(coinError)}`,
      );
    }

    // Send emails
    const platformOwnerEmail = this.configService.get<string>('PLATFORM_OWNER_EMAIL') || 'juwavictor@gmail.com';
    const amountInNGN = dto.fareAmount;
    const currency = dto.currency || 'NGN';

    // 1. Send payment receipt to Rider (if riderEmail is provided)
    try {
      const riderEmail = dto.riderEmail || '';
      if (riderEmail) {
        await this.emailService.send({
          to: riderEmail,
          subject: `Trip Payment Receipt — ${dto.tripId}`,
          templateName: 'payment-receipt',
          context: {
            riderName: 'Valued Rider',
            tripId: dto.tripId,
            amount: amountInNGN.toFixed(2),
            paymentMethod: 'Cash',
            currency,
            driverPayout: commission.driverPayout.toFixed(2),
            platformCommission: commission.platformCommissionAmount.toFixed(2),
            partnerCommission: commission.partnerCommissionAmount.toFixed(2),
            gatewayFee: '0.00',
            reference,
            year: new Date().getFullYear(),
          },
        });
      }
    } catch (emailError) {
      this.logger.warn(`Rider payment receipt email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    // 2. Send platform notification to Platform Owner
    try {
      await this.emailService.send({
        to: platformOwnerEmail,
        subject: `[Split Commission Alert] Trip #${dto.tripId} Completed`,
        templateName: 'platform-notification',
        context: {
          tripId: dto.tripId,
          amount: amountInNGN.toFixed(2),
          paymentMethod: 'Cash',
          currency,
          platformCommission: commission.platformCommissionAmount.toFixed(2),
          driverPayout: commission.driverPayout.toFixed(2),
          partnerCommission: commission.partnerCommissionAmount.toFixed(2),
          gatewayFee: '0.00',
          reference,
          year: new Date().getFullYear(),
        },
      });
    } catch (emailError) {
      this.logger.warn(`Platform owner notification email failed (non-fatal): ${emailError instanceof Error ? emailError.message : String(emailError)}`);
    }

    return {
      success: true,
      message: 'Cash trip commission recorded. Driver debt updated.',
      tripId: dto.tripId,
      paymentReference: reference,
      status: 'SUCCESS',
      commissionBreakdown: commission,
      debtReference: reference,
      journalEntryId,
    };
  }

  async getTransactionByReference(reference: string) {
    return this.paystackTxRepo.findOne({
      where: { reference },
    });
  }

  async listTripPayments(tripId: string) {
    return this.paystackTxRepo.find({
      where: { reference: tripId } as any,
    });
  }
}
