import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { ApprovalRequest } from '../entities/approval-request.entity';

@Injectable()
export class ApprovalRequestsRepository extends AbstractRepository<ApprovalRequest> {
  protected readonly logger = new Logger(ApprovalRequestsRepository.name);

  constructor(
    @InjectRepository(ApprovalRequest)
    repository: Repository<ApprovalRequest>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
