import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SCOPES_KEY } from '../decorators/require-scopes.decorator';

interface OAuthContext {
  clientId: string;
  scopes: string[];
  userId?: string;
  tenantId: string;
}

@Injectable()
export class ScopeValidationGuard implements CanActivate {
  private readonly logger = new Logger(ScopeValidationGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required scopes from decorator
    const requiredScopes = this.reflector.getAllAndOverride<string[]>(
      SCOPES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no scopes required, allow access
    if (!requiredScopes || requiredScopes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const oauth = request['oauth'] as OAuthContext | undefined;

    // If no OAuth context, this is not an OAuth request
    // Let other auth mechanisms handle it (e.g., JWT)
    if (!oauth) {
      this.logger.debug('No OAuth context found, skipping scope validation');
      return true;
    }

    // Validate OAuth token has all required scopes
    const hasAllScopes = requiredScopes.every((scope) =>
      oauth.scopes.includes(scope),
    );

    if (!hasAllScopes) {
      const missingScopes = requiredScopes.filter(
        (scope) => !oauth.scopes.includes(scope),
      );

      this.logger.warn(
        `Access denied: Missing scopes ${missingScopes.join(', ')} for client ${oauth.clientId}`,
      );

      throw new ForbiddenException(
        `Insufficient scopes. Required: ${requiredScopes.join(', ')}. Missing: ${missingScopes.join(', ')}`,
      );
    }

    this.logger.debug(
      `Scope validation passed for client ${oauth.clientId}: ${requiredScopes.join(', ')}`,
    );

    return true;
  }
}
