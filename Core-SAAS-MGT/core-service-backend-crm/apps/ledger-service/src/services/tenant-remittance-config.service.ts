import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { TenantDriverRemittanceConfig, RemittanceCycle, RemittanceType } from '../entities/tenant-driver-remittance-config.entity';

@Injectable()
export class TenantRemittanceConfigService {
  private readonly logger = new Logger(TenantRemittanceConfigService.name);

  constructor(
    @InjectRepository(TenantDriverRemittanceConfig)
    private readonly configRepo: Repository<TenantDriverRemittanceConfig>,
  ) {}

  async upsertConfig(dto: {
    tenantId: string;
    driverCustomerId?: string;
    remittanceCycle?: RemittanceCycle;
    remittanceType?: RemittanceType;
    remittanceValue?: number;
    commissionRate?: number;
    dayOfWeek?: number;
    dayOfMonth?: number;
    isActive?: boolean;
  }): Promise<TenantDriverRemittanceConfig> {
    const existing = await this.configRepo.findOne({
      where: { tenantId: dto.tenantId, driverCustomerId: dto.driverCustomerId ?? IsNull() },
    });

    if (existing) {
      Object.assign(existing, dto);
      return this.configRepo.save(existing);
    }

    return this.configRepo.save(this.configRepo.create({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      remittanceCycle: dto.remittanceCycle ?? RemittanceCycle.COMMISSION_BASED,
      remittanceType: dto.remittanceType ?? RemittanceType.PERCENTAGE_OF_FARE,
      remittanceValue: dto.remittanceValue ?? 0,
      commissionRate: dto.commissionRate ?? 0,
      dayOfWeek: dto.dayOfWeek ?? 1,
      dayOfMonth: dto.dayOfMonth ?? 1,
      isActive: dto.isActive ?? true,
    }));
  }

  async getConfigsByTenant(tenantId: string): Promise<TenantDriverRemittanceConfig[]> {
    return this.configRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async getConfigsByDriver(tenantId: string, driverCustomerId: string): Promise<TenantDriverRemittanceConfig | null> {
    return this.configRepo.findOne({ where: { tenantId, driverCustomerId } });
  }

  async getDefaultConfig(tenantId: string): Promise<TenantDriverRemittanceConfig | null> {
    return this.configRepo.findOne({ where: { tenantId, driverCustomerId: IsNull(), isActive: true } });
  }

  async deleteConfig(tenantId: string, configId: string): Promise<void> {
    const config = await this.configRepo.findOne({ where: { id: configId, tenantId } });
    if (!config) throw new NotFoundException('Config not found');
    await this.configRepo.remove(config);
  }

  async getDueRemittanceConfigs(tenantId?: string): Promise<TenantDriverRemittanceConfig[]> {
    const where: any = { isActive: true };
    if (tenantId) where.tenantId = tenantId;
    return this.configRepo.find({ where });
  }
}
