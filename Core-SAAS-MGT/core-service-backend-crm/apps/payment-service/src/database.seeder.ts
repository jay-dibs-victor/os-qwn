import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentAccountService } from './payment-account.service';
import { PaymentAccountEntityType } from './entities/payment-account.entity';
import {
  PaymentProviderConfig,
  ProviderType,
} from './entities/payment-provider-config.entity';
import { ProviderRegion } from './entities/provider-region.entity';

const BANK_CODE_MAP: Record<string, string> = {
  'GTBank': '058',
  'Access Bank': '044',
  'Zenith Bank': '057',
  'First Bank': '011',
  'UBA': '033',
  'Opay': '304',
  'PalmPay': '305',
  'Moniepoint': '306',
  'Kuda Bank': '50211',
  'FCMB': '214',
};
const BANK_NAMES = Object.keys(BANK_CODE_MAP);

interface DriverSeed {
  customerId: string;
  tenantId: string;
}

interface PartnerSeed {
  customerId: string;
  tenantId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface DefaultProviderSeed {
  name: string;
  providerType: ProviderType;
  apiKey: string;
  secretKey: string;
  webhookSecret?: string;
  baseUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface DefaultRegionSeed {
  countryCode: string;
  providerName: string;
  currency: string;
  isActive: boolean;
}

@Injectable()
export class DatabaseSeeder {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    private readonly svc: PaymentAccountService,
    @InjectRepository(PaymentProviderConfig)
    private readonly configRepo: Repository<PaymentProviderConfig>,
    @InjectRepository(ProviderRegion)
    private readonly regionRepo: Repository<ProviderRegion>,
    private readonly configService: ConfigService,
  ) {}

  async seed(): Promise<void> {
    this.logger.log('Seeding PaymentAccounts via Paystack...');
    try {
      await this.seedPlatform();
      await this.seedDrivers();
      await this.seedRiders();
      await this.seedEcosystemPartners();
      this.logger.log('PaymentAccount seeding completed');
    } catch (error) {
      this.logger.error('PaymentAccount seeding failed:', error);
    }

    await this.seedProviderConfigs();
    await this.seedRegionMappings();
  }

  private async seedProviderConfigs(): Promise<void> {
    this.logger.log('Seeding payment provider configs...');
    const env = this.configService.get<string>('NODE_ENV') || 'development';

    const defaults: DefaultProviderSeed[] = [
      {
        name: 'paystack',
        providerType: ProviderType.PAYSTACK,
        apiKey: this.configService.get<string>('PAYSTACK_PUBLIC_KEY') || '',
        secretKey:
          this.configService.get<string>('PAYSTACK_SECRET_KEY') || '',
        webhookSecret:
          this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || '',
        baseUrl: 'https://api.paystack.co',
        isActive: true,
        isDefault: true,
        sortOrder: 1,
      },
      {
        name: 'stripe',
        providerType: ProviderType.STRIPE,
        apiKey: this.configService.get<string>('STRIPE_PUBLISHABLE_KEY') || '',
        secretKey: this.configService.get<string>('STRIPE_SECRET_KEY') || '',
        webhookSecret:
          this.configService.get<string>('STRIPE_WEBHOOK_SECRET') || '',
        baseUrl: 'https://api.stripe.com/v1',
        isActive: true,
        isDefault: false,
        sortOrder: 2,
      },
      {
        name: 'nibbs',
        providerType: ProviderType.NIBBS,
        apiKey: this.configService.get<string>('NIBBS_API_KEY') || '',
        secretKey: this.configService.get<string>('NIBBS_SECRET_KEY') || '',
        webhookSecret:
          this.configService.get<string>('NIBBS_WEBHOOK_SECRET') || '',
        baseUrl: this.configService.get<string>('NIBBS_BASE_URL') || '',
        isActive: false,
        isDefault: false,
        sortOrder: 3,
      },
    ];

    for (const def of defaults) {
      const exists = await this.configRepo.findOne({
        where: { name: def.name },
      });
      if (exists) {
        if (env !== 'production') {
          exists.apiKey = def.apiKey || exists.apiKey;
          exists.secretKey = def.secretKey || exists.secretKey;
          exists.webhookSecret = def.webhookSecret || exists.webhookSecret;
          exists.baseUrl = def.baseUrl || exists.baseUrl;
          await this.configRepo.save(exists);
        }
      } else {
        await this.configRepo.save(this.configRepo.create(def));
        this.logger.log(`Seeded provider config: ${def.name}`);
      }
    }
  }

  private async seedRegionMappings(): Promise<void> {
    this.logger.log('Seeding region-to-provider mappings...');

    const regions: DefaultRegionSeed[] = [
      { countryCode: 'NG', providerName: 'paystack', currency: 'NGN', isActive: true },
      { countryCode: 'GH', providerName: 'paystack', currency: 'GHS', isActive: true },
      { countryCode: 'KE', providerName: 'stripe', currency: 'KES', isActive: true },
      { countryCode: 'ZA', providerName: 'stripe', currency: 'ZAR', isActive: true },
      { countryCode: 'RW', providerName: 'stripe', currency: 'RWF', isActive: true },
      { countryCode: 'UG', providerName: 'stripe', currency: 'UGX', isActive: true },
      { countryCode: 'TZ', providerName: 'stripe', currency: 'TZS', isActive: true },
      { countryCode: 'US', providerName: 'stripe', currency: 'USD', isActive: true },
      { countryCode: 'GB', providerName: 'stripe', currency: 'GBP', isActive: true },
      { countryCode: 'CA', providerName: 'stripe', currency: 'CAD', isActive: true },
      { countryCode: 'DE', providerName: 'stripe', currency: 'EUR', isActive: true },
      { countryCode: 'FR', providerName: 'stripe', currency: 'EUR', isActive: true },
      { countryCode: 'AE', providerName: 'stripe', currency: 'AED', isActive: true },
      { countryCode: 'IN', providerName: 'stripe', currency: 'INR', isActive: true },
    ];

    for (const reg of regions) {
      const exists = await this.regionRepo.findOne({
        where: { countryCode: reg.countryCode },
      });
      if (!exists) {
        await this.regionRepo.save(this.regionRepo.create(reg));
        this.logger.log(`Seeded region: ${reg.countryCode} → ${reg.providerName} (${reg.currency})`);
      } else {
        exists.providerName = reg.providerName;
        exists.currency = reg.currency;
        exists.isActive = reg.isActive;
        await this.regionRepo.save(exists);
      }
    }
  }

  private async seedPlatform(): Promise<void> {
    const tenantId = 'root-admin';
    const entityId = 'root-admin';
    const existing = await this.svc.findByEntity(
      tenantId,
      PaymentAccountEntityType.PLATFORM,
      entityId,
    );
    if (existing?.subaccountCode && existing?.recipientCode) {
      this.logger.log(`  ↩ Platform already has subaccount/recipient, skipping`);
      return;
    }
    try {
      const subCode = await this.svc.getOrCreateSubaccount(
        tenantId,
        PaymentAccountEntityType.PLATFORM,
        entityId,
        '044',
        '1234567890',
        'Queens OS Platform',
      );
      const recCode = await this.svc.getOrCreateRecipient(
        tenantId,
        PaymentAccountEntityType.PLATFORM,
        entityId,
        '044',
        '1234567890',
        'Queens OS Platform',
      );
      this.logger.log(`  ✓ Platform subaccount=${subCode} recipient=${recCode}`);
    } catch (err) {
      this.logger.warn(
        `  Platform Paystack creation failed (non-fatal): ${err}`,
      );
    }
  }

  private async seedDrivers(): Promise<void> {
    const drivers: DriverSeed[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000001 + i),
        tenantId: 'root-admin',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000026 + i),
        tenantId: 'tenant-001',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000051 + i),
        tenantId: 'tenant-002',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000076 + i),
        tenantId: 'acme-corp',
      })),
    ];

    for (const d of drivers) {
      const existing = await this.svc.findByEntity(
        d.tenantId,
        PaymentAccountEntityType.DRIVER,
        d.customerId,
      );
      if (existing?.subaccountCode && existing?.recipientCode) continue;

      const bankName =
        BANK_NAMES[Math.floor(Math.random() * BANK_NAMES.length)];
      const bankCode = BANK_CODE_MAP[bankName];
      const accNum = `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const accName = `Driver ${d.customerId}`;

      try {
        const subCode = await this.svc.getOrCreateSubaccount(
          d.tenantId,
          PaymentAccountEntityType.DRIVER,
          d.customerId,
          bankCode,
          accNum,
          accName,
        );
        const recCode = await this.svc.getOrCreateRecipient(
          d.tenantId,
          PaymentAccountEntityType.DRIVER,
          d.customerId,
          bankCode,
          accNum,
          accName,
        );
        this.logger.debug(`  Driver ${d.customerId} sub=${subCode} rec=${recCode}`);
      } catch (err) {
        this.logger.warn(
          `  Driver ${d.customerId} Paystack creation failed (non-fatal): ${err}`,
        );
      }
    }
    this.logger.log(`  ✓ ${drivers.length} drivers processed`);
  }

  private async seedRiders(): Promise<void> {
    const riders: DriverSeed[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000011 + i),
        tenantId: 'root-admin',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000036 + i),
        tenantId: 'tenant-001',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000061 + i),
        tenantId: 'tenant-002',
      })),
      ...Array.from({ length: 10 }, (_, i) => ({
        customerId: String(1000000086 + i),
        tenantId: 'acme-corp',
      })),
    ];

    for (const r of riders) {
      const existing = await this.svc.findByEntity(
        r.tenantId,
        PaymentAccountEntityType.DRIVER,
        r.customerId,
      );
      if (existing?.recipientCode) continue;

      const bankName =
        BANK_NAMES[Math.floor(Math.random() * BANK_NAMES.length)];
      const bankCode = BANK_CODE_MAP[bankName];
      const accNum = `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
      const accName = `Rider ${r.customerId}`;

      try {
        await this.svc.upsert({
          tenantId: r.tenantId,
          entityType: PaymentAccountEntityType.DRIVER,
          entityId: r.customerId,
          bankCode,
          accountNumber: accNum,
          accountName: accName,
        });
      } catch (err) {
        this.logger.warn(
          `  Rider ${r.customerId} PaymentAccount failed (non-fatal): ${err}`,
        );
      }
    }
    this.logger.log(`  ✓ ${riders.length} riders processed`);
  }

  private async seedEcosystemPartners(): Promise<void> {
    const partners: PartnerSeed[] = [
      {
        customerId: '1001000001',
        tenantId: 'root-admin',
        bankName: 'GTBank',
        accountNumber: '0123456789',
        accountName: 'GTBank Nigeria',
      },
      {
        customerId: '1001000003',
        tenantId: 'root-admin',
        bankName: 'Zenith Bank',
        accountNumber: '2109876543',
        accountName: 'Chidi Okonkwo',
      },
      {
        customerId: '1001000004',
        tenantId: 'tenant-001',
        bankName: 'Access Bank',
        accountNumber: '0987654321',
        accountName: 'Moove Africa',
      },
      {
        customerId: '1001000006',
        tenantId: 'acme-corp',
        bankName: 'First Bank',
        accountNumber: '3012345678',
        accountName: 'Lasgrid Transport Ltd',
      },
      {
        customerId: '1001000007',
        tenantId: 'acme-corp',
        bankName: 'Access Bank',
        accountNumber: '0011223344',
        accountName: 'Access Bank Plc',
      },
    ];

    for (const p of partners) {
      const existing = await this.svc.findByEntity(
        p.tenantId,
        PaymentAccountEntityType.PARTNER,
        p.customerId,
      );
      if (existing?.subaccountCode && existing?.recipientCode) continue;

      const bankCode = BANK_CODE_MAP[p.bankName] || '044';

      try {
        const subCode = await this.svc.getOrCreateSubaccount(
          p.tenantId,
          PaymentAccountEntityType.PARTNER,
          p.customerId,
          bankCode,
          p.accountNumber,
          p.accountName,
        );
        const recCode = await this.svc.getOrCreateRecipient(
          p.tenantId,
          PaymentAccountEntityType.PARTNER,
          p.customerId,
          bankCode,
          p.accountNumber,
          p.accountName,
        );
        this.logger.debug(
          `  Partner ${p.customerId} sub=${subCode} rec=${recCode}`,
        );
      } catch (err) {
        this.logger.warn(
          `  Partner ${p.customerId} Paystack creation failed (non-fatal): ${err}`,
        );
      }
    }
    this.logger.log(`  ✓ ${partners.length} partners processed`);
  }
}
