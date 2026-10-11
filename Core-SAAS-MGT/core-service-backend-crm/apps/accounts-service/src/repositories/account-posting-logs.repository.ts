import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { AccountPostingLog } from '../entities/account-posting-log.entity';

@Injectable()
export class AccountPostingLogsRepository extends AbstractRepository<AccountPostingLog> {
  protected readonly logger = new Logger(AccountPostingLogsRepository.name);

  constructor(
    @InjectRepository(AccountPostingLog)
    repository: Repository<AccountPostingLog>,
    entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async findByAccountAndLedgerEntry(accountNumber: string, ledgerEntryId: string) {
    return this.findOneNullable({ accountNumber, ledgerEntryId });
  }

  async listHistory(params: {
    accountNumber: string;
    tenantId: string;
    page: number;
    pageSize: number;
    reference?: string;
    side?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    const { accountNumber, tenantId, page, pageSize, reference, side, fromDate, toDate } =
      params;

    const qb = this.repository
      .createQueryBuilder('log')
      .where('log.accountNumber = :accountNumber', { accountNumber })
      .andWhere('log.tenantId = :tenantId', { tenantId });

    if (reference) {
      qb.andWhere('log.reference ILIKE :reference', { reference: `%${reference}%` });
    }
    if (side) {
      qb.andWhere('log.side = :side', { side });
    }
    if (fromDate) {
      qb.andWhere('log.createdAt >= :fromDate', { fromDate: new Date(fromDate) });
    }
    if (toDate) {
      qb.andWhere('log.createdAt <= :toDate', { toDate: new Date(toDate) });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      data,
      page,
      pageSize,
      totalPages,
      totalItems,
      hasMore: page < totalPages,
    };
  }
}
