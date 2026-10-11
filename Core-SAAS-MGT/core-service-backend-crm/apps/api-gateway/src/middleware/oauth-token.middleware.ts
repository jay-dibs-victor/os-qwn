import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface OAuthIntrospectionResponse {
  active: boolean;
  scope?: string;
  client_id?: string;
  tenant_id?: string;
  user_id?: string;
  exp?: number;
  iat?: number;
  token_type?: string;
  is_root?: boolean;
}

interface OAuthContext {
  clientId: string;
  scopes: string[];
  userId: string | null;
  tenantId: string;
  isRoot: boolean;
  tokenType: string;
  exp: number;
  iat: number;
}

@Injectable()
export class OAuthTokenMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OAuthTokenMiddleware.name);
  private readonly tokenCache = new Map<
    string,
    { context: OAuthContext; expiresAt: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor(private readonly configService: ConfigService) {
    // Clean up expired cache entries every minute
    setInterval(() => this.cleanupCache(), 60 * 1000);
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] as string;

    // Only process Bearer tokens
    if (!authHeader?.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);

    try {
      // Check cache first
      const cached = this.tokenCache.get(token);
      if (cached && cached.expiresAt > Date.now()) {
        req['oauth'] = cached.context;
        this.logger.debug(
          `OAuth token validated from cache: client=${cached.context.clientId}`,
        );
        return next();
      }

      // Introspect token — if it fails or is inactive, treat as a plain JWT
      // and let the downstream service's own auth guard handle it.
      let introspection: OAuthIntrospectionResponse;
      try {
        introspection = await this.introspectToken(token);
      } catch {
        // Introspection failed (network error, service down, plain JWT, etc.)
        // Don't block — pass through as a plain JWT request
        this.logger.debug('Token introspection failed — passing through as plain JWT');
        return next();
      }

      if (!introspection.active) {
        // Not an active OAuth token — could be a plain JWT, pass through
        this.logger.debug('Token not active in OAuth store — passing through as plain JWT');
        return next();
      }

      // Build OAuth context
      const oauthContext: OAuthContext = {
        clientId: introspection.client_id!,
        scopes: introspection.scope ? introspection.scope.split(' ') : [],
        userId: introspection.user_id || null,
        tenantId: introspection.tenant_id!,
        isRoot: introspection.is_root || false,
        tokenType: introspection.token_type || 'Bearer',
        exp: introspection.exp!,
        iat: introspection.iat!,
      };

      // Cache the result
      this.tokenCache.set(token, {
        context: oauthContext,
        expiresAt: Date.now() + this.CACHE_TTL,
      });

      // Attach OAuth context to request
      req['oauth'] = oauthContext;

      this.logger.debug(
        `OAuth token validated: client=${oauthContext.clientId}, tenant=${oauthContext.tenantId}, scopes=${oauthContext.scopes.join(',')}`,
      );

      next();
    } catch (error) {
      this.logger.error(`OAuth token middleware error: ${error.message}`);
      // Don't block on unexpected errors — pass through
      next();
    }
  }

  private async introspectToken(
    token: string,
  ): Promise<OAuthIntrospectionResponse> {
    try {
      const authServiceUrl = this.getAuthServiceUrl();
      const response = await axios.post<OAuthIntrospectionResponse>(
        `${authServiceUrl}/auth/oauth/introspect`,
        {
          token,
          client_id: 'api-gateway', // API Gateway acts as a client
        },
        {
          timeout: 5000,
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.debug(
          `Token introspection skipped (plain JWT): ${error.message}`,
        );
        throw new UnauthorizedException('Failed to validate OAuth token');
      }
      throw error;
    }
  }

  private getAuthServiceUrl(): string {
    const host =
      this.configService.get<string>('AUTH_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('AUTH_SERVICE_PORT') || 3001;
    return `http://${host}:${port}`;
  }

  private cleanupCache(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [token, cached] of this.tokenCache.entries()) {
      if (cached.expiresAt <= now) {
        this.tokenCache.delete(token);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.debug(`Cleaned up ${cleaned} expired token cache entries`);
    }
  }
}
