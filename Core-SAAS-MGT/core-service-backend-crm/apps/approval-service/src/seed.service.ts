import { Injectable, OnModuleInit } from '@nestjs/common';
import { ApprovalConfigsRepository } from './repositories/approval-configs.repository';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly approvalConfigsRepository: ApprovalConfigsRepository,
  ) {}

  async onModuleInit() {
    await this.seedConfigs();
  }

  private async seedConfigs() {
    const defaultConfigs = [
      {
        method: 'POST',
        path: '/batch/execute',
        isEnabled: true,
        requiredPermission: 'batch.execute',
        levels: [
          {
            level: 1,
            allowedRoleIds: [], // Anyone with the right role can approve
          },
        ],
        tenantId: 'SYSTEM',
      },
      {
        method: 'POST',
        path: '/reversal',
        isEnabled: true,
        requiredPermission: 'reversal.create',
        levels: [
          {
            level: 1,
            allowedRoleIds: [],
          },
        ],
        tenantId: 'SYSTEM',
      },
    ];

    for (const config of defaultConfigs) {
      const exists = await this.approvalConfigsRepository.findOneNullable({
        method: config.method,
        path: config.path,
        tenantId: config.tenantId,
      });

      if (!exists) {
        await this.approvalConfigsRepository.create(config as any);
      }
    }
  }
}
