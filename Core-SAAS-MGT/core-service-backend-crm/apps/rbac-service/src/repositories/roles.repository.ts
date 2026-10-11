import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Role } from '../entities/role.entity';

@Injectable()
export class RolesRepository extends AbstractRepository<Role> {
  protected readonly logger = new Logger(RolesRepository.name);

  constructor(
    @InjectRepository(Role)
    repository: Repository<Role>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
