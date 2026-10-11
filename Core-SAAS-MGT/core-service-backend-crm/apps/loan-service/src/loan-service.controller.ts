import { Body, Controller, Param, Post, ConflictException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoanServiceService } from './loan-service.service';
import { QueryFailedError } from 'typeorm';

@ApiTags('Loan Service')
@Controller()
export class LoanServiceController {
  constructor(private readonly loanService: LoanServiceService) {}

  @Post('loan-products')
  @ApiOperation({ summary: 'Create a loan product', description: 'Creates a new loan product with provisioning rates and GL account mappings.' })
  @ApiBody({ schema: { example: { name: 'Standard Loan', code: 'STD-LOAN', performingProvisionRate: 0.01, dpd1ProvisionRate: 0.05, dpd31ProvisionRate: 0.1, dpd61ProvisionRate: 0.25, dpd90ProvisionRate: 0.5, loanReceivableGlAccountId: 'gl-uuid', customerDepositGlAccountId: 'gl-uuid', provisionExpenseGlAccountId: 'gl-uuid', loanLossReserveGlAccountId: 'gl-uuid', tenantId: 'root-admin' } }, description: 'Loan product creation payload' })
  @ApiResponse({ status: 201, description: 'Loan product created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Product with the same code already exists' })
  async createProduct(
    @Body() body: {
      name: string;
      code: string;
      performingProvisionRate?: number;
      dpd1ProvisionRate?: number;
      dpd31ProvisionRate?: number;
      dpd61ProvisionRate?: number;
      dpd90ProvisionRate?: number;
      loanReceivableGlAccountId?: string;
      customerDepositGlAccountId?: string;
      provisionExpenseGlAccountId?: string;
      loanLossReserveGlAccountId?: string;
      tenantId: string;
    },
  ) {
    try {
      return await this.loanService.createProduct(body);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).constraint?.includes('UQ_')) {
        throw new ConflictException('Product with the same code already exists');
      }
      throw e;
    }
  }

  @Post('loan-applications')
  @ApiOperation({ summary: 'Apply for a loan', description: 'Submits a loan application for a customer against a loan product.' })
  @ApiBody({ schema: { example: { customerId: 'cust-uuid', productId: 'product-uuid', principal: 500000, annualInterestRate: 0.15, termMonths: 12, tenantId: 'root-admin' } }, description: 'Loan application payload' })
  @ApiResponse({ status: 201, description: 'Loan application submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async apply(
    @Body() body: {
      customerId: string;
      productId: string;
      principal: number;
      annualInterestRate: number;
      termMonths: number;
      tenantId: string;
    },
  ) {
    return this.loanService.apply(body);
  }

  @Post('loan-applications/:id/approve')
  @ApiOperation({ summary: 'Approve a loan application', description: 'Approves a pending loan application by an authorized user.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan application ID' })
  @ApiBody({ schema: { example: { approvedBy: 'officer-uuid' } }, description: 'Approval payload' })
  @ApiResponse({ status: 200, description: 'Loan application approved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  async approve(
    @Param('id') id: string,
    @Body() body: { approvedBy: string },
  ) {
    return this.loanService.approve(id, body);
  }

  @Post('loan-applications/:id/disburse')
  @ApiOperation({ summary: 'Disburse a loan', description: 'Disburses the approved loan amount to the customer.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan application ID' })
  @ApiResponse({ status: 200, description: 'Loan disbursed successfully' })
  @ApiResponse({ status: 404, description: 'Loan application not found' })
  @ApiResponse({ status: 409, description: 'Loan already disbursed or not approved' })
  async disburse(@Param('id') id: string) {
    return this.loanService.disburse(id);
  }

  @Post('loan-accounts/:id/accrue')
  @ApiOperation({ summary: 'Accrue interest on a loan account', description: 'Accrues interest for a specified number of days on a loan account.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan account ID' })
  @ApiBody({ schema: { example: { days: 30 } }, description: 'Interest accrual payload' })
  @ApiResponse({ status: 200, description: 'Interest accrued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid days value' })
  @ApiResponse({ status: 404, description: 'Loan account not found' })
  async accrueInterest(
    @Param('id') id: string,
    @Body() body: { days: number },
  ) {
    return this.loanService.accrueInterest(id, body.days);
  }

  @Post('loan-accounts/:id/repay')
  @ApiOperation({ summary: 'Make a loan repayment', description: 'Records a repayment against a loan account.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan account ID' })
  @ApiBody({ schema: { example: { amount: 25000, tenantId: 'root-admin' } }, description: 'Repayment payload' })
  @ApiResponse({ status: 200, description: 'Repayment recorded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid amount or loan fully paid' })
  @ApiResponse({ status: 404, description: 'Loan account not found' })
  async repay(
    @Param('id') id: string,
    @Body() body: { amount: number; tenantId: string },
  ) {
    return this.loanService.repay(id, body);
  }

  @Post('loan-accounts/:id/classify-delinquency')
  @ApiOperation({ summary: 'Classify loan delinquency', description: 'Evaluates and updates the delinquency classification for a loan account based on DPD.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan account ID' })
  @ApiResponse({ status: 200, description: 'Delinquency classification updated' })
  @ApiResponse({ status: 404, description: 'Loan account not found' })
  async classifyDelinquency(@Param('id') id: string) {
    return this.loanService.classifyDelinquency(id);
  }

  @Post('loan-accounts/:id/provision')
  @ApiOperation({ summary: 'Create a loan provision', description: 'Creates a provision entry for a loan account with a specified reason.' })
  @ApiParam({ name: 'id', required: true, description: 'Loan account ID' })
  @ApiBody({ schema: { example: { tenantId: 'root-admin', reason: 'Delinquency provisioning' } }, description: 'Provision payload' })
  @ApiResponse({ status: 201, description: 'Provision created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Loan account not found' })
  async provisionLoan(
    @Param('id') id: string,
    @Body() body: { tenantId: string; reason: string },
  ) {
    return this.loanService.provisionLoan(id, body);
  }
}
