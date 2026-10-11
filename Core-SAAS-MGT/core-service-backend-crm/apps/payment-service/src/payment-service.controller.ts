import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Param,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { PaymentServiceService } from './payment-service.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InternalTransferDto } from './dto/internal-transfer.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaymentRail } from './constants/enums';
import { randomUUID } from 'crypto';

@ApiTags('Payments')
@ApiBearerAuth('JWT-auth')
@Controller('payments')
export class PaymentServiceController {
  constructor(private readonly paymentServiceService: PaymentServiceService) {}

  @Post('internal-transfer')
  @ApiOperation({
    summary: 'Internal book transfer',
    description: `Transfer funds between two internal accounts (same platform, no external rail).
Generates a balanced GL posting: DR source account / CR destination account.
Use for: treasury allocations, wallet-to-wallet transfers, tenant fund movements.`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sourceAccountId', 'destinationAccountId', 'amount', 'tenantId'],
      properties: {
        sourceAccountId:      { type: 'string', example: '6217129210', description: 'Debited account number' },
        destinationAccountId: { type: 'string', example: 'ACC-2024-002', description: 'Credited account number' },
        amount:               { type: 'number', example: 5000.00 },
        currency:             { type: 'string', example: 'USD', default: 'USD' },
        tenantId:             { type: 'string', example: 'root-admin' },
        reference:            { type: 'string', example: 'TRANSFER-2026-001', description: 'Optional idempotency reference' },
        description:          { type: 'string', example: 'Monthly treasury allocation' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Internal transfer initiated' })
  async initiateInternalTransfer(@Body() dto: InternalTransferDto) {
    return this.paymentServiceService.processPayment(
      {
        sourceAccountId: dto.sourceAccountId,
        targetAccountId: dto.destinationAccountId,
        amount: dto.amount,
        currency: dto.currency,
        rail: PaymentRail.INTERNAL,
        tenantId: dto.tenantId,
      },
      dto.reference || randomUUID(),
    );
  }

  @Post()
  @ApiOperation({
    summary: 'Initiate a payment',
    description: `Process a payment via the chosen rail. Every payment generates double-entry GL postings.

**Rails:**
- \`INTERNAL\` — Book transfer between platform accounts
- \`ACH\` — ACH bank transfer
- \`WIRE\` — Wire transfer
- \`CARD\` — Card payment

**Idempotency:** Pass a unique \`Idempotency-Key\` header. Re-sending with the same key returns the original result safely.

**GL flow:** DR Customer Account / CR Platform Revenue → DR Platform Revenue / CR Commission Income + Driver Payable`,
  })
  @ApiHeader({
    name: 'idempotency-key',
    required: true,
    description: 'Unique UUID to prevent duplicate payments',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['sourceAccountId', 'targetAccountId', 'amount', 'rail', 'tenantId'],
      properties: {
        sourceAccountId: { type: 'string', example: '6217129210' },
        targetAccountId: { type: 'string', example: 'ACC-2024-002' },
        amount:          { type: 'number', example: 42.50 },
        currency:        { type: 'string', example: 'USD' },
        rail:            { type: 'string', enum: ['INTERNAL', 'NIBSS', 'RTGS', 'SWIFT', 'PAYSTACK'], example: 'INTERNAL' },
        tenantId:        { type: 'string', example: 'root-admin' },
        description:     { type: 'string', example: 'Trip fare payment' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Payment initiated successfully',
    schema: {
      example: {
        id: 'pay-001',
        sourceAccountId: '6217129210',
        targetAccountId: 'ACC-2024-002',
        amount: 50000.0,
        currency: 'USD',
        status: 'PENDING',
        createdAt: '2024-05-23T10:30:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid payment data or missing required fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Idempotency-Key header is required',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions or account status',
  })
  @ApiResponse({ status: 422, description: 'Payment validation failed' })
  async initiatePayment(
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: CreatePaymentDto,
  ) {
    if (!idempotencyKey) {
      throw new UnauthorizedException('Idempotency-Key header is required');
    }
    return this.paymentServiceService.processPayment(dto, idempotencyKey);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Paginated payment history',
    description:
      'List payments with date range and other filters. Returns a paginated response.',
  })
  @ApiResponse({ status: 200, description: 'Paginated payments' })
  async listPaymentHistory(@Query() query: QueryPaymentDto) {
    return this.paymentServiceService.listHistory(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve payment by ID',
    description:
      'Get detailed information about a specific payment transaction',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Payment ID',
    example: 'pay-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details retrieved successfully',
    schema: {
      example: {
        id: 'pay-001',
        sourceAccountId: '6217129210',
        targetAccountId: 'ACC-2024-002',
        amount: 50000.0,
        currency: 'USD',
        status: 'COMPLETED',
        rail: 'ACH',
        createdAt: '2024-05-23T10:30:00Z',
        updatedAt: '2024-05-23T10:35:00Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPayment(@Param('id') id: string) {
    return this.paymentServiceService.findById(id);
  }

  @Get()
  @ApiOperation({
    summary: 'List payments with filtering',
    description:
      'Query payments with optional filters for status, rail, tenant, and source account',
  })
  @ApiResponse({
    status: 200,
    description: 'Payments list retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'pay-001',
            sourceAccountId: '6217129210',
            targetAccountId: 'ACC-2024-002',
            amount: 50000.0,
            currency: 'USD',
            status: 'COMPLETED',
            rail: 'ACH',
            createdAt: '2024-05-23T10:30:00Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid query parameters' })
  async listPayments(@Query() query: QueryPaymentDto) {
    return this.paymentServiceService.list(query);
  }
}
