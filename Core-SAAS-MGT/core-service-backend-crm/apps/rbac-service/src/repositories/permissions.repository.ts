import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Permission } from '../entities/permission.entity';

@Injectable()
export class PermissionsRepository extends AbstractRepository<Permission> {
  protected readonly logger = new Logger(PermissionsRepository.name);

  constructor(
    @InjectRepository(Permission)
    repository: Repository<Permission>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
