import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { DatabaseModule } from '@app/common';
import { RbacServiceController } from './rbac-service.controller';
import { RbacServiceService } from './rbac-service.service';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { Policy } from './entities/policy.entity';
import { PermissionsRepository } from './repositories/permissions.repository';
import { RolesRepository } from './repositories/roles.repository';
import { UserRolesRepository } from './repositories/user-roles.repository';
import { PoliciesRepository } from './repositories/policies.repository';
import { AbacService } from './abac/abac.service';
import { SeedService } from './seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
      }),
      envFilePath: './apps/rbac-service/.env',
    }),
    DatabaseModule,
    TypeOrmModule.forFeature([Permission, Role, UserRole, Policy]),
  ],
  controllers: [RbacServiceController],
  providers: [
    RbacServiceService,
    PermissionsRepository,
    RolesRepository,
    UserRolesRepository,
    PoliciesRepository,
    AbacService,
    SeedService,
  ],
})
export class RbacServiceModule {}
