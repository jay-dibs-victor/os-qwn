import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteWideFareConfig } from '../entities/site-wide-fare-config.entity';

@Injectable()
export class SiteWideFareConfigService {
  private readonly logger = new Logger(SiteWideFareConfigService.name);

  constructor(
    @InjectRepository(SiteWideFareConfig)
    private readonly configRepo: Repository<SiteWideFareConfig>,
  ) {}

  async upsert(dto: { configKey: string; configValue: string; description?: string; dataType?: string }): Promise<SiteWideFareConfig> {
    const existing = await this.configRepo.findOne({ where: { configKey: dto.configKey } });
    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing);
    }
    return this.configRepo.save(this.configRepo.create(dto));
  }

  async getAll(): Promise<SiteWideFareConfig[]> {
    return this.configRepo.find({ order: { configKey: 'ASC' } });
  }

  async getByKey(key: string): Promise<SiteWideFareConfig | null> {
    return this.configRepo.findOne({ where: { configKey: key, isActive: true } });
  }

  async getValue(key: string, defaultValue?: string): Promise<string> {
    const config = await this.getByKey(key);
    return config?.configValue ?? defaultValue ?? '';
  }

  async delete(key: string): Promise<void> {
    const config = await this.configRepo.findOne({ where: { configKey: key } });
    if (!config) throw new NotFoundException(`Config ${key} not found`);
    await this.configRepo.remove(config);
  }

  async seedDefaults(): Promise<void> {
    const defaults: { key: string; value: string; description: string; dataType: string }[] = [
      { key: 'INDIVIDUAL_DRIVER_COMMISSION_RATE', value: '10', description: 'Default platform commission rate (%) for individual drivers', dataType: 'PERCENTAGE' },
      { key: 'INDIVIDUAL_DRIVER_PARTNER_RATE', value: '0', description: 'Default partner commission rate (%) for individual drivers', dataType: 'PERCENTAGE' },
      { key: 'CORPORATE_DRIVER_COMMISSION_RATE', value: '10', description: 'Default platform commission rate (%) for corporate/tenant drivers', dataType: 'PERCENTAGE' },
      { key: 'CORPORATE_DRIVER_PARTNER_RATE', value: '5', description: 'Default partner commission rate (%) for corporate/tenant drivers', dataType: 'PERCENTAGE' },
      { key: 'GATEWAY_FEE_PERCENT', value: '1.5', description: 'Payment gateway fee percentage', dataType: 'PERCENTAGE' },
      { key: 'MIN_PAYOUT_THRESHOLD', value: '500', description: 'Minimum amount (NGN) before payout can be processed', dataType: 'AMOUNT' },
      { key: 'DEFAULT_REMITTANCE_CYCLE', value: 'DAILY', description: 'Default remittance cycle for corporate drivers', dataType: 'STRING' },
      { key: 'AUTO_REMITTANCE_ENABLED', value: 'true', description: 'Enable automatic remittance processing', dataType: 'BOOLEAN' },
      { key: 'SAVINGS_AUTO_DISBURSEMENT_ENABLED', value: 'true', description: 'Enable automatic savings disbursement', dataType: 'BOOLEAN' },
      { key: 'PLATFORM_FARE_PERCENT', value: '100', description: 'Platform base fare collection % (site-wide for individual drivers)', dataType: 'PERCENTAGE' },
      { key: 'COIN_REWARD_ENABLED', value: 'true', description: 'Enable Queens coin reward distribution on trip completion', dataType: 'BOOLEAN' },
      { key: 'RIDER_COIN_REWARD_PER_TRIP', value: '10', description: 'Queens coin reward amount per trip for the rider', dataType: 'AMOUNT' },
      { key: 'DRIVER_COIN_REWARD_PER_TRIP', value: '25', description: 'Queens coin reward amount per trip for the driver', dataType: 'AMOUNT' },
      { key: 'TENANT_COIN_REWARD_PER_TRIP', value: '5', description: 'Queens coin reward amount per trip for the tenant', dataType: 'AMOUNT' },
    ];

    for (const d of defaults) {
      const exists = await this.configRepo.findOne({ where: { configKey: d.key } });
      if (!exists) {
        await this.configRepo.save(this.configRepo.create({ configKey: d.key, configValue: d.value, description: d.description, dataType: d.dataType }));
      }
    }
  }
}
