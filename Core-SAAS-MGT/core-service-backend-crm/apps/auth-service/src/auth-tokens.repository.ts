import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { AuthToken } from './entities/auth-token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class AuthTokensRepository extends AbstractRepository<AuthToken> {
  protected readonly logger = new Logger(AuthTokensRepository.name);

  constructor(
    @InjectRepository(AuthToken)
    tokenRepository: Repository<AuthToken>,
    entityManager: EntityManager,
  ) {
    super(tokenRepository, entityManager);
  }
}
