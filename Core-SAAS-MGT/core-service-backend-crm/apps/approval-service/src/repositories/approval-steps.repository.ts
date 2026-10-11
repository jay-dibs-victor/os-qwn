import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { ApprovalStep } from '../entities/approval-step.entity';

@Injectable()
export class ApprovalStepsRepository extends AbstractRepository<ApprovalStep> {
  protected readonly logger = new Logger(ApprovalStepsRepository.name);

  constructor(
    @InjectRepository(ApprovalStep)
    repository: Repository<ApprovalStep>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
