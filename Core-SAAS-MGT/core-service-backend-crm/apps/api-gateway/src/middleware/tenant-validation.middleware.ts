import {
  Injectable,
  NestMiddleware,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

interface TenantContext {
  tenantId: string;
  isRoot: boolean;
  isActive: boolean;
}

interface OAuthTokenPayload {
  sub: string;
  tenantId: string;
  clientId?: string;
  isRoot?: boolean;
  type?: string;
}

@Injectable()
export class TenantValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantValidationMiddleware.name);
  private readonly publicEndpoints = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/send-verification-otp',
    '/auth/verify-email-otp',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/me',
    '/auth/tenants',
    '/auth/oauth/token',
    '/auth/oauth/authorize',
    '/auth/oauth/introspect',
    '/auth/google',
    '/auth/google/callback',
    '/health',
  ];

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip validation for public endpoints
    if (this.isPublicEndpoint(req.path)) {
      return next();
    }

    const tenantId = req.headers['x-tenant-id'] as string;
    const authHeader = req.headers['authorization'] as string;

    try {
      // If Bearer token present, try OAuth context first (set by OAuthTokenMiddleware)
      // If no OAuth context was attached (plain JWT), extract tenantId from JWT directly
      if (authHeader?.startsWith('Bearer ')) {
        const oauthContext = req['oauth'];

        if (oauthContext?.tenantId) {
          // OAuth token already validated by OAuthTokenMiddleware
          req['tenant'] = { tenantId: oauthContext.tenantId, isRoot: oauthContext.isRoot, isActive: true };
          req['tenantId'] = oauthContext.tenantId;
          req['isRoot'] = oauthContext.isRoot;
          return next();
        }

        // Plain JWT — decode it to extract tenantId without introspection
        try {
          const token = authHeader.substring(7);
          const decoded = this.jwtService.decode(token) as { tenantId?: string; sub?: string } | null;
          if (decoded?.tenantId) {
            const isRoot = decoded.tenantId === 'root-admin';
            req['tenant'] = { tenantId: decoded.tenantId, isRoot, isActive: true };
            req['tenantId'] = decoded.tenantId;
            req['isRoot'] = isRoot;
            this.logger.debug(`Plain JWT tenant extracted: ${decoded.tenantId}`);
            return next();
          }
        } catch {
          // fall through to x-tenant-id header check
        }
      }

      // For JWT auth, validate X-Tenant-ID header
      if (!tenantId) {
        throw new BadRequestException('X-Tenant-ID header is required');
      }

      // Validate tenant exists and is active
      const tenantContext = await this.validateTenant(tenantId);

      // Attach tenant context to request
      req['tenant'] = tenantContext;
      req['tenantId'] = tenantContext.tenantId;
      req['isRoot'] = tenantContext.isRoot;

      this.logger.debug(
        `JWT request validated: tenant=${tenantContext.tenantId}`,
      );

      next();
    } catch (error) {
      this.logger.error(`Tenant validation failed: ${error.message}`);
      next(error);
    }
  }

  private isPublicEndpoint(path: string): boolean {
    return this.publicEndpoints.some((endpoint) => path.startsWith(endpoint));
  }

  private async validateOAuthToken(
    token: string,
    requestedTenantId?: string,
  ): Promise<TenantContext> {
    try {
      // Decode JWT to get tenant info (we'll verify via introspection)
      const decoded = this.jwtService.decode(token) as OAuthTokenPayload;

      if (!decoded || !decoded.tenantId) {
        throw new UnauthorizedException('Invalid OAuth token');
      }

      // Call introspection endpoint to validate token
      const authServiceUrl = this.getAuthServiceUrl();
      const introspectionResponse = await axios.post(
        `${authServiceUrl}/auth/oauth/introspect`,
        {
          token,
          client_id: decoded.clientId || 'api-gateway',
        },
        {
          timeout: 5000,
        },
      );

      const introspection = introspectionResponse.data;

      if (!introspection.active) {
        throw new UnauthorizedException('OAuth token is invalid or expired');
      }

      // Check if requested tenant matches token tenant
      if (requestedTenantId && requestedTenantId !== introspection.tenant_id) {
        // Allow root tenant to access any tenant
        if (!introspection.is_root) {
          throw new ForbiddenException(
            'Token tenant does not match requested tenant',
          );
        }
      }

      // Validate tenant is active
      const tenantContext = await this.validateTenant(
        introspection.tenant_id,
      );

      return {
        tenantId: introspection.tenant_id,
        isRoot: introspection.is_root || false,
        isActive: tenantContext.isActive,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `OAuth introspection failed: ${error.message}`,
        );
        throw new UnauthorizedException('Failed to validate OAuth token');
      }
      throw error;
    }
  }

  private async validateTenant(tenantId: string): Promise<TenantContext> {
    try {
      const authServiceUrl = this.getAuthServiceUrl();
      const response = await axios.get(
        `${authServiceUrl}/auth/tenants/${tenantId}/validate`,
        {
          timeout: 5000,
        },
      );

      const tenant = response.data;

      if (!tenant.isActive) {
        throw new ForbiddenException('Tenant is not active');
      }

      return {
        tenantId: tenant.tenantId,
        isRoot: tenant.isRoot || false,
        isActive: tenant.isActive,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new BadRequestException('Tenant not found');
        }
        this.logger.error(`Tenant validation failed: ${error.message}`);
        throw new BadRequestException('Failed to validate tenant');
      }
      throw error;
    }
  }

  private getAuthServiceUrl(): string {
    const host = this.configService.get<string>('AUTH_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('AUTH_SERVICE_PORT') || 3001;
    return `http://${host}:${port}`;
  }
}
