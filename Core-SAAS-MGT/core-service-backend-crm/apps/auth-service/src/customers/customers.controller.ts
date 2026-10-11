import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CustomersService } from './customers.service';
import type { CreateCustomerDto, UpdateCustomerDto } from './customers.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Customer, CustomerType, CustomerStatus } from '../entities/customer.entity';
import { paginate, parsePagination } from '../dto/pagination.dto';

@Controller('customers')
@ApiTags('Customers')
@ApiTags('Drivers')
@ApiTags('Partners')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create Customer',
    description: `Create a new customer record. Set \`customerType\` to control which type:

**Driver** — individual or corporate fleet driver, requires license/vehicle info + docs in metadata
**Rider** — passenger/end-user of the platform
**Partner** — ecosystem partner (bank, telecom, fleet operator, fintech, individual)

Document URLs (licenseFront, idProof etc.) are stored in \`metadata.docs\` after uploading via **POST /upload**.
    `,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['customerType', 'email', 'phone', 'firstName', 'lastName'],
      properties: {
        customerType: { type: 'string', enum: ['driver', 'rider', 'partner'], example: 'driver' },
        email:        { type: 'string', example: 'john.driver@example.com' },
        phone:        { type: 'string', example: '+2348012345678' },
        firstName:    { type: 'string', example: 'John' },
        lastName:     { type: 'string', example: 'Doe' },
        address:      { type: 'string', example: '123 Main Street' },
        city:         { type: 'string', example: 'Lagos' },
        state:        { type: 'string', example: 'Lagos' },
        zipCode:      { type: 'string', example: '100001' },
        country:      { type: 'string', example: 'Nigeria' },
        licenseNumber:{ type: 'string', example: 'DL123456', description: 'Driver only' },
        vehicleModel: { type: 'string', example: 'Toyota Camry 2023', description: 'Driver only' },
        vehicleRegistration: { type: 'string', example: 'LND-123-XY', description: 'Driver only' },
        companyName:  { type: 'string', example: 'GTBank Nigeria', description: 'Partner only' },
        taxId:        { type: 'string', example: 'GTB-RC-001', description: 'Partner only' },
        businessDescription: { type: 'string', example: 'Commercial bank providing payment rails', description: 'Partner only' },
        metadata: {
          type: 'object',
          description: 'Flexible extra fields. For drivers: docs, tier, licenseClass, vettingStatus. For partners: partnerCategory, revenueShare, integrationStatus.',
          example: {
            tier: 'Swift',
            licenseClass: 'Class B',
            vehicleColor: 'Black',
            vehicleYear: '2023',
            vettingStatus: 'PENDING',
            source: 'individual',
            docs: {
              licenseFront: 'https://res.cloudinary.com/questence/...',
              idProof:      'https://res.cloudinary.com/questence/...',
              utilityBill:  'https://res.cloudinary.com/questence/...',
              insurance:    'https://res.cloudinary.com/questence/...',
            },
          },
        },
      },
      examples: {
        driver: {
          summary: 'Create individual driver',
          value: {
            customerType: 'driver',
            email: 'driver.new@tenant-001.com',
            phone: '+2348012345679',
            firstName: 'James',
            lastName: 'Okafor',
            address: '45 Broad Street',
            city: 'Lagos',
            country: 'Nigeria',
            licenseNumber: 'DL998877',
            vehicleModel: 'Toyota Camry',
            vehicleRegistration: 'LND-445-KW',
            metadata: { tier: 'Swift', licenseClass: 'Class B', vehicleColor: 'Silver', vehicleYear: '2022', vettingStatus: 'PENDING', source: 'individual' },
          },
        },
        rider: {
          summary: 'Create rider',
          value: {
            customerType: 'rider',
            email: 'rider.new@tenant-001.com',
            phone: '+2348012345680',
            firstName: 'Amina',
            lastName: 'Bello',
            city: 'Abuja',
            country: 'Nigeria',
          },
        },
        partner: {
          summary: 'Create ecosystem partner (bank)',
          value: {
            customerType: 'partner',
            email: 'api@gtbank.partner.com',
            phone: '+2341234567890',
            firstName: 'GTBank',
            lastName: 'Nigeria',
            companyName: 'GTBank Nigeria',
            taxId: 'GTB-RC-001',
            businessDescription: 'Commercial bank providing payment rails and escrow services',
            metadata: { partnerCategory: 'BANK', revenueShare: 2.5, bankName: 'GTBank', swiftCode: 'GTBINGLA', integrationStatus: 'LIVE' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        id: 'uuid',
        tenantId: 'root-admin',
        customerType: 'driver',
        email: 'driver.new@tenant-001.com',
        firstName: 'James',
        lastName: 'Okafor',
        status: 'pending_verification',
        isVerified: false,
        createdAt: '2026-06-01T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Customer with this email already exists' })
  async createCustomer(@Req() req: Request, @Body() dto: CreateCustomerDto) {
    const user = req.user as { tenantId: string };
    return this.customersService.createCustomer({
      ...dto,
      tenantId: user.tenantId,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'List Customers',
    description: 'Get all customers for the tenant',
  })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50, description: 'Number of records per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Number of records to skip (alternative to pageNumber/pageSize)' })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50, description: 'Number of records to return' })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      example: {
        data: [
          { id: 'uuid-1', customerId: 'CUST00001', customerType: 'driver', email: 'john@example.com', firstName: 'John', lastName: 'Doe', phone: '+2348012345678', status: 'active', isVerified: true, createdAt: '2026-01-15T10:00:00Z' },
          { id: 'uuid-2', customerId: 'CUST00002', customerType: 'rider', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', phone: '+2348012345679', status: 'active', isVerified: true, createdAt: '2026-01-20T10:00:00Z' },
        ],
        total: 2,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      },
    },
  })
  async listCustomers(
    @Req() req: Request,
    @Query() query: Record<string, any>,
  ) {
    const user = req.user as { tenantId: string };
    const { skip, take } = parsePagination(query);
    return paginate(
      await this.customersService.listCustomers(user.tenantId, skip, take),
      query,
    );
  }

  @Get('type/:customerType')
  @ApiOperation({
    summary: 'List Customers by Type',
    description: 'Get customers filtered by type (driver, rider, partner) with optional search and pagination',
  })
  @ApiParam({ name: 'customerType', description: 'Customer type filter' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50, description: 'Number of records per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Number of records to skip (alternative to pageNumber/pageSize)' })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50, description: 'Number of records to return' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Broad search across name, email, phone, customerId' })
  @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by email (partial match)' })
  @ApiQuery({ name: 'firstName', required: false, type: String, description: 'Filter by first name (partial match)' })
  @ApiQuery({ name: 'lastName', required: false, type: String, description: 'Filter by last name (partial match)' })
  @ApiQuery({ name: 'phone', required: false, type: String, description: 'Filter by phone (partial match)' })
  @ApiQuery({ name: 'customerId', required: false, type: String, description: 'Filter by 10-digit customer ID (partial match)' })
  @ApiQuery({ name: 'bankAccountNumber', required: false, type: String, description: 'Filter by bank account number (partial match)' })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      example: {
        data: [
          { id: 'uuid-1', customerId: 'CUST00001', customerType: 'driver', email: 'john@example.com', firstName: 'John', lastName: 'Doe', phone: '+2348012345678', status: 'active', isVerified: true, createdAt: '2026-01-15T10:00:00Z' },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      },
    },
  })
  async listCustomersByType(
    @Req() req: Request,
    @Param('customerType') customerType: CustomerType,
    @Query() query: Record<string, any>,
  ) {
    const user = req.user as { tenantId: string };
    const { skip, take } = parsePagination(query);
    const filters = {
      search: query.search as string | undefined,
      email: query.email as string | undefined,
      firstName: query.firstName as string | undefined,
      lastName: query.lastName as string | undefined,
      phone: query.phone as string | undefined,
      customerId: query.customerId as string | undefined,
      bankAccountNumber: query.bankAccountNumber as string | undefined,
    };
    return paginate(
      await this.customersService.listCustomersByType(user.tenantId, customerType, skip, take, filters),
      query,
    );
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'List Customers by Status',
    description: 'Get customers filtered by status',
  })
  @ApiParam({ name: 'status', description: 'Customer status filter' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50, description: 'Number of records per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Number of records to skip (alternative to pageNumber/pageSize)' })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50, description: 'Number of records to return' })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    schema: {
      example: {
        data: [
          { id: 'uuid-1', customerId: 'CUST00001', customerType: 'driver', email: 'john@example.com', firstName: 'John', lastName: 'Doe', status: 'active', isVerified: true, createdAt: '2026-01-15T10:00:00Z' },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 50,
        totalPages: 1,
      },
    },
  })
  async listCustomersByStatus(
    @Req() req: Request,
    @Param('status') status: CustomerStatus,
    @Query() query: Record<string, any>,
  ) {
    const user = req.user as { tenantId: string };
    const { skip, take } = parsePagination(query);
    return paginate(
      await this.customersService.listCustomersByStatus(user.tenantId, status, skip, take),
      query,
    );
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get Customer Statistics',
    description: 'Get statistics about customers',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
    schema: {
      example: {
        totalCustomers: 0,
        drivers: 0,
        riders: 0,
        partners: 0,
        active: 0,
        pending: 0,
        suspended: 0,
      },
    },
  })
  async getStats(@Req() req: Request) {
    const user = req.user as { tenantId: string };
    return this.customersService.getStats(user.tenantId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Customer',
    description: 'Get a specific customer by ID',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.customersService.getCustomer(id, user.tenantId);
  }

  @Get(':id/dashboard')
  @ApiOperation({
    summary: 'Get Driver Dashboard',
    description: 'Get aggregated driver dashboard data including earnings, ledger balance, and platform accounts',
  })
  @ApiParam({ name: 'id', description: 'Customer UUID ID' })
  @ApiResponse({
    status: 200,
    description: 'Driver dashboard data retrieved successfully',
    schema: {
      example: {
        profile: { id: 'uuid', customerId: '1234567890', firstName: 'John', lastName: 'Doe' },
        earningsSummary: { totalEarnings: 5000, totalTrips: 150 },
        ledgerBalance: { balance: 2500 },
        accounts: [{ accountNumber: '1234567890', type: 'SAVINGS', balance: 2500 }],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 400, description: 'Customer is not a driver' })
  async getDriverDashboard(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.customersService.getDriverDashboard(id, user.tenantId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update Customer',
    description: 'Update driver, rider, or partner information. Only the fields provided will be updated (partial update).',
  })
  @ApiParam({ name: 'id', example: 'customer-uuid', description: 'Customer UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName:    { type: 'string', example: 'James' },
        lastName:     { type: 'string', example: 'Okafor' },
        phone:        { type: 'string', example: '+2348012345678' },
        address:      { type: 'string', example: '45 Broad Street' },
        city:         { type: 'string', example: 'Lagos' },
        state:        { type: 'string', example: 'Lagos' },
        zipCode:      { type: 'string', example: '100001' },
        country:      { type: 'string', example: 'Nigeria' },
        status:       { type: 'string', enum: ['active', 'inactive', 'suspended', 'banned', 'pending_verification'], example: 'active' },
        isVerified:   { type: 'boolean', example: true },
        rating:       { type: 'number', example: 4.8, description: 'Driver/rider rating (0-5)' },
        licenseNumber:       { type: 'string', example: 'DL998877', description: 'Driver only' },
        vehicleModel:        { type: 'string', example: 'Toyota Camry', description: 'Driver only' },
        vehicleRegistration: { type: 'string', example: 'LND-445-KW', description: 'Driver only' },
        companyName:         { type: 'string', example: 'GTBank Nigeria', description: 'Partner only' },
        taxId:               { type: 'string', example: 'GTB-RC-001', description: 'Partner only' },
        businessDescription: { type: 'string', description: 'Partner only' },
        metadata: {
          type: 'object',
          description: 'Merge-update metadata. For drivers include docs URLs after uploading via POST /upload.',
          example: {
            vettingStatus: 'APPROVED',
            docs: {
              licenseFront: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/uuid/docs/license.jpg',
              idProof: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/uuid/docs/id.jpg',
              utilityBill: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/uuid/docs/bill.jpg',
              insurance: 'https://res.cloudinary.com/questence/image/upload/v1/queens-os/drivers/uuid/docs/insurance.jpg',
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Customer updated successfully', type: Customer })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async updateCustomer(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    const user = req.user as { tenantId: string };
    return this.customersService.updateCustomer(id, user.tenantId, dto);
  }

  @Post(':id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify Customer',
    description: 'Mark customer as verified',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer verified successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async verifyCustomer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.customersService.verifyCustomer(id, user.tenantId);
  }

  @Post(':id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suspend Customer',
    description: 'Suspend a customer account',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer suspended successfully',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async suspendCustomer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    return this.customersService.suspendCustomer(id, user.tenantId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete Customer',
    description: 'Delete a customer record',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async deleteCustomer(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { tenantId: string };
    await this.customersService.deleteCustomer(id, user.tenantId);
    return { message: 'Customer deleted successfully' };
  }
}
