import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountsRepository } from './repositories/accounts.repository';
import { CreateAccountDto } from './dto/account.dto';
import { Account, AccountStatus, KycTier } from './entities/account.entity';
import { NubanUtils } from '@app/common';
import axios from 'axios';
import { EntityManager } from 'typeorm';
import {
  ApplyAccountPostingDto,
  QueryAccountPostingHistoryDto,
} from './dto/account-posting.dto';
import { AccountPostingLog, AccountPostingSide } from './entities/account-posting-log.entity';
import { AccountPostingLogsRepository } from './repositories/account-posting-logs.repository';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);
  private readonly BANK_CODE = '999'; // Dummy bank code for this SaaS platform

  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly configService: ConfigService,
    private readonly accountPostingLogsRepository: AccountPostingLogsRepository,
    private readonly entityManager: EntityManager,
  ) {}

  async createAccount(dto: CreateAccountDto): Promise<Account> {
    this.logger.log(`Creating account for customer ${dto.customerId}`);

    const account = new Account();
    Object.assign(account, dto);

    // 1. Generate NUBAN
    // In a real system, this would be a atomic sequence increment
    const serial = Math.floor(Math.random() * 900000000 + 100000000).toString();
    account.accountNumber = NubanUtils.generate(this.BANK_CODE, serial);

    account.status = AccountStatus.ACTIVE;
    account.balance = 0;
    account.availableBalance = 0;

    return this.accountsRepository.create(account);
  }

  async getAccount(accountNumber: string): Promise<Account> {
    return this.accountsRepository.findByAccountNumber(accountNumber);
  }

  async getCustomerAccounts(
    customerId: string,
    tenantId: string,
  ): Promise<Account[]> {
    return this.accountsRepository.findByCustomerId(customerId, tenantId);
  }

  async updateStatus(
    accountNumber: string,
    status: AccountStatus,
  ): Promise<Account> {
    const account = await this.getAccount(accountNumber);
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    account.status = status;
    return this.accountsRepository.create(account);
  }

  async checkRestriction(
    accountNumber: string,
    type: 'DEBIT' | 'CREDIT',
  ): Promise<void> {
    const account = await this.getAccount(accountNumber);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    if (account.status === AccountStatus.CLOSED) {
      throw new BadRequestException('Account is closed');
    }

    if (
      type === 'DEBIT' &&
      (account.status === AccountStatus.PND ||
        account.status === AccountStatus.DORMANT)
    ) {
      throw new BadRequestException(
        `Debit restricted on account ${accountNumber} (Status: ${account.status})`,
      );
    }

    if (type === 'CREDIT' && account.status === AccountStatus.PNC) {
      throw new BadRequestException(
        `Credit restricted on account ${accountNumber} (Status: ${account.status})`,
      );
    }
  }

  private readonly KYC_LIMITS = {
    [KycTier.TIER_0]: { perTransaction: 0, daily: 0 },
    [KycTier.TIER_1]: { perTransaction: 50000, daily: 500000 },
    [KycTier.TIER_2]: { perTransaction: 200000, daily: 1000000 },
    [KycTier.TIER_3]: { perTransaction: 10000000, daily: 1000000000 },
  };

  async checkKycLimits(accountNumber: string, amount: number): Promise<void> {
    const account = await this.getAccount(accountNumber);
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const tier = account.kycTier || KycTier.TIER_0;
    const limit = this.KYC_LIMITS[tier];

    if (amount > limit.perTransaction) {
      throw new BadRequestException(
        `Transaction amount exceeds single limit for ${tier} (Limit: ${limit.perTransaction})`,
      );
    }

    // 2. Daily limit check
    if (limit.daily > 0) {
      try {
        const ledgerHost = this.configService.get<string>(
          'LEDGER_SERVICE_HOST',
        );
        const ledgerPort = this.configService.get<number>(
          'LEDGER_SERVICE_PORT',
        );
        const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/accounts/sub-ledger`;

        const response = await axios.get(
          `${ledgerUrl}/${accountNumber}/daily-total`,
          {
            params: { tenantId: account.tenantId },
          },
        );

        const dailyTotalSoFar = Number(response.data);
        if (dailyTotalSoFar + amount > limit.daily) {
          throw new BadRequestException(
            `Transaction amount exceeds daily limit for ${tier} (Daily Limit: ${limit.daily}, Current Total: ${dailyTotalSoFar})`,
          );
        }
      } catch (error: unknown) {
        if (error instanceof BadRequestException) throw error;
        this.logger.error('Failed to check daily limits', error);
        // We might want to fail-safe or fail-hard here.
        // For strict banking, we fail-hard.
        throw new BadRequestException('Daily limit check failed');
      }
    }
  }

  async applyPosting(accountNumber: string, dto: ApplyAccountPostingDto) {
    return this.entityManager.transaction(async (manager) => {
      const accountRepo = manager.getRepository(Account);
      const logRepo = manager.getRepository(AccountPostingLog);

      const account = await accountRepo.findOne({
        where: { accountNumber, tenantId: dto.tenantId },
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }

      const existing = await logRepo.findOne({
        where: { accountNumber, ledgerEntryId: dto.ledgerEntryId },
      });
      if (existing) {
        return {
          accountNumber,
          balance: Number(account.balance),
          availableBalance: Number(account.availableBalance),
          postingLog: existing,
        };
      }

      const amount = Number(dto.amount);
      const delta = dto.side === AccountPostingSide.CREDIT ? amount : -amount;

      account.balance = Number(account.balance) + delta;
      account.availableBalance = Number(account.availableBalance) + delta;
      await accountRepo.save(account);

      const log = new AccountPostingLog();
      log.accountNumber = accountNumber;
      log.ledgerEntryId = dto.ledgerEntryId;
      log.reference = dto.reference;
      log.side = dto.side;
      log.amount = amount;
      log.currency = dto.currency || account.currency || 'NGN';
      log.tenantId = dto.tenantId;
      log.balanceAfter = Number(account.balance);
      log.availableBalanceAfter = Number(account.availableBalance);
      const postingLog = await logRepo.save(log);

      return {
        accountNumber,
        balance: Number(account.balance),
        availableBalance: Number(account.availableBalance),
        postingLog,
      };
    });
  }

  async applyPostingsBatch(dtos: Array<{ accountNumber: string; posting: ApplyAccountPostingDto }>) {
    if (!dtos) return [];
    const results: any[] = [];
    for (const item of dtos) {
      results.push(await this.applyPosting(item.accountNumber, item.posting));
    }
    return results;
  }

  async listPostingHistory(accountNumber: string, query: QueryAccountPostingHistoryDto) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 25);

    return this.accountPostingLogsRepository.listHistory({
      accountNumber,
      tenantId: query.tenantId,
      page,
      pageSize,
      reference: query.reference,
      side: query.side,
      fromDate: query.fromDate,
      toDate: query.toDate,
    });
  }

  async reconcileBalance(accountNumber: string, tenantId: string) {
    const account = await this.accountsRepository.findOneNullable({
      accountNumber,
      tenantId,
    });
    if (!account) {
      throw new BadRequestException('Account not found');
    }

    const ledgerHost = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const ledgerPort = this.configService.get<number>('LEDGER_SERVICE_PORT');
    const ledgerUrl = `http://${ledgerHost}:${ledgerPort}/ledger/accounts/sub-ledger/${accountNumber}/balance`;

    let ledgerBalance: number;
    try {
      const response = await axios.get(ledgerUrl, { params: { tenantId } });
      ledgerBalance = Number(response.data);
    } catch (error: unknown) {
      this.logger.error(`Failed to fetch ledger balance for ${accountNumber}`, error);
      const message = axios.isAxiosError(error)
        ? `Ledger service unreachable: ${error.message}`
        : 'Ledger balance check failed';
      throw new BadRequestException(message);
    }

    const storedBalance = Number(account.balance);
    const difference = storedBalance - ledgerBalance;

    return {
      accountNumber,
      tenantId,
      storedBalance,
      availableBalance: Number(account.availableBalance),
      ledgerBalance,
      difference,
    };
  }
}
