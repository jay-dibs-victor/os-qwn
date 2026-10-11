import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private publicKey: string;

  constructor(private reflector: Reflector) {
    try {
      this.publicKey = fs.readFileSync(
        path.join(process.cwd(), 'certs/public.pem'),
        'utf8',
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn(
        'Could not load public.pem in PermissionsGuard:',
        message,
      );
    }
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest<{
      user?: { permissions: string[] };
      headers: Record<string, string>;
    }>();

    // 1. If request.user is already populated, use it
    if (request.user?.permissions) {
      return requiredPermissions.every((permission) =>
        request.user?.permissions?.includes(permission),
      );
    }

    // 2. Otherwise, decode JWT token from authorization header
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        if (this.publicKey) {
          const decoded = jwt.verify(token, this.publicKey, {
            algorithms: ['RS256'],
          }) as any;
          request.user = decoded;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(
          'JWT verification failed in PermissionsGuard:',
          message,
        );
      }
    }

    const user = request.user;
    return requiredPermissions.every((permission) =>
      user?.permissions?.includes(permission),
    );
  }
}
