import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere, IsNull } from 'typeorm';
import { Customer, CustomerType, CustomerStatus } from './entities/customer.entity';

const ROOT_TENANT = 'root-admin';

export interface CustomerFilter {
  search?: string;          // Broad search across firstName, lastName, email, phone, customerId
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  customerId?: string;      // 10-digit unique customer identifier
  bankAccountNumber?: string;  // External bank account number
}

@Injectable()
export class CustomersRepository {
  constructor(
    @InjectRepository(Customer)
    private readonly repository: Repository<Customer>,
  ) {}

  async create(customer: Partial<Customer>): Promise<Customer> {
    const entity = this.repository.create(customer);
    return this.repository.save(entity);
  }

  async findOne(where: Partial<Customer>): Promise<Customer | null> {
    return this.repository.findOne({ where: { ...where, deletedAt: IsNull() } });
  }

  /**
   * findMany — if tenantId is 'root-admin' (or omitted), returns across all tenants.
   */
  async findMany(where: Partial<Customer>, skip = 0, take = 50): Promise<[Customer[], number]> {
    const filter = where.tenantId === ROOT_TENANT ? {} : where;
    return this.repository.findAndCount({
      where: { ...filter, deletedAt: IsNull() },
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenantAndType(
    tenantId: string,
    customerType: CustomerType,
    skip = 0,
    take = 50,
  ): Promise<[Customer[], number]> {
    const where = tenantId === ROOT_TENANT
      ? { customerType, deletedAt: IsNull() }
      : { tenantId, customerType, deletedAt: IsNull() };
    return this.repository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Search customers by type with optional filters and pagination.
   * The `search` param does a broad LIKE match across firstName, lastName, email, phone, customerId.
   * Additional exact-match filters (email, customerId, bankAccountNumber, phone) are AND'd with the type filter.
   */
  async searchByTenantAndType(
    tenantId: string,
    customerType: CustomerType,
    filters: CustomerFilter,
    skip = 0,
    take = 50,
  ): Promise<[Customer[], number]> {
    const qb = this.repository.createQueryBuilder('c');

    // Base condition — scope to tenant + type
    if (tenantId !== ROOT_TENANT) {
      qb.andWhere('c.tenantId = :tenantId', { tenantId });
    }
    qb.andWhere('c.customerType = :customerType', { customerType });
    qb.andWhere('c.deletedAt IS NULL');

    // Exact-match filters (AND)
    if (filters.email) {
      qb.andWhere('c.email LIKE :email', { email: `%${filters.email}%` });
    }
    if (filters.firstName) {
      qb.andWhere('c.firstName LIKE :firstName', { firstName: `%${filters.firstName}%` });
    }
    if (filters.lastName) {
      qb.andWhere('c.lastName LIKE :lastName', { lastName: `%${filters.lastName}%` });
    }
    if (filters.phone) {
      qb.andWhere('c.phone LIKE :phone', { phone: `%${filters.phone}%` });
    }
    if (filters.customerId) {
      qb.andWhere('c.customerId LIKE :customerId', { customerId: `%${filters.customerId}%` });
    }
    if (filters.bankAccountNumber) {
      qb.andWhere('c.bankAccountNumber LIKE :bankAccountNumber', { bankAccountNumber: `%${filters.bankAccountNumber}%` });
    }

    // Broad search term (OR across multiple fields)
    if (filters.search) {
      const term = `%${filters.search}%`;
      qb.andWhere(
        '(c.firstName LIKE :search OR c.lastName LIKE :search OR c.email LIKE :search OR c.phone LIKE :search OR c.customerId LIKE :search)',
        { search: term },
      );
    }

    qb.orderBy('c.createdAt', 'DESC');
    qb.skip(skip).take(take);

    return qb.getManyAndCount();
  }

  async findByTenantAndStatus(
    tenantId: string,
    status: CustomerStatus,
    skip = 0,
    take = 50,
  ): Promise<[Customer[], number]> {
    const where = tenantId === ROOT_TENANT
      ? { status, deletedAt: IsNull() }
      : { tenantId, status, deletedAt: IsNull() };
    return this.repository.findAndCount({
      where,
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id, deletedAt: IsNull() } });
    if (!updated) {
      throw new Error(`Customer with id ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }

  async countByType(tenantId: string, customerType: CustomerType): Promise<number> {
    const where = tenantId === ROOT_TENANT ? { customerType, deletedAt: IsNull() } : { tenantId, customerType, deletedAt: IsNull() };
    return this.repository.count({ where });
  }

  async countByStatus(tenantId: string, status: CustomerStatus): Promise<number> {
    const where = tenantId === ROOT_TENANT ? { status, deletedAt: IsNull() } : { tenantId, status, deletedAt: IsNull() };
    return this.repository.count({ where });
  }

  async getStats(tenantId: string) {
    const drivers = await this.countByType(tenantId, CustomerType.DRIVER);
    const riders = await this.countByType(tenantId, CustomerType.RIDER);
    const partners = await this.countByType(tenantId, CustomerType.PARTNER);
    const active = await this.countByStatus(tenantId, CustomerStatus.ACTIVE);
    const pending = await this.countByStatus(tenantId, CustomerStatus.PENDING_VERIFICATION);
    const suspended = await this.countByStatus(tenantId, CustomerStatus.SUSPENDED);

    return {
      totalCustomers: drivers + riders + partners,
      drivers,
      riders,
      partners,
      active,
      pending,
      suspended,
    };
  }
}
