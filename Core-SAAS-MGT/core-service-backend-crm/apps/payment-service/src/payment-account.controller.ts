import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiHeader,
} from '@nestjs/swagger';
import { PaymentAccountService } from './payment-account.service';
import { CreatePaymentAccountDto } from './dto/payment-account.dto';
import { PaymentAccountEntityType } from './entities/payment-account.entity';

@ApiTags('Payment Accounts')
@Controller('payments/payment-accounts')
export class PaymentAccountController {
  constructor(private readonly svc: PaymentAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update a payment account' })
  @ApiBody({ type: CreatePaymentAccountDto })
  @ApiResponse({ status: 201, description: 'Payment account created or updated' })
  @ApiResponse({ status: 400, description: 'tenantId is required' })
  async upsert(
    @Body() dto: CreatePaymentAccountDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.svc.upsert(dto);
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get payment account by entity type and ID' })
  @ApiParam({ name: 'entityType', required: true, enum: PaymentAccountEntityType, description: 'Entity type (DRIVER, RIDER, PLATFORM, PARTNER)' })
  @ApiParam({ name: 'entityId', required: true, description: 'Entity ID (customer ID or tenant ID)' })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (defaults to root-admin)' })
  @ApiResponse({ status: 200, description: 'Payment account found' })
  @ApiResponse({ status: 400, description: 'Payment account not found' })
  async findByEntity(
    @Param('entityType') entityType: PaymentAccountEntityType,
    @Param('entityId') entityId: string,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || 'root-admin';
    const account = await this.svc.findByEntity(tenantId, entityType, entityId);
    if (!account) throw new BadRequestException('Payment account not found');
    return account;
  }

  @Post(':entityType/:entityId/create-subaccount')
  @ApiOperation({ summary: 'Create Paystack subaccount for an entity' })
  @ApiParam({ name: 'entityType', required: true, enum: PaymentAccountEntityType, description: 'Entity type' })
  @ApiParam({ name: 'entityId', required: true, description: 'Entity ID' })
  @ApiBody({ schema: { type: 'object', required: ['bankCode', 'accountNumber'], properties: { bankCode: { type: 'string', example: '044', description: 'Bank code' }, accountNumber: { type: 'string', example: '0123456789', description: 'Account number' }, accountName: { type: 'string', example: 'John Doe', description: 'Account name (optional)' } } } })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (defaults to root-admin)' })
  @ApiResponse({ status: 201, description: 'Subaccount created' })
  @ApiResponse({ status: 400, description: 'bankCode and accountNumber are required' })
  async createSubaccount(
    @Param('entityType') entityType: PaymentAccountEntityType,
    @Param('entityId') entityId: string,
    @Body() body: { bankCode: string; accountNumber: string; accountName?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || 'root-admin';
    if (!body.bankCode || !body.accountNumber) {
      throw new BadRequestException('bankCode and accountNumber are required');
    }
    const code = await this.svc.getOrCreateSubaccount(
      tenantId, entityType, entityId,
      body.bankCode, body.accountNumber,
      body.accountName || `${entityType} ${entityId}`,
    );
    return { subaccountCode: code };
  }

  @Post(':entityType/:entityId/create-recipient')
  @ApiOperation({ summary: 'Create Paystack transfer recipient for an entity' })
  @ApiParam({ name: 'entityType', required: true, enum: PaymentAccountEntityType, description: 'Entity type' })
  @ApiParam({ name: 'entityId', required: true, description: 'Entity ID' })
  @ApiBody({ schema: { type: 'object', required: ['bankCode', 'accountNumber'], properties: { bankCode: { type: 'string', example: '044', description: 'Bank code' }, accountNumber: { type: 'string', example: '0123456789', description: 'Account number' }, accountName: { type: 'string', example: 'John Doe', description: 'Account name (optional)' } } } })
  @ApiHeader({ name: 'x-tenant-id', required: false, description: 'Tenant ID (defaults to root-admin)' })
  @ApiResponse({ status: 201, description: 'Recipient created' })
  @ApiResponse({ status: 400, description: 'bankCode and accountNumber are required' })
  async createRecipient(
    @Param('entityType') entityType: PaymentAccountEntityType,
    @Param('entityId') entityId: string,
    @Body() body: { bankCode: string; accountNumber: string; accountName?: string },
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    const tenantId = tenantIdHeader || 'root-admin';
    if (!body.bankCode || !body.accountNumber) {
      throw new BadRequestException('bankCode and accountNumber are required');
    }
    const code = await this.svc.getOrCreateRecipient(
      tenantId, entityType, entityId,
      body.bankCode, body.accountNumber,
      body.accountName || `${entityType} ${entityId}`,
    );
    return { recipientCode: code };
  }
}
