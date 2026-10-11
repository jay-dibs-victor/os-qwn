import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentAccount, PaymentAccountEntityType } from './entities/payment-account.entity';
import { PaymentGatewayRegistry } from './payment-gateway-registry.service';
import { CreatePaymentAccountDto } from './dto/payment-account.dto';

@Injectable()
export class PaymentAccountService {
  private readonly logger = new Logger(PaymentAccountService.name);

  constructor(
    @InjectRepository(PaymentAccount)
    private readonly repo: Repository<PaymentAccount>,
    private readonly gatewayRegistry: PaymentGatewayRegistry,
  ) {}

  async findByEntity(
    tenantId: string,
    entityType: PaymentAccountEntityType,
    entityId: string,
  ): Promise<PaymentAccount | null> {
    return this.repo.findOne({
      where: { tenantId, entityType, entityId, isActive: true },
    });
  }

  async upsert(dto: CreatePaymentAccountDto): Promise<PaymentAccount> {
    let account = await this.repo.findOne({
      where: {
        tenantId: dto.tenantId,
        entityType: dto.entityType,
        entityId: dto.entityId,
      },
    });

    if (account) {
      Object.assign(account, dto);
    } else {
      account = this.repo.create(dto);
    }

    return this.repo.save(account);
  }

  async getOrCreateSubaccount(
    tenantId: string,
    entityType: PaymentAccountEntityType,
    entityId: string,
    bankCode: string,
    accountNumber: string,
    accountName: string,
  ): Promise<string> {
    const existing = await this.findByEntity(tenantId, entityType, entityId);
    if (existing?.subaccountCode) {
      this.logger.log(`Reusing existing subaccount ${existing.subaccountCode} for ${entityType}:${entityId}`);
      return existing.subaccountCode;
    }

    const sub = await this.gatewayRegistry.getActiveProvider().createSubaccount({
      businessName: accountName || `${entityType} ${entityId}`,
      bankCode,
      accountNumber,
      percentageCharge: 0,
    });

    this.logger.log(`Created subaccount ${sub.subaccountCode} for ${entityType}:${entityId}`);

    await this.upsert({
      tenantId,
      entityType,
      entityId,
      bankCode,
      accountNumber,
      accountName,
      subaccountCode: sub.subaccountCode,
    });

    return sub.subaccountCode;
  }

  async getOrCreateRecipient(
    tenantId: string,
    entityType: PaymentAccountEntityType,
    entityId: string,
    bankCode: string,
    accountNumber: string,
    accountName: string,
  ): Promise<string> {
    const existing = await this.findByEntity(tenantId, entityType, entityId);
    if (existing?.recipientCode) {
      this.logger.log(`Reusing existing recipient ${existing.recipientCode} for ${entityType}:${entityId}`);
      return existing.recipientCode;
    }

    const recipient = await this.gatewayRegistry.getActiveProvider().createTransferRecipient({
      type: 'nuban',
      name: accountName || `${entityType} ${entityId}`,
      accountNumber,
      bankCode,
    });

    this.logger.log(`Created recipient ${recipient.recipientCode} for ${entityType}:${entityId}`);

    await this.upsert({
      tenantId,
      entityType,
      entityId,
      bankCode,
      accountNumber,
      accountName,
      recipientCode: recipient.recipientCode,
    });

    return recipient.recipientCode;
  }
}
