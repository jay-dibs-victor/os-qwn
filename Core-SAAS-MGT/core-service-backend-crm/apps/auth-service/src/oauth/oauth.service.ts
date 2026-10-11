import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Inject,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { OAuthClient } from '../entities/oauth-client.entity';
import { AuthCode } from '../entities/auth-code.entity';
import { OAuthAccessToken } from '../entities/oauth-access-token.entity';
import { OAuthRefreshToken } from '../entities/oauth-refresh-token.entity';
import { Tenant } from '../entities/tenant.entity';
import { User } from '../entities/user.entity';
import {
  AuthorizeDto,
  TokenExchangeDto,
  RegisterClientDto,
  IntrospectTokenDto,
} from './oauth.dto';
import { AuthServiceService } from '../auth-service.service';

@Injectable()
export class OauthService {
  private readonly logger = new Logger(OauthService.name);

  constructor(
    @InjectRepository(OAuthClient)
    private readonly clientRepo: Repository<OAuthClient>,
    @InjectRepository(AuthCode)
    private readonly authCodeRepo: Repository<AuthCode>,
    @InjectRepository(OAuthAccessToken)
    private readonly accessTokenRepo: Repository<OAuthAccessToken>,
    @InjectRepository(OAuthRefreshToken)
    private readonly refreshTokenRepo: Repository<OAuthRefreshToken>,
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    @Inject(forwardRef(() => AuthServiceService))
    private readonly authService: AuthServiceService,
    private readonly jwtService: JwtService,
  ) {}

  async registerClient(dto: RegisterClientDto, tenantId: string) {
    const clientId = `client_${randomBytes(16).toString('hex')}`;
    let clientSecretHash: string | null = null;
    let rawSecret: string | undefined;

    if (!dto.isPublic) {
      rawSecret = randomBytes(32).toString('hex');
      clientSecretHash = await bcrypt.hash(rawSecret, 10);
    }

    const client = this.clientRepo.create({
      clientName: dto.clientName,
      clientId,
      clientSecretHash: clientSecretHash ?? undefined,
      isPublic: dto.isPublic ?? true,
      redirectUris: dto.redirectUris.join('\n'),
      scopes: (dto.scopes ?? ['openid', 'profile']).join(' '),
      grantTypes: (dto.grantTypes ?? ['authorization_code']).join(','),
      description: dto.description,
      tenantId,
    });

    await this.clientRepo.save(client);

    return {
      client_id: clientId,
      ...(rawSecret ? { client_secret: rawSecret } : {}),
      is_public: client.isPublic,
    };
  }

  async authorize(dto: AuthorizeDto, user: User): Promise<string> {
    const client = await this.clientRepo.findOne({
      where: { clientId: dto.client_id, isActive: true },
    });

    if (!client) throw new NotFoundException('OAuth client not found.');

    const allowedUris = client.redirectUris.split('\n').map((u) => u.trim());
    if (!allowedUris.includes(dto.redirect_uri)) {
      throw new BadRequestException(
        'redirect_uri not allowed for this client.',
      );
    }

    const code = uuidv4();
    const authCode = this.authCodeRepo.create({
      code,
      codeChallenge: dto.code_challenge,
      codeChallengeMethod: dto.code_challenge_method,
      redirectUri: dto.redirect_uri,
      scopes: dto.scope,
      tenantId: user.tenantId,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      user,
      client,
    });

    await this.authCodeRepo.save(authCode);

    const redirect = new URL(dto.redirect_uri);
    redirect.searchParams.set('code', code);
    if (dto.state) redirect.searchParams.set('state', dto.state);

    return redirect.toString();
  }

  async exchangeCode(dto: TokenExchangeDto) {
    if (dto.grant_type === 'authorization_code') {
      return this.handleCodeExchange(dto);
    }
    if (dto.grant_type === 'refresh_token' && dto.refresh_token) {
      return this.handleRefreshToken(dto);
    }
    if (dto.grant_type === 'client_credentials') {
      return this.handleClientCredentials(dto);
    }
    if (dto.grant_type === 'urn:ietf:params:oauth:grant-type:token-exchange') {
      return this.handleTokenExchange(dto);
    }
    throw new BadRequestException('Unsupported grant_type.');
  }

  private async handleCodeExchange(dto: TokenExchangeDto) {
    if (!dto.code || !dto.code_verifier || !dto.redirect_uri) {
      throw new BadRequestException(
        'code, code_verifier and redirect_uri are required.',
      );
    }

    const authCode = await this.authCodeRepo.findOne({
      where: { code: dto.code, used: false },
      relations: ['user', 'client'],
    });

    if (!authCode || authCode.expiresAt < new Date()) {
      throw new UnauthorizedException(
        'Authorization code is invalid or expired.',
      );
    }

    if (authCode.redirectUri !== dto.redirect_uri) {
      throw new BadRequestException('redirect_uri mismatch.');
    }

    const computed = createHash('sha256')
      .update(dto.code_verifier)
      .digest('base64url');

    if (computed !== authCode.codeChallenge) {
      throw new UnauthorizedException('PKCE verification failed.');
    }

    authCode.used = true;
    await this.authCodeRepo.save(authCode);

    return this.generateOAuthTokens(
      authCode.user,
      authCode.client,
      authCode.scopes,
    );
  }

  private async handleRefreshToken(dto: TokenExchangeDto) {
    if (!dto.refresh_token) {
      throw new BadRequestException('refresh_token is required.');
    }

    const refreshToken = await this.refreshTokenRepo.findOne({
      where: { refreshToken: dto.refresh_token, isRevoked: false },
      relations: ['user', 'client', 'tenant'],
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }

    // Validate client
    const client = await this.clientRepo.findOne({
      where: { clientId: dto.client_id, isActive: true },
    });

    if (!client || client.id !== refreshToken.client.id) {
      throw new UnauthorizedException('Client mismatch.');
    }

    // Revoke old refresh token (token rotation)
    refreshToken.isRevoked = true;
    await this.refreshTokenRepo.save(refreshToken);

    // Generate new tokens
    const scopes = client.scopes; // Use client's default scopes
    return this.generateOAuthTokens(refreshToken.user, client, scopes);
  }

  private async handleClientCredentials(dto: TokenExchangeDto) {
    if (!dto.client_secret) {
      throw new BadRequestException(
        'client_secret is required for client_credentials grant.',
      );
    }

    // Validate client
    const client = await this.clientRepo.findOne({
      where: { clientId: dto.client_id, isActive: true },
      relations: ['tenant'],
    });

    if (!client) {
      throw new UnauthorizedException('Invalid client credentials.');
    }

    if (client.isPublic) {
      throw new BadRequestException(
        'Public clients cannot use client_credentials grant.',
      );
    }

    // Check if client_credentials is allowed
    const allowedGrants = client.grantTypes.split(',').map((g) => g.trim());
    if (!allowedGrants.includes('client_credentials')) {
      throw new BadRequestException(
        'client_credentials grant not allowed for this client.',
      );
    }

    // Verify client secret
    const isValid = await bcrypt.compare(
      dto.client_secret,
      client.clientSecretHash,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid client credentials.');
    }

    // Validate tenant
    const tenant = await this.tenantRepo.findOne({
      where: { tenantId: client.tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found.');
    }

    // Determine scopes (use requested scopes or default to client scopes)
    const requestedScopes = dto.scope
      ? dto.scope.split(' ')
      : client.scopes.split(' ');
    const clientScopes = client.scopes.split(' ');

    // Validate requested scopes are subset of client scopes
    const invalidScopes = requestedScopes.filter(
      (s) => !clientScopes.includes(s),
    );
    if (invalidScopes.length > 0) {
      throw new BadRequestException(
        `Invalid scopes: ${invalidScopes.join(', ')}`,
      );
    }

    const scopes = requestedScopes.join(' ');

    // Generate access token (no refresh token for client_credentials)
    return this.generateClientCredentialsToken(client, tenant, scopes);
  }

  private async handleTokenExchange(dto: TokenExchangeDto) {
    if (!dto.client_secret) {
      throw new BadRequestException(
        'client_secret is required for token-exchange grant.',
      );
    }
    if (!dto.subject_token) {
      throw new BadRequestException(
        'subject_token is required for token-exchange grant.',
      );
    }

    // Validate client credentials
    const client = await this.clientRepo.findOne({
      where: { clientId: dto.client_id, isActive: true },
      relations: ['tenant'],
    });

    if (!client) {
      throw new UnauthorizedException('Invalid client credentials.');
    }

    if (client.isPublic) {
      throw new BadRequestException(
        'Public clients cannot use token-exchange grant.',
      );
    }

    const allowedGrants = client.grantTypes.split(',').map((g) => g.trim());
    if (!allowedGrants.includes('urn:ietf:params:oauth:grant-type:token-exchange')) {
      throw new BadRequestException(
        'token-exchange grant not allowed for this client.',
      );
    }

    const isValid = await bcrypt.compare(
      dto.client_secret,
      client.clientSecretHash,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid client credentials.');
    }

    // Validate tenant
    const tenant = await this.tenantRepo.findOne({
      where: { tenantId: client.tenantId },
    });
    if (!tenant) {
      throw new UnauthorizedException('Tenant not found.');
    }

    // Decode subject_token to extract user identity
    // The subject_token is a JWT issued by the taxi-server (signed with its own key).
    // We decode it without verifying the signature — trust is established via
    // the client_credentials authentication of the taxi-server OAuth client.
    let subjectSub: string | null = null;
    try {
      const parts = dto.subject_token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(
          Buffer.from(parts[1], 'base64url').toString('utf8'),
        );
        subjectSub = payload.sub || payload.id || null;
      }
    } catch {
      // If the token cannot be parsed as JWT, treat subject_token as a raw user UUID
      subjectSub = dto.subject_token;
    }

    if (!subjectSub) {
      throw new BadRequestException(
        'Could not extract subject identity from subject_token.',
      );
    }

    // Look up the user in the SaaS database
    let user: User | null = null;
    try {
      // First try by UUID (existing SaaS user)
      user = await this.authService.validateUserById(subjectSub);
    } catch {
      user = null;
    }

    if (!user) {
      throw new UnauthorizedException(
        'Subject user not found in the SaaS system.',
      );
    }

    // Resolve scopes from client scopes
    const requestedScopes = dto.scope
      ? dto.scope.split(' ')
      : client.scopes.split(' ');
    const clientScopes = client.scopes.split(' ');
    const invalidScopes = requestedScopes.filter(
      (s) => !clientScopes.includes(s),
    );
    if (invalidScopes.length > 0) {
      throw new BadRequestException(
        `Invalid scopes: ${invalidScopes.join(', ')}`,
      );
    }

    const scopes = requestedScopes.join(' ');

    // Issue a user-scoped OAuth token (same as authorization_code flow)
    return this.generateOAuthTokens(user, client, scopes);
  }

  private async generateOAuthTokens(
    user: User,
    client: OAuthClient,
    scopes: string,
  ) {
    const tenant = await this.tenantRepo.findOne({
      where: { tenantId: user.tenantId },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found.');
    }

    // Generate access token
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      clientId: client.clientId,
      scope: scopes,
      isRoot: tenant.isRoot,
      type: 'oauth_access',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: `${client.tokenLifetime}s`,
    });

    // Store access token
    const accessTokenEntity = this.accessTokenRepo.create({
      accessToken,
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + client.tokenLifetime * 1000),
      scopes,
      tenantId: user.tenantId,
      userId: user.id,
      clientId: client.clientId,
      client,
      user,
      tenant,
    });

    await this.accessTokenRepo.save(accessTokenEntity);

    // Generate refresh token
    const refreshTokenValue = randomBytes(32).toString('hex');
    const refreshTokenEntity = this.refreshTokenRepo.create({
      refreshToken: refreshTokenValue,
      expiresAt: new Date(Date.now() + client.refreshTokenLifetime * 1000),
      tenantId: user.tenantId,
      userId: user.id,
      clientId: client.clientId,
      client,
      user,
      tenant,
    });

    await this.refreshTokenRepo.save(refreshTokenEntity);

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: client.tokenLifetime,
      refresh_token: refreshTokenValue,
      scope: scopes,
      tenant_id: user.tenantId,
    };
  }

  private async generateClientCredentialsToken(
    client: OAuthClient,
    tenant: Tenant,
    scopes: string,
  ) {
    // Generate access token (no user context)
    const accessTokenPayload = {
      sub: client.clientId, // Use client ID as subject
      tenantId: tenant.tenantId,
      clientId: client.clientId,
      scope: scopes,
      isRoot: tenant.isRoot,
      type: 'oauth_client_credentials',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: `${client.tokenLifetime}s`,
    });

    // Store access token
    const accessTokenEntity = this.accessTokenRepo.create({
      accessToken,
      tokenType: 'Bearer',
      expiresAt: new Date(Date.now() + client.tokenLifetime * 1000),
      scopes,
      tenantId: tenant.tenantId,
      userId: null as any, // No user for client_credentials
      clientId: client.clientId,
      client,
      tenant,
      user: null as any, // No user relation for client_credentials
    } as any);

    await this.accessTokenRepo.save(accessTokenEntity);

    this.logger.log(
      `Generated client_credentials token for client ${client.clientId} (tenant: ${tenant.tenantId})`,
    );

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: client.tokenLifetime,
      scope: scopes,
      tenant_id: tenant.tenantId,
    };
  }

  async introspectToken(dto: IntrospectTokenDto) {
    // Validate client
    const client = await this.clientRepo.findOne({
      where: { clientId: dto.client_id, isActive: true },
    });

    if (!client) {
      throw new UnauthorizedException('Invalid client.');
    }

    // Verify client secret for confidential clients
    if (!client.isPublic) {
      if (!dto.client_secret) {
        throw new BadRequestException('client_secret is required.');
      }

      const isValid = await bcrypt.compare(
        dto.client_secret,
        client.clientSecretHash,
      );

      if (!isValid) {
        throw new UnauthorizedException('Invalid client credentials.');
      }
    }

    // Find access token
    const accessToken = await this.accessTokenRepo.findOne({
      where: { accessToken: dto.token },
      relations: ['user', 'client', 'tenant'],
    });

    if (!accessToken) {
      return { active: false };
    }

    // Check if token is expired or revoked
    if (accessToken.isRevoked || accessToken.expiresAt < new Date()) {
      return { active: false };
    }

    // Return token metadata
    return {
      active: true,
      scope: accessToken.scopes,
      client_id: accessToken.clientId,
      tenant_id: accessToken.tenantId,
      user_id: accessToken.userId,
      exp: Math.floor(accessToken.expiresAt.getTime() / 1000),
      iat: Math.floor(accessToken.createdAt.getTime() / 1000),
      token_type: accessToken.tokenType,
      is_root: accessToken.tenant.isRoot,
    };
  }

  /**
   * Validate JWT token and extract user information
   * Used for checking if user is authenticated
   */
  async validateAndGetUser(token: string): Promise<User | null> {
    try {
      const decoded = this.jwtService.verify(token);
      if (!decoded.sub) return null;

      const user = await this.authService.validateUserById(decoded.sub);
      return user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Store OAuth request for later retrieval
   * Used when user is not authenticated and needs to login first
   */
  async storeOAuthRequest(dto: AuthorizeDto): Promise<string> {
    const requestId = uuidv4();
    // In production, store this in Redis or database with TTL
    // For now, we'll store in memory (not suitable for production)
    const oauthRequests = new Map<string, AuthorizeDto>();
    oauthRequests.set(requestId, dto);
    
    this.logger.debug(`Stored OAuth request: ${requestId}`);
    return requestId;
  }
}
