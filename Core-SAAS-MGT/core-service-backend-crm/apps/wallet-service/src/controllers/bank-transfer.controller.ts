import { Controller, Get, Post, Body, Query, Param, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { BankTransferPaymentService } from '../services/bank-transfer-payment.service';
import {
  RecordCashPaymentDto,
  InitiateBankTransferDto,
  ConfirmBankTransferDto,
} from '../dto/bank-transfer.dto';

@ApiTags('Driver Payments')
@Controller('wallet/payments')
export class BankTransferController {
  constructor(private readonly bankTransferService: BankTransferPaymentService) {}

  @Post('cash')
  @ApiOperation({ summary: 'Record cash payment', description: 'Record a cash ride payment. Creates a commission debt ledger entry for the driver.' })
  @ApiBody({ type: RecordCashPaymentDto })
  @ApiResponse({ status: 201, description: 'Cash payment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid payment data or missing tenantId' })
  @ApiBearerAuth()
  async recordCashPayment(
    @Body() dto: RecordCashPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.bankTransferService.recordCashPayment(dto);
  }

  @Post('bank-transfer')
  @ApiOperation({ summary: 'Initiate bank transfer payment', description: 'Record a direct bank transfer payment between rider and driver. Requires dual confirmation.' })
  @ApiBody({ type: InitiateBankTransferDto })
  @ApiResponse({ status: 201, description: 'Bank transfer recorded, awaiting confirmation' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid transfer data or missing tenantId' })
  @ApiBearerAuth()
  async initiateBankTransfer(
    @Body() dto: InitiateBankTransferDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.bankTransferService.initiateBankTransfer(dto);
  }

  @Post('bank-transfer/confirm')
  @ApiOperation({ summary: 'Confirm bank transfer', description: 'Confirm a bank transfer amount from either driver or rider side.' })
  @ApiBody({ type: ConfirmBankTransferDto })
  @ApiResponse({ status: 200, description: 'Bank transfer confirmation recorded' })
  @ApiResponse({ status: 400, description: 'Bad request - invalid confirmation data or missing tenantId' })
  @ApiBearerAuth()
  async confirmBankTransfer(
    @Body() dto: ConfirmBankTransferDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) throw new BadRequestException('tenantId is required');
    return this.bankTransferService.confirmBankTransfer(dto);
  }
}
