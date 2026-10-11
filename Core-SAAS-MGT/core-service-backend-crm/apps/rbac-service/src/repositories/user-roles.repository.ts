import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { UserRole } from '../entities/user-role.entity';

@Injectable()
export class UserRolesRepository extends AbstractRepository<UserRole> {
  protected readonly logger = new Logger(UserRolesRepository.name);

  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    entityManager: EntityManager,
  ) {
    super(userRoleRepo, entityManager);
  }

  /** Delete all role assignments for a user within a tenant */
  async deleteByUserIdAndTenant(userId: string, tenantId: string): Promise<void> {
    await this.userRoleRepo.delete({ userId, tenantId });
  }

  /** Bulk-insert user role assignments */
  async saveMany(userRoles: UserRole[]): Promise<UserRole[]> {
    return this.userRoleRepo.save(userRoles);
  }
}
