import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  PaymentProviderConfig,
  ProviderType,
} from './entities/payment-provider-config.entity';
import { ProviderRegion } from './entities/provider-region.entity';
import { PaymentGatewayProvider } from './rails/gateway-provider.interface';
import { PaystackProvider } from './rails/paystack.provider';
import { StripeGateway } from './rails/stripe.gateway';
import { NibbsGateway } from './rails/nibbs-gateway.provider';

@Injectable()
export class PaymentGatewayRegistry implements OnModuleInit {
  private readonly logger = new Logger(PaymentGatewayRegistry.name);
  private providers: Map<string, PaymentGatewayProvider> = new Map();
  private activeProvider: PaymentGatewayProvider | null = null;

  constructor(
    @InjectRepository(PaymentProviderConfig)
    private readonly configRepo: Repository<PaymentProviderConfig>,
    @InjectRepository(ProviderRegion)
    private readonly regionRepo: Repository<ProviderRegion>,
    private readonly configService: ConfigService,
    private readonly paystackProvider: PaystackProvider,
    private readonly stripeGateway: StripeGateway,
    private readonly nibbsGateway: NibbsGateway,
  ) {}

  async onModuleInit(): Promise<void> {
    this.register('paystack', this.paystackProvider);
    this.register('stripe', this.stripeGateway);
    this.register('nibbs', this.nibbsGateway);

    await this.syncConfigs();
    await this.selectActiveProvider();
  }

  register(name: string, provider: PaymentGatewayProvider): void {
    this.providers.set(name.toLowerCase(), provider);
    this.logger.log(`Registered gateway provider: ${name}`);
  }

  getProvider(name: string): PaymentGatewayProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      throw new BadRequestException(
        `Payment provider "${name}" not found. Available: ${Array.from(this.providers.keys()).join(', ')}`,
      );
    }
    return provider;
  }

  getActiveProvider(): PaymentGatewayProvider {
    if (!this.activeProvider) {
      throw new BadRequestException(
        'No active payment provider configured. Set one via the providers API.',
      );
    }
    return this.activeProvider;
  }

  getProviderName(): string {
    return this.activeProvider?.name || 'none';
  }

  listProviders(): Array<{ name: string; available: boolean }> {
    return Array.from(this.providers.entries()).map(([name]) => ({
      name,
      available: true,
    }));
  }

  async getProviderForRegion(
    countryCode: string,
  ): Promise<PaymentGatewayProvider | null> {
    const code = countryCode.toUpperCase();
    const region = await this.regionRepo.findOne({
      where: { countryCode: code, isActive: true },
    });
    if (!region || !this.providers.has(region.providerName)) {
      return null;
    }
    return this.providers.get(region.providerName)!;
  }

  async getCurrencyForRegion(countryCode: string): Promise<string | null> {
    const code = countryCode.toUpperCase();
    const region = await this.regionRepo.findOne({
      where: { countryCode: code, isActive: true },
    });
    return region?.currency || null;
  }

  async resolveGatewayForCountry(
    countryCode?: string,
  ): Promise<PaymentGatewayProvider> {
    if (countryCode) {
      const regionProvider = await this.getProviderForRegion(countryCode);
      if (regionProvider) return regionProvider;
    }
    return this.getActiveProvider();
  }

  async listRegionMappings(): Promise<
    Array<{
      countryCode: string;
      providerName: string;
      currency: string;
      isActive: boolean;
    }>
  > {
    const regions = await this.regionRepo.find({
      order: { countryCode: 'ASC' },
    });
    return regions.map((r) => ({
      countryCode: r.countryCode,
      providerName: r.providerName,
      currency: r.currency,
      isActive: r.isActive,
    }));
  }

  async seedDefaultRegions(): Promise<void> {
    const defaults: Array<{
      countryCode: string;
      providerName: string;
      currency: string;
    }> = [
      { countryCode: 'NG', providerName: 'paystack', currency: 'NGN' },
      { countryCode: 'GH', providerName: 'paystack', currency: 'GHS' },
      { countryCode: 'KE', providerName: 'stripe', currency: 'KES' },
      { countryCode: 'ZA', providerName: 'stripe', currency: 'ZAR' },
      { countryCode: 'RW', providerName: 'stripe', currency: 'RWF' },
      { countryCode: 'UG', providerName: 'stripe', currency: 'UGX' },
      { countryCode: 'TZ', providerName: 'stripe', currency: 'TZS' },
      { countryCode: 'US', providerName: 'stripe', currency: 'USD' },
      { countryCode: 'GB', providerName: 'stripe', currency: 'GBP' },
      { countryCode: 'CA', providerName: 'stripe', currency: 'CAD' },
      { countryCode: 'DE', providerName: 'stripe', currency: 'EUR' },
      { countryCode: 'FR', providerName: 'stripe', currency: 'EUR' },
      { countryCode: 'AE', providerName: 'stripe', currency: 'AED' },
      { countryCode: 'IN', providerName: 'stripe', currency: 'INR' },
    ];

    for (const def of defaults) {
      const exists = await this.regionRepo.findOne({
        where: { countryCode: def.countryCode },
      });
      if (!exists) {
        await this.regionRepo.save(
          this.regionRepo.create({
            countryCode: def.countryCode,
            providerName: def.providerName,
            currency: def.currency,
            isActive: true,
          }),
        );
        this.logger.log(
          `Seeded region: ${def.countryCode} → ${def.providerName} (${def.currency})`,
        );
      }
    }
  }

  async setDefaultProvider(name: string): Promise<PaymentProviderConfig> {
    const provider = this.getProvider(name);

    await this.configRepo.update({ isDefault: true }, { isDefault: false });

    let config = await this.configRepo.findOne({
      where: { name: name.toLowerCase() },
    });
    if (config) {
      config.isDefault = true;
      config.isActive = true;
      await this.configRepo.save(config);
    } else {
      config = this.configRepo.create({
        name: name.toLowerCase(),
        providerType: this.mapNameToType(name),
        isActive: true,
        isDefault: true,
      });
      await this.configRepo.save(config);
    }

    this.activeProvider = provider;
    this.logger.log(`Default provider set to: ${name}`);
    return config;
  }

  private mapNameToType(name: string): ProviderType {
    switch (name.toLowerCase()) {
      case 'paystack':
        return ProviderType.PAYSTACK;
      case 'stripe':
        return ProviderType.STRIPE;
      case 'nibbs':
        return ProviderType.NIBBS;
      default:
        return ProviderType.PAYSTACK;
    }
  }

  private async syncConfigs(): Promise<void> {
    for (const [name] of this.providers) {
      const exists = await this.configRepo.findOne({
        where: { name },
      });
      if (!exists) {
        const config = this.configRepo.create({
          name,
          providerType: this.mapNameToType(name),
          isActive: false,
          isDefault: false,
        });
        await this.configRepo.save(config);
        this.logger.log(`Created config entry for provider: ${name}`);
      }
    }
  }

  private async selectActiveProvider(): Promise<void> {
    const envOverride = this.configService
      .get<string>('ACTIVE_PAYMENT_GATEWAY')
      ?.toLowerCase();
    if (envOverride && this.providers.has(envOverride)) {
      this.activeProvider = this.providers.get(envOverride)!;
      this.logger.log(`Active provider from env: ${envOverride}`);
      return;
    }

    const dbDefault = await this.configRepo.findOne({
      where: { isDefault: true, isActive: true },
    });
    if (dbDefault && this.providers.has(dbDefault.name)) {
      this.activeProvider = this.providers.get(dbDefault.name)!;
      this.logger.log(`Active provider from DB: ${dbDefault.name}`);
      return;
    }

    const anyActive = await this.configRepo.findOne({
      where: { isActive: true },
      order: { sortOrder: 'ASC' },
    });
    if (anyActive && this.providers.has(anyActive.name)) {
      this.activeProvider = this.providers.get(anyActive.name)!;
      this.logger.log(`Active provider (first active): ${anyActive.name}`);
      return;
    }

    this.activeProvider = this.paystackProvider;
    this.logger.log('Defaulting to Paystack provider');
  }
}
