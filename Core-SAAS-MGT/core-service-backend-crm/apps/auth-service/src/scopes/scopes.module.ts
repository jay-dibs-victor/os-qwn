import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopeManagementService } from './scope-management.service';
import { ScopeManagementController } from './scope-management.controller';
import { Scope } from '../entities/scope.entity';
import { TenantScope } from '../entities/tenant-scope.entity';
import { UserScope } from '../entities/user-scope.entity';
import { Role } from '../entities/role.entity';
import { User } from '../entities/user.entity';
import { Tenant } from '../entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Scope,
      TenantScope,
      UserScope,
      Role,
      User,
      Tenant,
    ]),
  ],
  providers: [ScopeManagementService],
  controllers: [ScopeManagementController],
  exports: [ScopeManagementService],
})
export class ScopesModule {}
