import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApprovalServiceService } from './approval-service.service';
import {
  CreateApprovalConfigDto,
  CreateApprovalRequestDto,
  ApproveStepDto,
  RejectStepDto,
} from './dto/approval-flow.dto';

@ApiTags('Approvals')
@ApiBearerAuth('JWT-auth')
@Controller('approval')
export class ApprovalServiceController {
  constructor(private readonly approvalService: ApprovalServiceService) {}

  @Post('configs')
  @ApiOperation({
    summary: 'Create approval workflow configuration',
    description:
      'Define approval requirements for specific API endpoints with multi-level approval hierarchy',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['method', 'path', 'levels', 'tenantId'],
      properties: {
        method: { type: 'string', example: 'POST', description: 'HTTP method' },
        path: { type: 'string', example: '/payments', description: 'API endpoint path' },
        tenantId: { type: 'string', example: 'root-admin', description: 'Tenant ID' },
        requiredPermission: { type: 'string', example: 'payment.approve', description: 'Required permission (optional)' },
        levels: {
          type: 'array',
          description: 'Approval levels hierarchy',
          items: {
            type: 'object',
            required: ['level'],
            properties: {
              level: { type: 'number', example: 1 },
              allowedUserIds: { type: 'array', items: { type: 'string' }, example: ['user-001', 'user-002'] },
              allowedRoleIds: { type: 'array', items: { type: 'string' }, example: ['role-manager'] },
            },
          },
          example: [
            { level: 1, allowedUserIds: ['user-001'], allowedRoleIds: ['role-manager'] },
            { level: 2, allowedRoleIds: ['role-director'] },
          ],
        },
      },
      example: {
        method: 'POST',
        path: '/payments',
        tenantId: 'root-admin',
        requiredPermission: 'payment.approve',
        levels: [
          { level: 1, allowedUserIds: ['user-001', 'user-002'], allowedRoleIds: ['role-manager'] },
          { level: 2, allowedRoleIds: ['role-director'] },
        ],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Approval configuration created successfully',
    schema: {
      example: {
        id: 'config-001',
        method: 'POST',
        path: '/payments',
        requiredPermission: 'payment.approve',
        levels: [
          {
            level: 1,
            allowedUserIds: ['user-001', 'user-002'],
            allowedRoleIds: ['role-manager'],
          },
          {
            level: 2,
            allowedRoleIds: ['role-director'],
          },
        ],
        tenantId: 'root-admin',
        createdAt: '2024-05-23T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid approval configuration' })
  @ApiResponse({
    status: 409,
    description: 'Approval config for endpoint already exists',
  })
  createApprovalConfig(@Body() dto: CreateApprovalConfigDto) {
    return this.approvalService.createApprovalConfig(dto);
  }

  @Get('configs')
  @ApiOperation({
    summary: 'Get approval workflow configuration',
    description: 'Retrieve approval requirements for a specific API endpoint',
  })
  @ApiQuery({
    name: 'method',
    required: false,
    description: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
    example: 'POST',
  })
  @ApiQuery({
    name: 'path',
    required: false,
    description: 'API endpoint path',
    example: '/payments',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'Tenant ID',
    example: 'root-admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval configuration retrieved successfully',
    schema: {
      example: {
        id: 'config-001',
        method: 'POST',
        path: '/payments',
        levels: [
          {
            level: 1,
            allowedRoleIds: ['role-manager'],
          },
        ],
        tenantId: 'root-admin',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Approval configuration not found' })
  getApprovalConfig(
    @Query('tenantId') tenantId: string,
    @Query('method') method?: string,
    @Query('path') path?: string,
  ) {
    if (method && path) return this.approvalService.getApprovalConfig(method, path, tenantId);
    return this.approvalService.listApprovalConfigs(tenantId, method);
  }

  @Post('requests')
  @ApiOperation({
    summary: 'Create an approval request',
    description:
      'Submit a request for approval according to the configured approval workflow',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['method', 'path', 'payload', 'initiatorId', 'tenantId'],
      properties: {
        method: { type: 'string', example: 'POST', description: 'HTTP method' },
        path: { type: 'string', example: '/payments', description: 'API endpoint path' },
        payload: { type: 'object', example: { sourceAccountId: '6217129210', targetAccountId: 'ACC-2024-002', amount: 50000 }, description: 'Request payload to be forwarded upon approval' },
        initiatorId: { type: 'string', example: 'user-123', description: 'User ID of the request initiator' },
        tenantId: { type: 'string', example: 'root-admin', description: 'Tenant ID' },
        requiredPermission: { type: 'string', example: 'payment.approve', description: 'Required permission (optional)' },
      },
      example: {
        method: 'POST',
        path: '/payments',
        payload: { sourceAccountId: '6217129210', targetAccountId: 'ACC-2024-002', amount: 50000 },
        initiatorId: 'user-123',
        tenantId: 'root-admin',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Approval request created successfully',
    schema: {
      example: {
        id: 'req-001',
        method: 'POST',
        path: '/payments',
        payload: {
          sourceAccountId: '6217129210',
          targetAccountId: 'ACC-2024-002',
          amount: 50000.0,
        },
        initiatorId: 'user-123',
        tenantId: 'root-admin',
        status: 'PENDING',
        currentLevel: 1,
        approvers: [],
        createdAt: '2024-05-23T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid approval request data' })
  @ApiResponse({ status: 404, description: 'No approval config for endpoint' })
  createApprovalRequest(@Body() dto: CreateApprovalRequestDto) {
    return this.approvalService.createApprovalRequest(dto);
  }

  @Get('requests')
  @ApiOperation({
    summary: 'List approval requests by tenant',
    description:
      'Retrieve pending and processed approval requests for a tenant',
  })
  @ApiQuery({
    name: 'tenantId',
    required: true,
    description: 'Tenant ID',
    example: 'root-admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval requests retrieved successfully',
    schema: {
      example: {
        data: [
          {
            id: 'req-001',
            method: 'POST',
            path: '/payments',
            initiatorId: 'user-123',
            status: 'PENDING',
            currentLevel: 1,
            createdAt: '2024-05-23T10:30:00Z',
          },
        ],
        total: 1,
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid tenant ID' })
  getApprovalRequests(@Query('tenantId') tenantId: string) {
    return this.approvalService.getApprovalRequests(tenantId);
  }

  @Post('requests/:id/approve')
  @ApiOperation({
    summary: 'Approve or reject an approval request step',
    description:
      'Process an approval for a specific level in the approval workflow',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Approval Request ID',
    example: 'req-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval processed successfully',
    schema: {
      example: {
        id: 'req-001',
        status: 'APPROVED',
        currentLevel: 2,
        approvedAt: '2024-05-23T10:35:00Z',
        approvals: [
          {
            level: 1,
            approverId: 'user-456',
            status: 'APPROVED',
            comment: 'Looks good',
            approvedAt: '2024-05-23T10:35:00Z',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Approval request not found' })
  @ApiResponse({
    status: 422,
    description: 'Invalid approval action or insufficient permissions',
  })
  approveStep(@Param('id') id: string, @Body() dto: ApproveStepDto) {
    return this.approvalService.approveStep(id, dto);
  }

  @Post('requests/:id/reject')
  @ApiOperation({
    summary: 'Reject an approval request',
    description: 'Reject a pending approval request',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Approval Request ID',
    example: 'req-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Rejection processed successfully',
  })
  rejectStep(@Param('id') id: string, @Body() dto: RejectStepDto) {
    return this.approvalService.rejectStep(id, dto);
  }
}
