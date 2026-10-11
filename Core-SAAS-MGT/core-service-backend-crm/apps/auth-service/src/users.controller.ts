import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthServiceService } from './auth-service.service';
import { CreateAdminUserDto, UpdateAdminUserDto } from './dto/admin-user.dto';
import { UserRole } from './entities/user.entity';
import { paginate, parsePagination } from './dto/pagination.dto';

interface RequestWithUser extends Request {
  user: { id: string; tenantId: string; role?: string };
}

@ApiTags('User Management')
@ApiBearerAuth('JWT-auth')
@Controller('auth/users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly authService: AuthServiceService) {}

  @Get()
  @ApiOperation({ summary: 'List users', description: 'root-admin returns all users across tenants; tenant-admin/staff returns only their own tenant users. Supports optional ?tenantId= filter for root-admin.' })
  @ApiQuery({ name: 'tenantId', required: false, example: 'root-admin', description: 'Filter by tenant ID (root-admin only)' })
  @ApiQuery({ name: 'pageNumber', required: false, type: Number, example: 1, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 50, description: 'Number of records per page' })
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0, description: 'Number of records to skip (alternative to pageNumber/pageSize)' })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50, description: 'Number of records to return' })
  @ApiResponse({ status: 200, description: 'List of users returned successfully', schema: { example: { data: [{ id: 'uuid', email: 'alice@tenant-001.com', firstName: 'Alice', lastName: 'Johnson', role: 'staff', status: 'active', tenantId: 'root-admin' }], total: 1, pageNumber: 1, pageSize: 50, totalPages: 1 } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async listUsers(
    @Req() req: RequestWithUser,
    @Query() query: Record<string, any>,
  ) {
    const filterTenantId = query.tenantId as string | undefined;
    const filterEmail = query.email as string | undefined;
    return paginate(
      await this.authService.listUsers(req.user.tenantId, filterTenantId, filterEmail),
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID', description: 'root-admin can fetch any user; others can only fetch users in their own tenant.' })
  @ApiParam({ name: 'id', example: 'user-uuid', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.authService.getUser(id, req.user.tenantId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create platform user',
    description: `Create a new platform user with a specific role.

**Roles:**
- \`staff\` — Regular invited staff; access controlled by scopes (default)
- \`account_officer\` — Elevated staff for financial/legal/compliance operations
- \`tenant_admin\` — Company admin who manages workspace and invites staff
- \`root_admin\` — Platform owner (root-admin tenant only, not assignable by tenant admins)

**Permissions:**
- root-admin can create users in any tenant (pass tenantId in body)
- tenant-admin can create staff/account-officers in their own tenant only
- staff cannot create users`,
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'phone', 'Admin@123456', 'firstName', 'lastName'],
      properties: {
        email:     { type: 'string', example: 'alice@tenant-001.com' },
        phone:     { type: 'string', example: '+2348099887766', description: 'E.164 format required' },
        password:  { type: 'string', example: 'Staff@123456', minLength: 8 },
        firstName: { type: 'string', example: 'Alice' },
        lastName:  { type: 'string', example: 'Johnson' },
        tenantId:  { type: 'string', example: 'root-admin', description: 'Only root-admin can set a different tenant' },
        role: {
          type: 'string',
          enum: ['staff', 'account_officer', 'tenant_admin', 'root_admin'],
          example: 'staff',
          description: 'Platform role (defaults to staff)',
        },
        status:     { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'], example: 'active' },
        isVerified: { type: 'boolean', example: true, description: 'Skip email verification (admin-created users are auto-verified)' },
      },
      examples: {
        staff: {
          summary: 'Create staff user',
          value: { email: 'staff@tenant-001.com', phone: '+2348099887766', password: 'Staff@123456', firstName: 'Alice', lastName: 'Johnson', role: 'staff' },
        },
        accountOfficer: {
          summary: 'Create account officer',
          value: { email: 'ao@tenant-001.com', phone: '+2348099887767', password: 'AO@123456', firstName: 'Bob', lastName: 'Finance', role: 'account_officer' },
        },
        tenantAdmin: {
          summary: 'Create tenant admin (root-admin only)',
          value: { email: 'admin@new-corp.com', phone: '+2348099887768', password: 'Admin@123456', firstName: 'Carol', lastName: 'CEO', tenantId: 'new-corp', role: 'tenant_admin' },
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User created successfully', schema: { example: { id: 'uuid', email: 'alice@tenant-001.com', role: 'staff', status: 'active', tenantId: 'root-admin' } } })
  @ApiResponse({ status: 400, description: 'Validation error or duplicate email/phone' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async createUser(
    @Req() req: RequestWithUser,
    @Body() dto: CreateAdminUserDto,
  ) {
    const callerTenantId = req.user.tenantId;
    const callerRole = req.user.role;

    if (callerTenantId !== 'root-admin' && dto.role === UserRole.ROOT_ADMIN) {
      throw new ForbiddenException('Only root-admin can create root_admin users');
    }

    const tenantId =
      callerTenantId === 'root-admin'
        ? (dto.tenantId ?? callerTenantId)
        : callerTenantId;

    if (callerRole === UserRole.STAFF) {
      throw new ForbiddenException('Staff members cannot create users');
    }

    return this.authService.createAdminUser({ ...dto, tenantId });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile, status, or role' })
  @ApiParam({ name: 'id', example: 'user-uuid', description: 'User UUID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', example: 'Alice' },
        lastName:  { type: 'string', example: 'Smith' },
        phone:     { type: 'string', example: '+2348099887766' },
        email:     { type: 'string', example: 'alice@tenant-001.com' },
        status:    { type: 'string', enum: ['active', 'inactive', 'suspended', 'pending'], example: 'active' },
        role:      { type: 'string', enum: ['staff', 'account_officer', 'tenant_admin', 'root_admin'], example: 'account_officer' },
        password:  { type: 'string', example: 'NewPassword@123', description: 'Leave blank to keep existing password' },
        isVerified: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    const callerRole = req.user.role;

    if (callerRole === UserRole.STAFF) {
      throw new ForbiddenException('Staff members cannot update users');
    }

    if (req.user.tenantId !== 'root-admin' && dto.role === UserRole.ROOT_ADMIN) {
      throw new ForbiddenException('Only root-admin can assign root_admin role');
    }

    return this.authService.updateAdminUser(id, req.user.tenantId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user', description: 'root-admin can delete any user. tenant-admin can delete users in their own tenant. Staff cannot delete users.' })
  @ApiParam({ name: 'id', example: 'user-uuid', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    const callerRole = req.user.role;

    if (callerRole === UserRole.STAFF) {
      throw new ForbiddenException('Staff members cannot delete users');
    }

    return this.authService.deleteUser(id, req.user.tenantId);
  }
}
