import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ComplianceServiceService } from './compliance-service.service';

@ApiTags('Compliance Service')
@Controller()
export class ComplianceServiceController {
  constructor(
    private readonly complianceService: ComplianceServiceService,
  ) {}

  @Post('aml-rules')
  @ApiOperation({ summary: 'Create an AML rule', description: 'Creates a new Anti-Money Laundering rule with name, type, severity, conditions, and tenant context.' })
  @ApiBody({ schema: { example: { name: 'High-Value Alert', type: 'threshold', severity: 'HIGH', conditions: { minAmount: 10000 }, tenantId: 'root-admin' } }, description: 'AML rule creation payload' })
  @ApiResponse({ status: 201, description: 'AML rule created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Rule with the same name already exists' })
  async createRule(
    @Body() body: {
      name: string;
      type: string;
      severity?: string;
      conditions?: Record<string, unknown>;
      tenantId: string;
    },
  ) {
    return this.complianceService.createRule({
      name: body.name,
      type: body.type as never,
      severity: body.severity as never,
      conditions: body.conditions,
      tenantId: body.tenantId,
    });
  }

  @Post('monitor')
  @ApiOperation({ summary: 'Monitor a transaction for compliance', description: 'Screens a transaction against AML rules and flags suspicious activity.' })
  @ApiBody({ schema: { example: { transactionId: 'txn-uuid', customerId: 'cust-uuid', counterpartyName: 'Business Ltd', amount: 500000, tenantId: 'root-admin' } }, description: 'Transaction monitoring payload' })
  @ApiResponse({ status: 201, description: 'Transaction screened; returns risk assessment' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async monitorTransaction(
    @Body() body: {
      transactionId: string;
      customerId: string;
      counterpartyName?: string;
      amount: number;
      tenantId: string;
    },
  ) {
    return this.complianceService.monitorTransaction(body);
  }

  @Post('sars')
  @ApiOperation({ summary: 'File a Suspicious Activity Report (SAR)', description: 'Creates a SAR for a customer based on alert IDs, with narrative and filing user information.' })
  @ApiBody({ schema: { example: { customerId: 'cust-uuid', alertIds: ['alert-uuid-1', 'alert-uuid-2'], narrative: 'Multiple high-value transactions flagged', filedBy: 'officer-uuid', tenantId: 'root-admin' } }, description: 'SAR creation payload' })
  @ApiResponse({ status: 201, description: 'SAR filed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createSar(
    @Body() body: {
      customerId: string;
      alertIds: string[];
      narrative: string;
      filedBy: string;
      tenantId: string;
    },
  ) {
    return this.complianceService.createSar(body);
  }

  @Get('dashboard/:tenantId')
  @ApiOperation({ summary: 'Get compliance dashboard', description: 'Returns compliance metrics, alerts, and SAR summary for the given tenant.' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant identifier' })
  @ApiResponse({ status: 200, description: 'Dashboard data returned successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async getDashboard(@Param('tenantId') tenantId: string) {
    return this.complianceService.getDashboard(tenantId);
  }
}
