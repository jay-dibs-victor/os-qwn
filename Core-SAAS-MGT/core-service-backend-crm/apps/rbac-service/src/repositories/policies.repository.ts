import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Policy } from '../entities/policy.entity';

@Injectable()
export class PoliciesRepository extends AbstractRepository<Policy> {
  protected readonly logger = new Logger(PoliciesRepository.name);

  constructor(
    @InjectRepository(Policy)
    repository: Repository<Policy>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
