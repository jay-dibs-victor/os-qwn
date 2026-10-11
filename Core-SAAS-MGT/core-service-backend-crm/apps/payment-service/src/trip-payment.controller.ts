import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Headers,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiBody, ApiResponse, ApiExcludeEndpoint } from '@nestjs/swagger';
import { TripPaymentService } from './trip-payment.service';
import {
  InitiateTripPaymentDto,
  VerifyTripPaymentDto,
  CompleteTripPaymentDto,
  WalletTripPaymentDto,
  CashTripPaymentDto,
} from './dto/trip-payment.dto';

@ApiTags('Trip Payment')
@Controller('payments/trip')
export class TripPaymentController {
  constructor(private readonly tripPaymentService: TripPaymentService) {}

  @Post('webhook/paystack')
  @ApiExcludeEndpoint()
  async handlePaystackWebhook(
    @Req() req: Request,
    @Headers('x-paystack-signature') signature?: string,
  ) {
    const rawBody = (req as any).rawBody?.toString() || JSON.stringify(req.body);
    return this.tripPaymentService.handlePaystackWebhook(
      rawBody,
      signature,
      req.body,
    );
  }

  @Post('initiate')
  @ApiOperation({ summary: 'Initiate a trip payment', description: 'Initiates a payment for a trip. Sends the payment request to the payment gateway and returns an authorization URL.' })
  @ApiBody({ type: InitiateTripPaymentDto, description: 'Payment initiation payload' })
  @ApiResponse({ status: 201, description: 'Payment initiated; returns authorization URL' })
  @ApiResponse({ status: 400, description: 'Invalid input data or missing tenantId' })
  async initiatePayment(
    @Body() dto: InitiateTripPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tripPaymentService.initiateTripPayment(dto);
  }

  @Post('wallet-pay')
  @ApiOperation({ summary: 'Pay for a trip via Rider Wallet', description: 'Deducts trip fare from rider wallet, allocations commissions, and credits driver wallet.' })
  @ApiBody({ type: WalletTripPaymentDto, description: 'Wallet payment payload' })
  @ApiResponse({ status: 201, description: 'Payment completed successfully via wallet' })
  @ApiResponse({ status: 400, description: 'Invalid input, missing tenantId, or insufficient funds' })
  async walletPayment(
    @Body() dto: WalletTripPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tripPaymentService.walletTripPayment(dto);
  }

  @Post('cash-pay')
  @ApiOperation({
    summary: 'Record a cash trip payment',
    description:
      'Called when a driver collects cash from a rider. Records the platform commission as a debt against the driver and posts the corresponding double-entry journal (DR 1403 Commission Receivable / CR 4201 Trip Revenue).',
  })
  @ApiBody({ type: CashTripPaymentDto, description: 'Cash trip payment payload' })
  @ApiResponse({ status: 201, description: 'Cash trip commission recorded and driver debt updated' })
  @ApiResponse({ status: 400, description: 'Invalid input, missing tenantId, or GL account not found' })
  async cashPayment(
    @Body() dto: CashTripPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tripPaymentService.cashTripPayment(dto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify a trip payment', description: 'Verifies a trip payment using the Paystack reference and trip ID.' })
  @ApiBody({ type: VerifyTripPaymentDto, description: 'Payment verification payload' })
  @ApiResponse({ status: 200, description: 'Payment verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or missing tenantId' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async verifyPayment(
    @Body() dto: VerifyTripPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tripPaymentService.verifyTripPayment(dto);
  }

  @Post(':tripId/complete')
  @ApiOperation({ summary: 'Complete a trip payment', description: 'Completes the trip payment flow, disbursing funds to the driver (and partner if corporate).' })
  @ApiParam({ name: 'tripId', required: true, description: 'Trip ID' })
  @ApiBody({ type: CompleteTripPaymentDto, description: 'Payment completion payload' })
  @ApiResponse({ status: 200, description: 'Payment completed and funds disbursed' })
  @ApiResponse({ status: 400, description: 'Invalid input data or missing tenantId' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async completePayment(
    @Param('tripId') tripId: string,
    @Body() dto: CompleteTripPaymentDto,
    @Headers('x-tenant-id') tenantIdHeader?: string,
  ) {
    dto.tripId = tripId;
    dto.tenantId = dto.tenantId || tenantIdHeader!;
    if (!dto.tenantId) {
      throw new BadRequestException('tenantId is required');
    }
    return this.tripPaymentService.completeTripPayment(dto);
  }

  @Get('calculate-commission')
  @ApiOperation({ summary: 'Calculate trip commission', description: 'Calculates the commission breakdown for a trip fare based on platform and partner rates.' })
  @ApiQuery({ name: 'totalFare', required: true, description: 'Total trip fare amount' })
  @ApiQuery({ name: 'platformRate', required: false, description: 'Platform commission rate as decimal (default: 0.10)' })
  @ApiQuery({ name: 'partnerRate', required: false, description: 'Partner commission rate as decimal (default: 0.05)' })
  @ApiQuery({ name: 'isCorporate', required: false, description: 'Whether the trip is corporate (default: false)' })
  @ApiResponse({ status: 200, description: 'Commission breakdown returned successfully' })
  async calculateCommission(
    @Query('totalFare') totalFare: string,
    @Query('platformRate') platformRate: string,
    @Query('partnerRate') partnerRate: string,
    @Query('isCorporate') isCorporate: string,
  ) {
    return this.tripPaymentService.calculateTripCommission({
      totalFare: Number(totalFare),
      platformRate: Number(platformRate || '0.10'),
      partnerRate: Number(partnerRate || '0.05'),
      isCorporate: isCorporate === 'true',
    });
  }

  @Get(':reference')
  @ApiOperation({ summary: 'Get transaction by reference', description: 'Retrieves a payment transaction by its unique reference code.' })
  @ApiParam({ name: 'reference', required: true, description: 'Payment transaction reference' })
  @ApiResponse({ status: 200, description: 'Transaction returned successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('reference') reference: string) {
    return this.tripPaymentService.getTransactionByReference(reference);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Get payments for a trip', description: 'Lists all payment transactions associated with a specific trip.' })
  @ApiParam({ name: 'tripId', required: true, description: 'Trip ID' })
  @ApiResponse({ status: 200, description: 'Trip payments returned successfully' })
  async getTripPayments(@Param('tripId') tripId: string) {
    return this.tripPaymentService.listTripPayments(tripId);
  }
}
