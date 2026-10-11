import { Injectable, OnModuleInit } from '@nestjs/common';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolesRepository } from './repositories/roles.repository';
import { Permission } from './entities/permission.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly permissionsRepository: PermissionsRepository,
    private readonly rolesRepository: RolesRepository,
  ) {}

  async onModuleInit() {
    const permissions = await this.seedPermissions();
    await this.seedRoles(permissions);
  }

  private async seedPermissions() {
    const defaultPermissions = [
      {
        slug: 'reversal.create',
        name: 'Create Reversal',
        description: 'Allows creating a transaction reversal',
      },
      {
        slug: 'batch.create',
        name: 'Create Batch',
        description: 'Allows creating a new payment batch',
      },
      {
        slug: 'batch.view',
        name: 'View Batch',
        description: 'Allows viewing batch details',
      },
      {
        slug: 'batch.execute',
        name: 'Execute Batch',
        description: 'Allows executing a batch job',
      },
      {
        slug: 'batch.retry',
        name: 'Retry Batch',
        description: 'Allows retrying failed batch items',
      },
    ];

    const seededPermissions: any[] = [];
    for (const p of defaultPermissions) {
      let permission = await this.permissionsRepository.findOneNullable({
        slug: p.slug,
      });
      if (!permission) {
        permission = await this.permissionsRepository.create({
          ...p,
          tenantId: 'SYSTEM',
        } as any);
      }
      seededPermissions.push(permission);
    }
    return seededPermissions as Permission[];
  }

  private async seedRoles(permissions: Permission[]) {
    const adminRole = await this.rolesRepository.findOneNullable({
      name: 'ADMIN',
      tenantId: 'SYSTEM',
    });
    if (!adminRole) {
      await this.rolesRepository.create({
        name: 'ADMIN',
        description: 'System Administrator with full access',
        tenantId: 'SYSTEM',
        permissions: permissions as any,
      } as any);
    }

    const reversalOfficerRole = await this.rolesRepository.findOneNullable({
      name: 'REVERSAL_OFFICER',
      tenantId: 'SYSTEM',
    });
    if (!reversalOfficerRole) {
      const reversalCreatePerm = permissions.find((p) => p.slug === 'reversal.create');
      await this.rolesRepository.create({
        name: 'REVERSAL_OFFICER',
        description: 'Reversal Officer with reversal creation permission',
        tenantId: 'SYSTEM',
        permissions: reversalCreatePerm ? [reversalCreatePerm] : [],
      } as any);
    }
  }
}
