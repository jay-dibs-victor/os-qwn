/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApprovalMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ApprovalMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const path = req.path;
    const tenantId = req.headers['x-tenant-id'] as string;
    const userId = req.headers['x-user-id'] as string;

    if (!tenantId || !userId || req.headers['x-bypass-approval']) {
      return next();
    }

    // Only intercept mutation methods
    const mutationMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    if (!mutationMethods.includes(method)) {
      return next();
    }

    try {
      const rbacUrl = `http://${this.configService.get('RBAC_SERVICE_HOST')}:${this.configService.get('RBAC_SERVICE_PORT')}/rbac`;
      const approvalUrl = `http://${this.configService.get('APPROVAL_SERVICE_HOST')}:${this.configService.get('APPROVAL_SERVICE_PORT')}/approval`;

      // 1. Check if configuration exists for this endpoint
      const configRes = await axios.get(`${approvalUrl}/configs`, {
        params: { method, path, tenantId },
      });

      const approvalConfig = configRes.data;

      // If no config exists, proceed normally to the microservice
      if (!approvalConfig || approvalConfig.path !== path) {
        return next();
      }

      // 2. Enforce Permission Check (if required by config)
      if (approvalConfig.requiredPermission) {
        const permsRes = await axios.get(
          `${rbacUrl}/users/${userId}/permissions`,
          {
            params: { tenantId },
          },
        );
        const permissions = permsRes.data as string[];

        if (!permissions.includes(approvalConfig.requiredPermission)) {
          return res.status(403).json({
            message: `Forbidden: You lack the required permission (${approvalConfig.requiredPermission}) to initiate this action.`,
          });
        }
      }

      // 3. Approval Flow Interception
      if (approvalConfig.isEnabled) {
        const approvalReqRes = await axios.post(`${approvalUrl}/requests`, {
          method,
          path,
          payload: req.body,
          initiatorId: userId,
          tenantId,
          requiredPermission: approvalConfig.requiredPermission,
        });

        return res.status(202).json({
          message: 'Request intercepted for n-level approval',
          requestId: approvalReqRes.data.id,
          requiredPermission: approvalConfig.requiredPermission,
        });
      }

      // 4. If config exists but approval is disabled, proceed to microservice
      return next();
    } catch (error) {
      this.logger.error('Error in ApprovalMiddleware', error);
      return next();
    }
  }
}
