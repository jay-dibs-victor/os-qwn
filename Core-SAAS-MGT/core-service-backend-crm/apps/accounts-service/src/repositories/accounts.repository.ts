import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Account } from '../entities/account.entity';

@Injectable()
export class AccountsRepository extends AbstractRepository<Account> {
  protected readonly logger = new Logger(AccountsRepository.name);

  constructor(
    @InjectRepository(Account)
    protected readonly accountRepository: Repository<Account>,
    protected readonly entityManager: EntityManager,
  ) {
    super(accountRepository, entityManager);
  }

  async findByAccountNumber(accountNumber: string) {
    return this.findOne({ accountNumber });
  }

  async findByCustomerId(customerId: string, tenantId: string) {
    return this.find({ customerId, tenantId });
  }
}
