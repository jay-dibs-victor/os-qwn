import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CustomersRepository, CustomerFilter } from '../customers.repository';
import { Customer, CustomerType, CustomerStatus } from '../entities/customer.entity';
import axios from 'axios';

export interface CreateCustomerDto {
  tenantId: string;
  customerType: CustomerType;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  licenseNumber?: string;
  licenseExpiry?: Date;
  vehicleRegistration?: string;
  vehicleModel?: string;
  companyName?: string;
  taxId?: string;
  businessDescription?: string;
  bankName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCustomerDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  status?: CustomerStatus;
  isVerified?: boolean;
  rating?: number;
  licenseNumber?: string;
  licenseExpiry?: Date;
  vehicleRegistration?: string;
  vehicleModel?: string;
  companyName?: string;
  taxId?: string;
  businessDescription?: string;
  bankName?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly configService: ConfigService,
  ) {}

  private async generateCustomerId(): Promise<string> {
    let customerId: string;
    let attempts = 0;
    do {
      const num = Math.floor(1000000000 + Math.random() * 9000000000);
      customerId = num.toString();
      const existing = await this.customersRepository.findOne({ customerId });
      if (!existing) return customerId;
      attempts++;
    } while (attempts < 10);
    return Date.now().toString().slice(0, 10);
  }

  private entityType(customerType: CustomerType): string {
    if (customerType === CustomerType.DRIVER) return 'driver';
    if (customerType === CustomerType.PARTNER) return 'partner';
    return 'driver'; // riders use 'driver' — they receive refunds
  }

  private async createPaymentAccount(customer: Customer, dto: CreateCustomerDto): Promise<void> {
    const paymentServiceUrl = this.configService.get<string>('PAYMENT_SERVICE_URL');
    if (!paymentServiceUrl) {
      this.logger.warn('PAYMENT_SERVICE_URL not configured, skipping PaymentAccount creation');
      return;
    }
    const entityType = this.entityType(customer.customerType);
    const entityId = customer.customerId!;

    try {
      if (dto.bankCode && dto.bankAccountNumber) {
        await axios.post(
          `${paymentServiceUrl}/payments/payment-accounts/${entityType}/${entityId}/create-subaccount`,
          {
            bankCode: dto.bankCode,
            accountNumber: dto.bankAccountNumber,
            accountName: dto.bankAccountName || `${customer.firstName} ${customer.lastName}`,
          },
          { headers: { 'x-tenant-id': customer.tenantId } },
        );
        await axios.post(
          `${paymentServiceUrl}/payments/payment-accounts/${entityType}/${entityId}/create-recipient`,
          {
            bankCode: dto.bankCode,
            accountNumber: dto.bankAccountNumber,
            accountName: dto.bankAccountName || `${customer.firstName} ${customer.lastName}`,
          },
          { headers: { 'x-tenant-id': customer.tenantId } },
        );
      } else {
        await axios.post(
          `${paymentServiceUrl}/payments/payment-accounts`,
          { tenantId: customer.tenantId, entityType, entityId },
          { headers: { 'x-tenant-id': customer.tenantId } },
        );
      }
    } catch (err: any) {
      this.logger.warn(`PaymentAccount creation failed (non-fatal): ${err.message}`);
    }
  }

  async createCustomer(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customersRepository.findOne({
      tenantId: dto.tenantId,
      email: dto.email,
    });

    if (existing) {
      throw new BadRequestException('Customer with this email already exists');
    }

    const { bankName, bankCode, bankAccountNumber, bankAccountName, ...rest } = dto;
    const customer = await this.customersRepository.create({
      ...rest,
      customerId: await this.generateCustomerId(),
      bankName: bankName || undefined,
      bankCode: bankCode || undefined,
      bankAccountNumber: bankAccountNumber || undefined,
      bankAccountName: bankAccountName || undefined,
      status: CustomerStatus.PENDING_VERIFICATION,
      isVerified: false,
    });

    // Fire-and-forget: create Paystack subaccount + recipient
    this.createPaymentAccount(customer, dto);
    return customer;
  }

  async getCustomer(id: string, tenantId: string): Promise<Customer> {
    // root-admin can fetch any customer regardless of tenant
    const where = tenantId === 'root-admin' ? { id } : { id, tenantId };
    const customer = await this.customersRepository.findOne(where);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async listCustomers(
    tenantId: string,
    skip = 0,
    take = 50,
  ): Promise<{ data: Customer[]; total: number }> {
    const [data, total] = await this.customersRepository.findMany(
      { tenantId },
      skip,
      take,
    );
    return { data, total };
  }

  async listCustomersByType(
    tenantId: string,
    customerType: CustomerType,
    skip = 0,
    take = 50,
    filters: CustomerFilter = {},
  ): Promise<{ data: Customer[]; total: number }> {
    const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '');
    if (hasFilters) {
      const [data, total] = await this.customersRepository.searchByTenantAndType(
        tenantId,
        customerType,
        filters,
        skip,
        take,
      );
      return { data, total };
    }
    const [data, total] = await this.customersRepository.findByTenantAndType(
      tenantId,
      customerType,
      skip,
      take,
    );
    return { data, total };
  }

  async listCustomersByStatus(
    tenantId: string,
    status: CustomerStatus,
    skip = 0,
    take = 50,
  ): Promise<{ data: Customer[]; total: number }> {
    const [data, total] = await this.customersRepository.findByTenantAndStatus(
      tenantId,
      status,
      skip,
      take,
    );
    return { data, total };
  }

  async updateCustomer(
    id: string,
    tenantId: string,
    dto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.getCustomer(id, tenantId);
    if (dto.status && typeof dto.status === 'string') {
      (dto as any).status = dto.status.toLowerCase();
    }
    return this.customersRepository.update(id, dto);
  }

  async deleteCustomer(id: string, tenantId: string): Promise<void> {
    const customer = await this.getCustomer(id, tenantId);
    await this.customersRepository.delete(id);
  }

  async verifyCustomer(id: string, tenantId: string): Promise<Customer> {
    const customer = await this.getCustomer(id, tenantId);
    return this.customersRepository.update(id, {
      isVerified: true,
      status: CustomerStatus.ACTIVE,
    });
  }

  async suspendCustomer(id: string, tenantId: string): Promise<Customer> {
    const customer = await this.getCustomer(id, tenantId);
    return this.customersRepository.update(id, {
      status: CustomerStatus.SUSPENDED,
    });
  }

  async getStats(tenantId: string) {
    return this.customersRepository.getStats(tenantId);
  }

  async getDriverDashboard(id: string, tenantId: string) {
    const customer = await this.getCustomer(id, tenantId);
    if (customer.customerType !== CustomerType.DRIVER) {
      throw new BadRequestException('Customer is not a driver');
    }

    const walletBaseUrl = this.configService.get<string>('WALLET_SERVICE_URL', 'http://localhost:3015');
    const accountsBaseUrl = this.configService.get<string>('ACCOUNTS_SERVICE_URL', 'http://localhost:3005');

    // Fetch earnings summary from wallet-service
    let earningsSummary = null;
    try {
      const { data } = await axios.get(
        `${walletBaseUrl}/wallet/driver-earnings/summary`,
        { params: { driverCustomerId: customer.customerId, tenantId: customer.tenantId } },
      );
      earningsSummary = data;
    } catch {
      // Wallet-service may not be available
    }

    // Fetch driver ledger balance from wallet-service
    let ledgerBalance = null;
    try {
      const { data } = await axios.get(
        `${walletBaseUrl}/wallet/drivers/ledger/${customer.customerId}/balance`,
        { params: { tenantId: customer.tenantId } },
      );
      ledgerBalance = data;
    } catch {
      // Driver-ledger may not be available
    }

    // Fetch platform accounts from accounts-service
    let accounts = null;
    try {
      const { data } = await axios.get(
        `${accountsBaseUrl}/accounts/customer/${customer.customerId}`,
        { params: { tenantId: customer.tenantId } },
      );
      accounts = data;
    } catch {
      // Accounts-service may not be available
    }

    return {
      profile: customer,
      earningsSummary,
      ledgerBalance,
      accounts,
    };
  }
}
