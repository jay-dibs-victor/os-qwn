import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant, TenantStatus } from './entities/tenant.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  /**
   * Validate if a tenant ID exists and is active
   * @param tenantId - The tenant ID to validate
   * @returns The tenant entity if valid
   * @throws NotFoundException if tenant doesn't exist
   * @throws BadRequestException if tenant is not active
   */
  async validateTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { tenantId },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' does not exist`);
    }

    if (tenant.status !== TenantStatus.ACTIVE && tenant.status !== TenantStatus.TRIAL) {
      throw new BadRequestException(`Tenant '${tenantId}' is not active. Status: ${tenant.status}`);
    }

    // Check subscription expiry for non-root tenants
    if (!tenant.isRoot && tenant.subscriptionExpiresAt) {
      const now = new Date();
      if (tenant.subscriptionExpiresAt < now) {
        throw new BadRequestException(`Tenant '${tenantId}' subscription has expired`);
      }
    }

    return tenant;
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenantRepository.findOne({
      where: { tenantId },
    });
  }

  /**
   * Create a new tenant
   */
  async createTenant(data: {
    tenantId: string;
    name: string;
    domain?: string;
    isRoot?: boolean;
    subscriptionPlan?: string;
  }): Promise<Tenant> {
    // Check if tenant ID already exists
    const existing = await this.getTenant(data.tenantId);
    if (existing) {
      throw new BadRequestException(`Tenant '${data.tenantId}' already exists`);
    }

    const tenant = this.tenantRepository.create({
      tenantId: data.tenantId,
      name: data.name,
      domain: data.domain,
      isRoot: data.isRoot || false,
      status: TenantStatus.ACTIVE,
      subscriptionPlan: data.subscriptionPlan || 'free',
      settings: {},
      metadata: {},
    });

    return this.tenantRepository.save(tenant);
  }

  /**
   * Get all tenants
   */
  async getAllTenants(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update tenant status
   */
  async updateTenantStatus(tenantId: string, status: TenantStatus): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant '${tenantId}' not found`);
    }

    tenant.status = status;
    return this.tenantRepository.save(tenant);
  }

  /**
   * Check if tenant is root/super admin
   */
  async isRootTenant(tenantId: string): Promise<boolean> {
    const tenant = await this.getTenant(tenantId);
    return tenant?.isRoot || false;
  }

  /**
   * Get tenant validation info for API Gateway
   */
  async getTenantValidationInfo(tenantId: string): Promise<{
    tenantId: string;
    isActive: boolean;
    isRoot: boolean;
    status: TenantStatus;
  }> {
    const tenant = await this.validateTenant(tenantId);

    return {
      tenantId: tenant.tenantId,
      isActive: tenant.status === TenantStatus.ACTIVE || tenant.status === TenantStatus.TRIAL,
      isRoot: tenant.isRoot,
      status: tenant.status,
    };
  }
}
