import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { authenticator } from 'otplib';
import axios from 'axios';

import { toDataURL } from 'qrcode';
import { UsersRepository } from './users.repository';
import { AuthTokensRepository } from './auth-tokens.repository';
import { AuthToken } from './entities/auth-token.entity';
import { OAuthClient } from './entities/oauth-client.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {
  PublicUser,
  CreateAdminUserDto,
  UpdateAdminUserDto,
} from './dto/admin-user.dto';
import { User, UserStatus, UserRole } from './entities/user.entity';
import { Otp, OtpType } from './entities/otp.entity';
import { EmailService } from '@app/common';
import { TenantService } from './tenant.service';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  jti: string;
}

@Injectable()
export class AuthServiceService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly authTokensRepository: AuthTokensRepository,
    private readonly jwtService: JwtService,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    private readonly emailService: EmailService,
    private readonly tenantService: TenantService,
    private readonly moduleRef: ModuleRef,
  ) {}

  private toPublicUser(user: User): PublicUser {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      mfaEnabled: user.mfaEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async validateUser(loginUserDto: LoginUserDto): Promise<User> {
    // Search by email across all tenants (email is globally unique)
    const user = await this.usersRepository.findOneNullable(
      { email: loginUserDto.email }
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Account is not verified. Please verify your email/phone before logging in.',
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active.');
    }

    return user;
  }

  async login(user: User) {
    if (user.mfaEnabled) {
      return {
        mfa_required: true,
        user_id: user.id,
      };
    }

    return this.generateTokensWithOAuth(user);
  }

  /**
   * Generate both JWT and OAuth tokens
   * Called after successful login
   */
  private async generateTokensWithOAuth(user: User) {
    const jwtTokens = await this.generateTokens(user);
    
    // Generate OAuth tokens internally
    const oauthTokens = await this.generateOAuthTokensForUser(user);
    
    return {
      ...jwtTokens,
      oauth: oauthTokens,
    };
  }

  /**
   * Generate OAuth tokens for authenticated user
   * Used internally after successful login
   */
  private async generateOAuthTokensForUser(user: User) {
    try {
      // Get the default OAuth client for this tenant
      const oauthClient = await this.getDefaultOAuthClient(user.tenantId);
      
      if (!oauthClient) {
        // If no OAuth client, return minimal OAuth metadata
        return {
          client_id: 'default',
          scope: 'openid profile email',
          tenant_id: user.tenantId,
        };
      }

      // Generate OAuth access token
      const oauthAccessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        tenantId: user.tenantId,
        clientId: oauthClient.clientId,
        scope: oauthClient.scopes,
        isRoot: false,
        type: 'oauth_access',
      }, {
        expiresIn: `${oauthClient.tokenLifetime}s`,
      });

      // Generate OAuth refresh token
      const oauthRefreshToken = this.jwtService.sign({
        sub: user.id,
        tenantId: user.tenantId,
        clientId: oauthClient.clientId,
        type: 'oauth_refresh',
      }, {
        expiresIn: `${oauthClient.refreshTokenLifetime}s`,
      });

      return {
        access_token: oauthAccessToken,
        refresh_token: oauthRefreshToken,
        token_type: 'Bearer',
        expires_in: oauthClient.tokenLifetime,
        scope: oauthClient.scopes,
        client_id: oauthClient.clientId,
        tenant_id: user.tenantId,
      };
    } catch (error) {
      console.error('Failed to generate OAuth tokens:', error);
      // Return minimal OAuth metadata if generation fails
      return {
        client_id: 'default',
        scope: 'openid profile email',
        tenant_id: user.tenantId,
      };
    }
  }

  /**
   * Get default OAuth client for tenant
   */
  private async getDefaultOAuthClient(tenantId: string): Promise<OAuthClient | null> {
    try {
      // This would query the OAuth client repository
      // For now, return null to use minimal metadata
      return null;
    } catch (error) {
      return null;
    }
  }

  async generateTokens(user: User) {
    const jti = uuidv4();
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      jti,
    };

    // Fetch permissions from RBAC service
    let permissions: string[] = [];
    try {
      const rbacUrl = this.configService.get<string>('RBAC_SERVICE_URL');
      if (!rbacUrl) {
        throw new Error('RBAC_SERVICE_URL is not configured');
      }
      const response = await axios.get(
        `${rbacUrl}/users/${user.id}/permissions`,
        {
          params: { tenantId: user.tenantId },
        },
      );
      permissions = response.data as string[];
    } catch (error) {
      console.error('Failed to fetch permissions from RBAC service', error);
    }

    const accessToken = this.jwtService.sign({ ...payload, permissions });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '30d',
    });

    const tokenEntity = new AuthToken();
    tokenEntity.jti = jti;
    tokenEntity.type = 'refresh';
    tokenEntity.user = user;
    tokenEntity.tenantId = user.tenantId;
    tokenEntity.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await this.authTokensRepository.create(tokenEntity);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      // Use findOneNullable — token may not exist if service restarted or was never stored
      const token = await this.authTokensRepository.findOneNullable(
        {
          jti: payload.jti,
          revoked: false,
        },
        { user: true },
      );

      if (!token || token.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token.');
      }

      // Revoke old token
      await this.authTokensRepository.findOneAndUpdate(
        { id: token.id },
        { revoked: true },
      );

      // Generate new pair
      return this.generateTokens(token.user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
  }

  async revokeToken(jti: string) {
    await this.authTokensRepository.findOneAndUpdate(
      { jti },
      { revoked: true },
    );
  }

  async revokeAllUserTokens(userId: string) {
    // Note: AbstractRepository might not support updateMany directly,
    // so we use the underlying TypeORM repository if needed, or find and update.
    const tokens = await this.authTokensRepository.find({
      user: { id: userId },
      revoked: false,
    });
    await Promise.all(
      tokens.map((token) =>
        this.authTokensRepository.findOneAndUpdate(
          { id: token.id },
          { revoked: true },
        ),
      ),
    );
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    // Validate tenant exists and is active
    await this.tenantService.validateTenant(registerUserDto.tenantId);

    try {
      const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

      const user = await this.usersRepository.create({
        ...registerUserDto,
        password: hashedPassword,
      } as User);

      // Send verification OTP email - don't fail registration if email fails
      try {
        await this.sendVerificationOtp(user.email, user.tenantId, user.firstName);
      } catch (emailError) {
        console.warn('Failed to send verification OTP email:', emailError);
        // Continue with registration even if email fails
      }

      return user;
    } catch (error) {
      if ((error as unknown as { code: string }).code === '23505') {
        // Postgres unique violation
        throw new ConflictException(
          'User with this email or phone already exists.',
        );
      }
      throw error;
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationOtp(email: string, tenantId: string, firstName?: string): Promise<void> {
    // Check if user exists
    const user = await this.usersRepository.findOneNullable({ email, tenantId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerified) {
      throw new BadRequestException('User is already verified');
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete any existing verification OTPs for this email
    await this.otpRepository.delete({
      email,
      tenantId,
      type: OtpType.EMAIL_VERIFICATION,
    });

    // Save new OTP
    const otpEntity = this.otpRepository.create({
      email,
      otpHash,
      type: OtpType.EMAIL_VERIFICATION,
      tenantId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await this.otpRepository.save(otpEntity);

    // Send email
    await this.emailService.send({
      to: email,
      subject: 'Verify Your Queens OS Account',
      templateName: 'verification-otp',
      context: { firstName: firstName || user.firstName, otp, year: new Date().getFullYear() },
    });
  }

  async verifyEmailOtp(email: string, otp: string, tenantId: string): Promise<void> {
    // Find valid OTP
    const otpRecords = await this.otpRepository.find({
      where: {
        email,
        tenantId,
        type: OtpType.EMAIL_VERIFICATION,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (otpRecords.length === 0) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      throw new UnauthorizedException('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await this.otpRepository.save(otpRecord);
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark OTP as used
    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // Verify user account
    const user = await this.usersRepository.findOneNullable({ email, tenantId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { isVerified: true, status: UserStatus.ACTIVE },
    );

    // Send welcome email
    try {
      await this.emailService.send({
        to: email,
        subject: 'Welcome to Queens OS',
        templateName: 'welcome',
        context: { firstName: user.firstName, year: new Date().getFullYear() },
      });
    } catch {
      // welcome email is non-critical
    }
  }

  async sendPasswordResetOtp(email: string, tenantId: string): Promise<void> {
    // Check if user exists
    const user = await this.usersRepository.findOneNullable({ email, tenantId });
    if (!user) {
      // Don't reveal if user exists or not for security
      return;
    }

    // Generate OTP
    const otp = this.generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete any existing password reset OTPs for this email
    await this.otpRepository.delete({
      email,
      tenantId,
      type: OtpType.PASSWORD_RESET,
    });

    // Save new OTP
    const otpEntity = this.otpRepository.create({
      email,
      otpHash,
      type: OtpType.PASSWORD_RESET,
      tenantId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    await this.otpRepository.save(otpEntity);

    // Send email
    await this.emailService.send({
      to: email,
      subject: 'Reset Your Queens OS Password',
      templateName: 'password-reset-otp',
      context: { firstName: user.firstName, otp, year: new Date().getFullYear() },
    });
  }

  async resetPassword(email: string, otp: string, newPassword: string, tenantId: string): Promise<void> {
    // Find valid OTP
    const otpRecords = await this.otpRepository.find({
      where: {
        email,
        tenantId,
        type: OtpType.PASSWORD_RESET,
        used: false,
      },
      order: { createdAt: 'DESC' },
    });

    if (otpRecords.length === 0) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const otpRecord = otpRecords[0];

    // Check expiry
    if (otpRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    // Check attempts (max 5)
    if (otpRecord.attempts >= 5) {
      throw new UnauthorizedException('Too many failed attempts. Please request a new OTP.');
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await this.otpRepository.save(otpRecord);
      throw new UnauthorizedException('Invalid OTP');
    }

    // Mark OTP as used
    otpRecord.used = true;
    await this.otpRepository.save(otpRecord);

    // Update password
    const user = await this.usersRepository.findOneNullable({ email, tenantId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { password: hashedPassword },
    );

    // Revoke all existing tokens for security
    await this.revokeAllUserTokens(user.id);
  }

  getHello(): string {
    return 'Hello World!';
  }

  async validateUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findOneNullable({ id: userId });
  }

  async generateMfaSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'CoreBankingSaaS',
      secret,
    );

    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { mfaSecret: secret },
    );

    return {
      secret,
      qrCode: await toDataURL(otpauthUrl),
    };
  }

  async enableMfa(user: User, code: string) {
    if (!user.mfaSecret) {
      throw new ConflictException('MFA secret not generated');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { mfaEnabled: true },
    );

    return { message: 'MFA enabled successfully' };
  }

  async verifyMfaCode(user: User, code: string) {
    if (!user.mfaSecret || !user.mfaEnabled) {
      throw new UnauthorizedException('MFA is not enabled for this user');
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.mfaSecret,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    return this.generateTokens(user);
  }

  async verifyAccount(userId: string) {
    await this.usersRepository.findOneAndUpdate(
      { id: userId },
      { isVerified: true, status: UserStatus.ACTIVE },
    );
    return { message: 'Account verified successfully' };
  }

  async listUsers(tenantId: string, filterTenantId?: string, filterEmail?: string) {
    let where: any;
    if (tenantId === 'root-admin') {
      where = filterTenantId ? { tenantId: filterTenantId } : {};
    } else {
      where = { tenantId };
    }
    if (filterEmail) {
      where.email = filterEmail;
    }
    const users = await this.usersRepository.find(where);
    const data = users.map((u) => this.toPublicUser(u));
    return { data, total: data.length };
  }

  async getUser(id: string, tenantId: string) {
    // root-admin can fetch any user regardless of tenant
    const where = tenantId === 'root-admin' ? { id } : { id, tenantId };
    const user = await this.usersRepository.findOne(where);
    return this.toPublicUser(user);
  }

  async createAdminUser(dto: CreateAdminUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const created = await this.usersRepository.create({
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        tenantId: dto.tenantId,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? UserRole.STAFF,
        status: dto.status ?? UserStatus.ACTIVE,
        isVerified: dto.isVerified ?? true,
      } as User);
      return this.toPublicUser(created);
    } catch (error) {
      if ((error as unknown as { code: string }).code === '23505') {
        throw new ConflictException(
          'User with this email or phone already exists.',
        );
      }
      throw error;
    }
  }

  async updateAdminUser(id: string, tenantId: string, dto: UpdateAdminUserDto) {
    const partial: Partial<User> = { ...dto } as any;
    if (dto.password) {
      partial.password = await bcrypt.hash(dto.password, 10);
    }

    // root-admin can update any user; others are scoped to their tenant
    const where = tenantId === 'root-admin' ? { id } : { id, tenantId };
    const updated = await this.usersRepository.findOneAndUpdate(where, partial);

    if (dto.status && dto.status !== UserStatus.ACTIVE) {
      await this.revokeAllUserTokens(updated.id);
    }

    return this.toPublicUser(updated);
  }

  async deleteUser(id: string, tenantId: string) {
    const where = tenantId === 'root-admin' ? { id } : { id, tenantId };
    await this.usersRepository.findOneAndDelete(where);
  }

  async handleGoogleOAuth(googleUserData: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
    picture?: string;
    tenantId: string;
  }) {
    const { email, firstName, lastName, googleId, picture, tenantId } = googleUserData;

    // Check if user exists
    let user = await this.usersRepository.findOneNullable({
      email,
      tenantId,
    });

    if (!user) {
      // Create new user from Google OAuth
      const userData = {
        email,
        firstName,
        lastName,
        phone: '', // Optional for OAuth users
        tenantId,
        status: UserStatus.ACTIVE,
        emailVerified: true, // Google emails are verified
        googleId,
        profilePicture: picture,
        password: '', // OAuth users don't have password
        mfaEnabled: false,
        isVerified: false,
        riskScore: 0,
      } as any;
      user = await this.usersRepository.create(userData);
    } else if (!user.googleId) {
      // Link Google account to existing user
      user = await this.usersRepository.findOneAndUpdate(
        { id: user.id, tenantId },
        {
          googleId,
          emailVerified: true,
          profilePicture: picture,
        }
      );
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Fetch user scopes from the system
    let userScopes: any[] = [];
    try {
      // Try to get user scopes if scope management is available
      const scopeManagementService = this.moduleRef?.get('ScopeManagementService');
      if (scopeManagementService && typeof scopeManagementService.getEnabledUserScopes === 'function') {
        const scopes = await scopeManagementService.getEnabledUserScopes(user.id);
        userScopes = scopes.map((scope: any) => ({
          scopeId: scope.scopeId,
          scopeName: scope.scopeName,
          description: scope.description,
          isEnabled: scope.isEnabled,
          expiresAt: scope.expiresAt,
        }));
      }
    } catch (error) {
      // If scope fetching fails, continue without scopes
      console.warn('Failed to fetch user scopes:', error);
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      userId: user.id,
      tenantId: user.tenantId,
      user: this.toPublicUser(user),
      scopes: userScopes,
      scopeCount: userScopes.length,
    };
  }
}
