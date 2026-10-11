import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApprovalConfigsRepository } from './repositories/approval-configs.repository';
import { ApprovalRequestsRepository } from './repositories/approval-requests.repository';
import { ApprovalStepsRepository } from './repositories/approval-steps.repository';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import {
  CreateApprovalConfigDto,
  CreateApprovalRequestDto,
  ApproveStepDto,
} from './dto/approval-flow.dto';
import { ApprovalConfig } from './entities/approval-config.entity';
import {
  ApprovalRequest,
  ApprovalRequestStatus,
} from './entities/approval-request.entity';
import { ApprovalStep } from './entities/approval-step.entity';

@Injectable()
export class ApprovalServiceService {
  constructor(
    private readonly approvalConfigsRepository: ApprovalConfigsRepository,
    private readonly approvalRequestsRepository: ApprovalRequestsRepository,
    private readonly approvalStepsRepository: ApprovalStepsRepository,
    private readonly configService: ConfigService,
  ) {}

  async createApprovalConfig(dto: CreateApprovalConfigDto) {
    if (!dto.method || !dto.path || !dto.tenantId) {
      throw new BadRequestException('method, path, and tenantId are required');
    }
    if (!dto.levels || dto.levels.length === 0) {
      throw new BadRequestException('At least one approval level is required');
    }
    const config = new ApprovalConfig();
    Object.assign(config, dto);
    return this.approvalConfigsRepository.create(config);
  }

  async listApprovalConfigs(tenantId: string, method?: string) {
    const data = await this.approvalConfigsRepository.find(
      method ? ({ tenantId, method } as any) : ({ tenantId } as any),
    );
    return { data, total: data.length };
  }

  async getApprovalConfig(method: string, path: string, tenantId: string) {
    const configs = await this.approvalConfigsRepository.find({
      method,
      tenantId,
    });
    const sorted = [...configs].sort((a, b) => b.path.length - a.path.length);
    return sorted.find((c) => path.startsWith(c.path));
  }

  async createApprovalRequest(dto: CreateApprovalRequestDto) {
    if (!dto.method || !dto.path || !dto.tenantId || !dto.initiatorId || !dto.payload) {
      throw new BadRequestException('method, path, tenantId, initiatorId, and payload are required');
    }
    const request = new ApprovalRequest();
    Object.assign(request, dto);
    return this.approvalRequestsRepository.create(request);
  }

  async getApprovalRequests(tenantId: string) {
    const data = await this.approvalRequestsRepository.find(
      { tenantId },
      { steps: true },
    );
    const sanitized = data.map((r) => ({
      ...r,
      steps: (r.steps ?? []).map((s) => {
        const { request, ...rest } = s;
        return rest;
      }),
    }));
    return { data: sanitized, total: sanitized.length };
  }

  async approveStep(id: string, dto: ApproveStepDto) {
    if (!id || id === 'undefined') throw new BadRequestException('Invalid request ID');
    const request = await this.approvalRequestsRepository.findOne(
      { id },
      { steps: true },
    );

    if (request.status !== ApprovalRequestStatus.PENDING) {
      throw new BadRequestException('Request is already processed.');
    }

    if (request.initiatorId === dto.approverId) {
      throw new ForbiddenException('Initiator cannot approve their own request.');
    }

    const config = await this.getApprovalConfig(
      request.method,
      request.path,
      request.tenantId,
    );
    if (!config) throw new NotFoundException('Approval configuration not found.');

    const currentSteps = request.steps || [];
    const approvedLevels = new Set(currentSteps.map((s) => s.level));

    let nextLevel = 1;
    while (approvedLevels.has(nextLevel)) {
      nextLevel++;
    }

    if (nextLevel > config.levels.length) {
      throw new BadRequestException('All levels already approved.');
    }

    const levelConfig = config.levels.find((l) => l.level === nextLevel);
    if (!levelConfig)
      throw new NotFoundException(`Config for level ${nextLevel} not found.`);

    if (
      levelConfig.allowedUserIds &&
      levelConfig.allowedUserIds.length > 0 &&
      !levelConfig.allowedUserIds.includes(dto.approverId)
    ) {
      throw new ForbiddenException('Approver is not allowed for this level.');
    }

    if (levelConfig.allowedRoleIds && levelConfig.allowedRoleIds.length > 0) {
      const hasAllowedRole = await this.userHasAnyRole(
        dto.approverId,
        request.tenantId,
        levelConfig.allowedRoleIds,
      );
      if (!hasAllowedRole) {
        throw new ForbiddenException('Approver is not allowed for this level.');
      }
    }

    const step = new ApprovalStep();
    step.request = request;
    step.level = nextLevel;
    step.approverId = dto.approverId;
    step.comment = dto.comment;
    step.tenantId = request.tenantId;
    await this.approvalStepsRepository.create(step);

    if (nextLevel === config.levels.length) {
      request.status = ApprovalRequestStatus.APPROVED;
      await this.approvalRequestsRepository.create(request);

      void this.executeApprovedAction(request);
    }

    const updated = await this.approvalRequestsRepository.findOne(
      { id: request.id },
      { steps: true },
    );
    const sanitized = {
      ...updated,
      steps: (updated.steps ?? []).map((s) => {
        const { request: _, ...rest } = s;
        return rest;
      }),
      message: `Approved level ${nextLevel}`,
    };
    return sanitized;
  }

  async rejectStep(id: string, dto: { approverId: string; reason?: string }) {
    if (!id || id === 'undefined') throw new BadRequestException('Invalid request ID');
    const request = await this.approvalRequestsRepository.findOne(
      { id },
      { steps: true },
    );

    if (request.status !== ApprovalRequestStatus.PENDING) {
      throw new BadRequestException('Request is already processed.');
    }

    if (request.initiatorId === dto.approverId) {
      throw new ForbiddenException('Initiator cannot reject their own request.');
    }

    const config = await this.getApprovalConfig(
      request.method,
      request.path,
      request.tenantId,
    );
    if (!config) throw new NotFoundException('Approval configuration not found.');

    const currentSteps = request.steps || [];
    const approvedLevels = new Set(currentSteps.map((s) => s.level));

    let nextLevel = 1;
    while (approvedLevels.has(nextLevel)) {
      nextLevel++;
    }

    if (nextLevel > config.levels.length) {
      throw new BadRequestException('All levels already approved.');
    }

    const levelConfig = config.levels.find((l) => l.level === nextLevel);
    if (!levelConfig)
      throw new NotFoundException(`Config for level ${nextLevel} not found.`);

    if (
      levelConfig.allowedUserIds &&
      levelConfig.allowedUserIds.length > 0 &&
      !levelConfig.allowedUserIds.includes(dto.approverId)
    ) {
      throw new ForbiddenException('Approver is not allowed for this level.');
    }

    if (levelConfig.allowedRoleIds && levelConfig.allowedRoleIds.length > 0) {
      const hasAllowedRole = await this.userHasAnyRole(
        dto.approverId,
        request.tenantId,
        levelConfig.allowedRoleIds,
      );
      if (!hasAllowedRole) {
        throw new ForbiddenException('Approver is not allowed for this level.');
      }
    }

    request.status = ApprovalRequestStatus.REJECTED;
    await this.approvalRequestsRepository.create(request);

    const step = new ApprovalStep();
    step.request = request;
    step.level = (request.steps?.length ?? 0) + 1;
    step.approverId = dto.approverId;
    step.comment = dto.reason;
    step.tenantId = request.tenantId;
    await this.approvalStepsRepository.create(step);

    const updated = await this.approvalRequestsRepository.findOne(
      { id: request.id },
      { steps: true },
    );
    const sanitized = {
      ...updated,
      steps: (updated.steps ?? []).map((s) => {
        const { request: _, ...rest } = s;
        return rest;
      }),
    };
    return sanitized;
  }

  private getRbacBaseUrl() {
    const host = this.configService.get<string>('RBAC_SERVICE_HOST') || 'localhost';
    const port = this.configService.get<number>('RBAC_SERVICE_PORT') || 3002;
    return `http://${host}:${port}/rbac`;
  }

  private async userHasAnyRole(userId: string, tenantId: string, allowedRoleIds: string[]) {
    const rbacBaseUrl = this.getRbacBaseUrl();
    const res = await axios.get<{ roleIds: string[] }>(`${rbacBaseUrl}/users/${userId}/roles`, {
      params: { tenantId },
    });
    const roleIds = res.data?.roleIds ?? [];
    return roleIds.some((id) => allowedRoleIds.includes(id));
  }

  private async executeApprovedAction(request: ApprovalRequest) {
    const gatewayUrl = this.configService.get<string>('API_GATEWAY_URL');
    if (!gatewayUrl) {
      console.error('[EXECUTION] API_GATEWAY_URL not configured');
      return;
    }

    try {
      console.log(
        `[EXECUTION] Approved: ${request.method} ${request.path} with payload:`,
        request.payload,
      );

      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
      const httpMethod = validMethods.includes(request.method.toUpperCase())
        ? request.method.toUpperCase()
        : 'POST';

      if (httpMethod !== request.method.toUpperCase()) {
        console.log(`[EXECUTION] Method "${request.method}" mapped to POST`);
      }

      await axios({
        method: httpMethod,
        url: `${gatewayUrl}${request.path}`,
        data: request.payload as Record<string, any>,
        headers: {
          'x-tenant-id': request.tenantId,
          'x-user-id': request.initiatorId,
          'x-bypass-approval': 'true',
        },
      });

      console.log(`[EXECUTION] Successfully forwarded approved request`);
    } catch (error) {
      console.error(`[EXECUTION] Failed to forward approved request`, error);
    }
  }
}
