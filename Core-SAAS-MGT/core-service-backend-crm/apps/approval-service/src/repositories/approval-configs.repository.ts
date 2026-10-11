import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { ApprovalConfig } from '../entities/approval-config.entity';

@Injectable()
export class ApprovalConfigsRepository extends AbstractRepository<ApprovalConfig> {
  protected readonly logger = new Logger(ApprovalConfigsRepository.name);

  constructor(
    @InjectRepository(ApprovalConfig)
    repository: Repository<ApprovalConfig>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
