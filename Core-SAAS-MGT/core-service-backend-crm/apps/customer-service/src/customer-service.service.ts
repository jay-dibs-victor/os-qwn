import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  CustomerAccount,
  CustomerAccountKind,
  CustomerProfileType,
} from './entities/customer-account.entity';

function inferProfileType(
  payload: Record<string, unknown>,
): CustomerProfileType {
  const profileType = payload.profileType;
  if (
    profileType === CustomerProfileType.INDIVIDUAL ||
    profileType === CustomerProfileType.ORGANIZATION
  ) {
    return profileType;
  }

  const accountType = payload.accountType;
  if (accountType === 'CORPORATE' || accountType === 'BUSINESS') {
    return CustomerProfileType.ORGANIZATION;
  }

  return CustomerProfileType.INDIVIDUAL;
}

function inferKind(payload: Record<string, unknown>): CustomerAccountKind {
  const kind = payload.kind;
  if (
    kind === CustomerAccountKind.RIDER ||
    kind === CustomerAccountKind.DRIVER ||
    kind === CustomerAccountKind.PARTNER
  ) {
    return kind;
  }

  const customerType = payload.customerType;
  if (
    customerType === CustomerAccountKind.RIDER ||
    customerType === CustomerAccountKind.DRIVER ||
    customerType === CustomerAccountKind.PARTNER
  ) {
    return customerType;
  }

  return CustomerAccountKind.RIDER;
}

function inferName(payload: Record<string, unknown>) {
  const name = payload.name;
  if (typeof name === 'string' && name.trim()) return name.trim();

  const companyName = payload.companyName;
  if (typeof companyName === 'string' && companyName.trim())
    return companyName.trim();

  const firstName =
    typeof payload.firstName === 'string' ? payload.firstName : '';
  const lastName = typeof payload.lastName === 'string' ? payload.lastName : '';
  const full = `${firstName} ${lastName}`.trim();
  if (full) return full;

  const accountName = payload.accountName;
  if (typeof accountName === 'string' && accountName.trim())
    return accountName.trim();

  return '';
}

@Injectable()
export class CustomerServiceService {
  constructor(
    @InjectRepository(CustomerAccount)
    private readonly customerAccounts: Repository<CustomerAccount>,
  ) {}

  async create(payload: Record<string, unknown>, tenantIdFromHeader?: string) {
    const tenantId =
      (typeof payload.tenantId === 'string' && payload.tenantId) ||
      tenantIdFromHeader ||
      'root-admin';

    const kind = inferKind(payload);
    const profileType = inferProfileType(payload);

    const id =
      (typeof payload.id === 'string' && payload.id) || uuidv4();

    const name = inferName(payload);
    const email = typeof payload.email === 'string' ? payload.email : undefined;
    const phone = typeof payload.phone === 'string' ? payload.phone : undefined;
    const status =
      typeof payload.status === 'string' && payload.status
        ? payload.status
        : 'ACTIVE';

    const entity = this.customerAccounts.create({
      id,
      tenantId,
      kind,
      profileType,
      name,
      email,
      phone,
      status,
      data: payload,
      deletedAt: undefined,
    });

    const saved = await this.customerAccounts.save(entity);
    return this.toPayload(saved);
  }

  async list(opts: {
    tenantId?: string;
    kind?: CustomerAccountKind;
    profileType?: CustomerProfileType;
    search?: string;
  }) {
    const qb = this.customerAccounts
      .createQueryBuilder('c')
      .andWhere('c.deletedAt IS NULL');

    if (opts.tenantId && opts.tenantId !== 'root-admin') {
      qb.andWhere('c.tenantId = :tenantId', { tenantId: opts.tenantId });
    }

    if (opts.kind) qb.andWhere('c.kind = :kind', { kind: opts.kind });
    if (opts.profileType)
      qb.andWhere('c.profileType = :profileType', {
        profileType: opts.profileType,
      });

    if (opts.search) {
      qb.andWhere('(c.name ILIKE :q OR c.email ILIKE :q OR c.phone ILIKE :q)', {
        q: `%${opts.search}%`,
      });
    }

    qb.orderBy('c.createdAt', 'DESC');
    const rows = await qb.getMany();
    return rows.map((r) => this.toPayload(r));
  }

  async getById(id: string, tenantId?: string) {
    const where: any = { id, deletedAt: IsNull() };
    if (tenantId && tenantId !== 'root-admin') where.tenantId = tenantId;
    const row = await this.customerAccounts.findOne({ where });
    if (!row) throw new NotFoundException('Customer account not found');
    return this.toPayload(row);
  }

  async update(id: string, payload: Record<string, unknown>, tenantId?: string) {
    const where: any = { id, deletedAt: IsNull() };
    if (tenantId && tenantId !== 'root-admin') where.tenantId = tenantId;
    const row = await this.customerAccounts.findOne({ where });
    if (!row) throw new NotFoundException('Customer account not found');

    const nextData = { ...(row.data ?? {}), ...payload };
    row.data = nextData;
    row.kind = inferKind(nextData);
    row.profileType = inferProfileType(nextData);
    row.name = inferName(nextData);
    row.email = typeof nextData.email === 'string' ? nextData.email : row.email;
    row.phone = typeof nextData.phone === 'string' ? nextData.phone : row.phone;
    row.status =
      typeof nextData.status === 'string' && nextData.status
        ? nextData.status
        : row.status;

    const saved = await this.customerAccounts.save(row);
    return this.toPayload(saved);
  }

  async remove(id: string, tenantId?: string) {
    const where: any = { id, deletedAt: IsNull() };
    if (tenantId && tenantId !== 'root-admin') where.tenantId = tenantId;
    const row = await this.customerAccounts.findOne({ where });
    if (!row) throw new NotFoundException('Customer account not found');
    row.deletedAt = new Date();
    await this.customerAccounts.save(row);
    return { message: 'Deleted' };
  }

  private toPayload(row: CustomerAccount) {
    const data = row.data ?? {};
    return {
      ...data,
      id: row.id,
      customerId:
        typeof data.customerId === 'string' && data.customerId
          ? data.customerId
          : row.id,
      tenantId: row.tenantId,
      kind: row.kind,
      profileType: row.profileType,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
