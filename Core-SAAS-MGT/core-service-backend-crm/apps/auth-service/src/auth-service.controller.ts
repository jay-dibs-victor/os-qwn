import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { AuthServiceService } from './auth-service.service';
import { TenantStatus } from './entities/tenant.entity';
import { TenantService } from './tenant.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyAccountDto } from './dto/verify-account.dto';
import { VerifyMfaDto } from './dto/verify-mfa.dto';
import {
  SendVerificationOtpDto,
  VerifyEmailOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/otp.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('Authentication')
export class AuthServiceController {
  constructor(
    private readonly authServiceService: AuthServiceService,
    private readonly tenantService: TenantService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user account',
  })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@queensos.com',
        phone: '+2348012345678',
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid registration data' })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authServiceService.register(registerUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Authenticate user with email and password',
  })
  @ApiBody({
    schema: {
      example: {
        email: 'admin@queensos.com',
        password: 'SecurePassword123!',
        tenantId: 'root-admin',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        refreshToken: 'refresh_token_here',
        expiresIn: 3600,
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Req() req: Request) {
    return this.authServiceService.login(req.user as User);
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Get a new access token using refresh token',
  })
  @ApiBody({ schema: { example: { refresh_token: 'refresh_token_here' } } })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: { example: { accessToken: 'new_access_token', expiresIn: 3600 } },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    return this.authServiceService.refreshTokens(refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'User Logout',
    description: 'Revoke the current access token and logout the user',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully',
    schema: { example: { message: 'Logged out successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Req() req: Request) {
    const user = req.user as { jti?: string };
    if (user && user.jti) {
      await this.authServiceService.revokeToken(user.jti);
    }
    return { message: 'Logged out successfully' };
  }

  @Get()
  @ApiOperation({
    summary: 'Auth Service Health Check',
    description: 'Verify that the authentication service is operational',
  })
  @ApiResponse({
    status: 200,
    description: 'Service is running',
    schema: { example: 'Auth service is operational' },
  })
  getHello(): string {
    return this.authServiceService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/setup')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Setup MFA',
    description: 'Initialize multi-factor authentication setup for the user',
  })
  @ApiResponse({
    status: 200,
    description: 'MFA setup initiated',
    schema: {
      example: {
        secret: 'JBSWY3DPEBLW64TMMQ======',
        qrCode: 'data:image/png;base64,iVBORw0KGgo...',
        backupCodes: ['12345678', '87654321'],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupMfa(@Req() req: Request) {
    const user = req.user as User;
    return this.authServiceService.generateMfaSecret(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('mfa/enable')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Enable MFA',
    description: 'Enable MFA by verifying the setup code',
  })
  @ApiBody({ schema: { example: { code: '123456' } } })
  @ApiResponse({
    status: 200,
    description: 'MFA enabled successfully',
    schema: {
      example: {
        message: 'MFA enabled',
        backupCodes: ['12345678', '87654321'],
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid MFA code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async enableMfa(@Req() req: Request, @Body('code') code: string) {
    const user = req.user as User;
    return this.authServiceService.enableMfa(user, code);
  }

  @Post('mfa/verify')
  @ApiOperation({
    summary: 'Verify MFA Code',
    description: 'Verify MFA code during login',
  })
  @ApiBody({ type: VerifyMfaDto })
  @ApiResponse({
    status: 200,
    description: 'MFA verified successfully',
    schema: {
      example: {
        message: 'MFA verified',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid MFA code' })
  async verifyMfa(@Body() { userId, code }: VerifyMfaDto) {
    const user = await this.authServiceService.validateUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.authServiceService.verifyMfaCode(user, code);
  }

  @Post('verify-account')
  @ApiOperation({
    summary: 'Verify Account',
    description: 'Verify user account after registration',
  })
  @ApiBody({ type: VerifyAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Account verified successfully',
    schema: { example: { message: 'Account verified', status: 'active' } },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyAccount(@Body() { userId }: VerifyAccountDto) {
    return this.authServiceService.verifyAccount(userId);
  }

  @Post('send-verification-otp')
  @ApiOperation({
    summary: 'Send Verification OTP',
    description: 'Send OTP to email for account verification',
  })
  @ApiBody({ type: SendVerificationOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Verification OTP sent successfully',
    schema: { example: { message: 'Verification OTP sent to your email' } },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  async sendVerificationOtp(@Body() dto: SendVerificationOtpDto) {
    await this.authServiceService.sendVerificationOtp(dto.email, dto.tenantId);
    return { message: 'Verification OTP sent to your email' };
  }

  @Post('verify-email-otp')
  @ApiOperation({
    summary: 'Verify Email OTP',
    description: 'Verify email with OTP code',
  })
  @ApiBody({ type: VerifyEmailOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully',
    schema: { example: { message: 'Email verified successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async verifyEmailOtp(@Body() dto: VerifyEmailOtpDto) {
    await this.authServiceService.verifyEmailOtp(dto.email, dto.otp, dto.tenantId);
    return { message: 'Email verified successfully' };
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Request password reset OTP',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset OTP sent',
    schema: { example: { message: 'If the email exists, a password reset OTP has been sent' } },
  })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authServiceService.sendPasswordResetOtp(dto.email, dto.tenantId);
    return { message: 'If the email exists, a password reset OTP has been sent' };
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Reset password using OTP',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: { example: { message: 'Password reset successfully' } },
  })
  @ApiResponse({ status: 401, description: 'Invalid or expired OTP' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authServiceService.resetPassword(
      dto.email,
      dto.otp,
      dto.newPassword,
      dto.tenantId,
    );
    return { message: 'Password reset successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Current User',
    description: 'Get the profile of the currently authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'admin@queensos.com',
        phone: '+2348012345678',
        firstName: 'John',
        lastName: 'Doe',
        tenantId: 'root-admin',
        status: 'active',
        isVerified: true,
        mfaEnabled: false,
        createdAt: '2026-05-28T10:00:00Z',
        updatedAt: '2026-05-28T10:00:00Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@Req() req: Request) {
    const user = req.user as User;
    return this.authServiceService.getUser(user.id, user.tenantId);
  }

  @Get('tenants/:tenantId/validate')
  @ApiOperation({
    summary: 'Validate Tenant',
    description: 'Validate tenant ID and get tenant information (used by API Gateway)',
  })
  @ApiParam({
    name: 'tenantId',
    description: 'Tenant ID to validate',
    example: 'root-admin',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenant validation info',
    schema: {
      example: {
        tenantId: 'root-admin',
        isActive: true,
        isRoot: false,
        status: 'ACTIVE',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 400, description: 'Tenant not active' })
  async validateTenant(@Param('tenantId') tenantId: string) {
    return this.tenantService.getTenantValidationInfo(tenantId);
  }

  // ─── Tenant Management (root-admin only) ──────────────────────────────────

  @Get('tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, description: 'List of tenants returned' })
  async listTenants(@Req() req: Request) {
    const user = req.user as { tenantId: string };
    const all = await this.tenantService.getAllTenants();
    if (user.tenantId !== 'root-admin') {
      return { data: all.filter(t => t.tenantId === user.tenantId), total: 1 };
    }
    return { data: all, total: all.length };
  }

  @Get('tenants/:tenantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a single tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant ID' })
  @ApiResponse({ status: 200, description: 'Tenant details returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTenantById(@Param('tenantId') tenantId: string) {
    const tenant = await this.tenantService.getTenant(tenantId);
    if (!tenant) throw new UnauthorizedException('Tenant not found');
    return tenant;
  }

  @Post('tenants')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new tenant (root-admin only)' })
  @ApiResponse({ status: 201, description: 'Tenant created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createTenantEndpoint(
    @Req() req: Request,
    @Body() body: { tenantId: string; name: string; domain?: string; subscriptionPlan?: string },
  ) {
    const user = req.user as { tenantId: string };
    if (user.tenantId !== 'root-admin') {
      throw new UnauthorizedException('Only root-admin can create tenants');
    }
    return this.tenantService.createTenant(body);
  }

  @Patch('tenants/:tenantId/suspend')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Suspend a tenant (root-admin only)' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant ID to suspend' })
  @ApiResponse({ status: 200, description: 'Tenant suspended successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async suspendTenantEndpoint(@Req() req: Request, @Param('tenantId') tenantId: string) {
    const user = req.user as { tenantId: string };
    if (user.tenantId !== 'root-admin') throw new UnauthorizedException('Root-admin only');
    return this.tenantService.updateTenantStatus(tenantId, TenantStatus.SUSPENDED);
  }

  @Patch('tenants/:tenantId/activate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Activate a suspended tenant (root-admin only)' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant ID to activate' })
  @ApiResponse({ status: 200, description: 'Tenant activated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async activateTenantEndpoint(@Req() req: Request, @Param('tenantId') tenantId: string) {
    const user = req.user as { tenantId: string };
    if (user.tenantId !== 'root-admin') throw new UnauthorizedException('Root-admin only');
    return this.tenantService.updateTenantStatus(tenantId, TenantStatus.ACTIVE);
  }
}
