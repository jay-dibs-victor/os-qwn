import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { TrialBalanceSnapshot } from './entities/trial-balance-snapshot.entity';
import { GlAccountsRepository } from './repositories/gl-accounts.repository';

@Injectable()
export class EodService {
  private readonly logger = new Logger(EodService.name);

  constructor(
    @InjectRepository(TrialBalanceSnapshot)
    private readonly snapshotRepository: Repository<TrialBalanceSnapshot>,
    private readonly glAccountsRepository: GlAccountsRepository,
    private readonly connection: Connection,
  ) {}

  async processEndOfDay(tenantId: string) {
    this.logger.log(`Starting EOD process for tenant ${tenantId}`);

    return this.connection.transaction('SERIALIZABLE', async (manager) => {
      // 1. Get all accounts for the tenant
      const accounts = await this.glAccountsRepository.find({ tenantId });

      // 2. Calculate totals and check invariants
      let totalDebit = 0;
      let totalCredit = 0;
      const balances: Record<string, number> = {};

      for (const account of accounts) {
        const balance = Number(account.balance);
        balances[account.id] = balance;

        if (balance > 0) {
          totalDebit += balance;
        } else {
          totalCredit += Math.abs(balance);
        }
      }

      // 3. Verify balance invariant (Assets = Liabilities + Equity)
      // Or simply Debit = Credit in the GL
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        this.logger.error(
          `Balance invariant failed for tenant ${tenantId}: Debit=${totalDebit}, Credit=${totalCredit}`,
        );
        throw new InternalServerErrorException(
          'Ledger is out of balance; cannot close day',
        );
      }

      // 4. Create snapshot
      const snapshot = new TrialBalanceSnapshot();
      snapshot.snapshotDate = new Date();
      snapshot.balances = balances;
      snapshot.totalDebit = totalDebit;
      snapshot.totalCredit = totalCredit;
      snapshot.tenantId = tenantId;

      await manager.save(snapshot);

      this.logger.log(
        `EOD process completed for tenant ${tenantId}. Total Balance: ${totalDebit}`,
      );
      return snapshot;
    });
  }
}
