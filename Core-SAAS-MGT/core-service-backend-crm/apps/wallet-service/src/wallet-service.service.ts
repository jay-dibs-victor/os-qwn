import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { WalletTransaction, WalletTransactionStatus, WalletTransactionType } from './entities/wallet-transaction.entity';
import {
  QCoinExchangeDirection,
  QCoinExchangeDto,
  QueryWalletTransactionHistoryDto,
  WalletFundingDto,
  WalletTransferDto,
  WalletWithdrawalDto,
} from './dto/wallet.dto';
import { DriverDebtService } from './services/driver-debt.service';
import { SettlementMethod } from './dto/driver-debt.dto';

enum EntrySide {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

@Injectable()
export class WalletServiceService {
  private readonly logger = new Logger(WalletServiceService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionsRepository: Repository<WalletTransaction>,
    private readonly driverDebtService: DriverDebtService,
  ) {}

  private get accountsBaseUrl() {
    const host = this.configService.get<string>('ACCOUNTS_SERVICE_HOST');
    const port = this.configService.get<number>('ACCOUNTS_SERVICE_PORT');
    return `http://${host}:${port}/accounts`;
  }

  private get ledgerBaseUrl() {
    const host = this.configService.get<string>('LEDGER_SERVICE_HOST');
    const port = this.configService.get<number>('LEDGER_SERVICE_PORT');
    return `http://${host}:${port}/ledger`;
  }

  private async getAccount(accountNumber: string) {
    try {
      const { data } = await axios.get(`${this.accountsBaseUrl}/${accountNumber}`);
      return data as { accountNumber: string; tenantId: string; currency: string; glAccountId: string | null; customerId: string };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? `Accounts service error: ${JSON.stringify(error.response?.data || error.message)}`
        : String(error);
      throw new BadRequestException(message);
    }
  }

  private async getCustomerAccounts(customerId: string, tenantId: string) {
    try {
      const { data } = await axios.get(`${this.accountsBaseUrl}/customer/${customerId}`, { params: { tenantId } });
      return data as Array<{ accountNumber: string; tenantId: string; currency: string; glAccountId: string | null }>;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? `Accounts service error: ${JSON.stringify(error.response?.data || error.message)}`
        : String(error);
      throw new BadRequestException(message);
    }
  }

  private async createCustomerAccount(dto: {
    name: string;
    customerId: string;
    tenantId: string;
    currency: string;
    glAccountId: string;
  }) {
    try {
      const { data } = await axios.post(`${this.accountsBaseUrl}`, {
        name: dto.name,
        type: 'SAVINGS',
        currency: dto.currency,
        customerId: dto.customerId,
        tenantId: dto.tenantId,
        glAccountId: dto.glAccountId,
      });
      return data as { accountNumber: string; tenantId: string; currency: string; glAccountId: string | null };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? `Accounts service error: ${JSON.stringify(error.response?.data || error.message)}`
        : String(error);
      throw new BadRequestException(message);
    }
  }

  private async postLedgerTransaction(payload: any) {
    try {
      const { data } = await axios.post(`${this.ledgerBaseUrl}/posting/transaction`, payload);
      return data as { id: string; reference: string };
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? `Ledger service error: ${JSON.stringify(error.response?.data || error.message)}`
        : String(error);
      throw new BadRequestException(message);
    }
  }

  private async resolveCashGlAccountId(tenantId: string): Promise<string> {
    const configured = this.configService.get<string>('CASH_GL_ACCOUNT_ID');
    if (configured) return configured;

    try {
      const { data } = await axios.get(`${this.ledgerBaseUrl}/accounts`, {
        params: { tenantId },
      });
      const accounts: Array<{ id: string; code: string; name: string; type: string }> = data.data || data;
      const cash = accounts.find(
        (a) => a.code?.toLowerCase().includes('cash') || a.name?.toLowerCase().includes('cash'),
      );
      if (cash) return cash.id;
    } catch {
      this.logger.warn('Could not auto-resolve CASH_GL_ACCOUNT_ID from ledger service');
    }

    throw new BadRequestException(
      'CASH_GL_ACCOUNT_ID not configured and could not be auto-resolved. Set CASH_GL_ACCOUNT_ID in environment.',
    );
  }

  async walletTransfer(dto: WalletTransferDto) {
    if (dto.fromAccountNumber === dto.toAccountNumber) {
      throw new BadRequestException('fromAccountNumber and toAccountNumber must be different');
    }

    const from = await this.getAccount(dto.fromAccountNumber);
    const to = await this.getAccount(dto.toAccountNumber);

    if (from.tenantId !== dto.tenantId || to.tenantId !== dto.tenantId) {
      throw new BadRequestException('Tenant mismatch');
    }
    if (!from.glAccountId || !to.glAccountId) {
      throw new BadRequestException('Accounts must be linked to a control GL account');
    }

    const reference = `WLT-TRF-${uuidv4().slice(0, 8)}`;
    const tx = this.walletTransactionsRepository.create({
      tenantId: dto.tenantId,
      type: WalletTransactionType.TRANSFER,
      status: WalletTransactionStatus.PENDING,
      reference,
      fromAccountNumber: dto.fromAccountNumber,
      toAccountNumber: dto.toAccountNumber,
      amount: Number(dto.amount),
      currency: dto.currency || from.currency || 'NGN',
      meta: { description: dto.description || null } as any,
    });
    await this.walletTransactionsRepository.save(tx);

    try {
      const journal = await this.postLedgerTransaction({
        reference,
        description: dto.description || `Wallet Transfer: ${reference}`,
        postingDate: new Date(),
        currency: tx.currency,
        tenantId: dto.tenantId,
        entries: [
          {
            glAccountId: from.glAccountId,
            amount: Number(dto.amount),
            side: EntrySide.DEBIT,
            subLedgerId: from.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
          {
            glAccountId: to.glAccountId,
            amount: Number(dto.amount),
            side: EntrySide.CREDIT,
            subLedgerId: to.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
        ],
      });

      tx.status = WalletTransactionStatus.POSTED;
      tx.journalEntryId = journal.id;
      await this.walletTransactionsRepository.save(tx);
      return tx;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : String(error);
      tx.status = WalletTransactionStatus.FAILED;
      tx.failureReason = message;
      await this.walletTransactionsRepository.save(tx);
      throw new BadRequestException(message);
    }
  }

  async walletFunding(dto: WalletFundingDto) {
    const account = await this.getAccount(dto.accountNumber);
    if (account.tenantId !== dto.tenantId) {
      throw new BadRequestException('Tenant mismatch');
    }
    if (!account.glAccountId) {
      throw new BadRequestException('Account must be linked to a control GL account');
    }

    const cashGlAccountId = await this.resolveCashGlAccountId(dto.tenantId);

    const reference = `WLT-FUND-${uuidv4().slice(0, 8)}`;
    const tx = this.walletTransactionsRepository.create({
      tenantId: dto.tenantId,
      type: WalletTransactionType.FUNDING,
      status: WalletTransactionStatus.PENDING,
      reference,
      toAccountNumber: dto.accountNumber,
      amount: Number(dto.amount),
      currency: dto.currency || account.currency || 'NGN',
      meta: { description: dto.description || null } as any,
    });
    await this.walletTransactionsRepository.save(tx);

    try {
      const journal = await this.postLedgerTransaction({
        reference,
        description: dto.description || `Wallet Funding: ${reference}`,
        postingDate: new Date(),
        currency: tx.currency,
        tenantId: dto.tenantId,
        entries: [
          { glAccountId: cashGlAccountId, amount: Number(dto.amount), side: EntrySide.DEBIT },
          {
            glAccountId: account.glAccountId,
            amount: Number(dto.amount),
            side: EntrySide.CREDIT,
            subLedgerId: account.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
        ],
      });

      tx.status = WalletTransactionStatus.POSTED;
      tx.journalEntryId = journal.id;
      await this.walletTransactionsRepository.save(tx);

      // Trigger automatic debt settlement if the account belongs to a driver with outstanding debt
      try {
        const { allowed, debt } = await this.driverDebtService.checkDebtStatus(dto.tenantId, account.customerId);
        if (debt && Number(debt.outstandingBalance) > 0) {
          const outstanding = Number(debt.outstandingBalance);
          const fundingAmount = Number(dto.amount);
          const settleAmount = Math.min(fundingAmount, outstanding);

          if (settleAmount > 0) {
            this.logger.log(`Auto-settling debt of ${settleAmount} NGN for driver customer ${account.customerId} after wallet funding`);
            await this.driverDebtService.settleDebt({
              tenantId: dto.tenantId,
              driverCustomerId: account.customerId,
              amount: settleAmount,
              method: SettlementMethod.EARNING_OFFSET, // EARNING_OFFSET resolves to DEBT_SETTLEMENT which debits wallet GL 2301
              description: `Auto-settlement of cash debt from wallet funding reference ${reference}`,
            });
          }
        }
      } catch (debtErr) {
        this.logger.error(`Auto-debt-settlement failed after funding for driver customer ${account.customerId}: ${debtErr}`);
      }

      return tx;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : String(error);
      tx.status = WalletTransactionStatus.FAILED;
      tx.failureReason = message;
      await this.walletTransactionsRepository.save(tx);
      throw new BadRequestException(message);
    }
  }

  async walletWithdrawal(dto: WalletWithdrawalDto) {
    const account = await this.getAccount(dto.accountNumber);
    if (account.tenantId !== dto.tenantId) {
      throw new BadRequestException('Tenant mismatch');
    }
    if (!account.glAccountId) {
      throw new BadRequestException('Account must be linked to a control GL account');
    }

    const cashGlAccountId = await this.resolveCashGlAccountId(dto.tenantId);

    const reference = `WLT-WD-${uuidv4().slice(0, 8)}`;
    const tx = this.walletTransactionsRepository.create({
      tenantId: dto.tenantId,
      type: WalletTransactionType.WITHDRAWAL,
      status: WalletTransactionStatus.PENDING,
      reference,
      fromAccountNumber: dto.accountNumber,
      amount: Number(dto.amount),
      currency: dto.currency || account.currency || 'NGN',
      meta: { description: dto.description || null } as any,
    });
    await this.walletTransactionsRepository.save(tx);

    try {
      const journal = await this.postLedgerTransaction({
        reference,
        description: dto.description || `Wallet Withdrawal: ${reference}`,
        postingDate: new Date(),
        currency: tx.currency,
        tenantId: dto.tenantId,
        entries: [
          {
            glAccountId: account.glAccountId,
            amount: Number(dto.amount),
            side: EntrySide.DEBIT,
            subLedgerId: account.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
          { glAccountId: cashGlAccountId, amount: Number(dto.amount), side: EntrySide.CREDIT },
        ],
      });

      tx.status = WalletTransactionStatus.POSTED;
      tx.journalEntryId = journal.id;
      await this.walletTransactionsRepository.save(tx);
      return tx;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : String(error);
      tx.status = WalletTransactionStatus.FAILED;
      tx.failureReason = message;
      await this.walletTransactionsRepository.save(tx);
      throw new BadRequestException(message);
    }
  }

  async qcoinExchange(dto: QCoinExchangeDto) {
    const fiatCurrency = dto.fiatCurrency || 'NGN';
    const qcoinCurrency = dto.qcoinCurrency || 'QCN';

    const accounts = await this.getCustomerAccounts(dto.customerId, dto.tenantId);
    const fiatAccount = accounts.find((a) => a.currency === fiatCurrency);
    let qcoinAccount = accounts.find((a) => a.currency === qcoinCurrency);

    const qcoinControlGl = this.configService.get<string>('QCOIN_DEPOSITS_GL_ACCOUNT_ID');
    if (!qcoinAccount) {
      if (!qcoinControlGl) {
        throw new BadRequestException('QCOIN_DEPOSITS_GL_ACCOUNT_ID not configured');
      }
      qcoinAccount = await this.createCustomerAccount({
        name: `QCoin Wallet (${qcoinCurrency})`,
        customerId: dto.customerId,
        tenantId: dto.tenantId,
        currency: qcoinCurrency,
        glAccountId: qcoinControlGl,
      });
    }

    if (!fiatAccount) {
      throw new BadRequestException(`Customer has no fiat wallet account for ${fiatCurrency}`);
    }
    if (!fiatAccount.glAccountId || !qcoinAccount.glAccountId) {
      throw new BadRequestException('Accounts must be linked to a control GL account');
    }

    const reference = `QCOIN-EX-${uuidv4().slice(0, 8)}`;
    const tx = this.walletTransactionsRepository.create({
      tenantId: dto.tenantId,
      type: WalletTransactionType.QCOIN_EXCHANGE,
      status: WalletTransactionStatus.PENDING,
      reference,
      fromAccountNumber: dto.direction === QCoinExchangeDirection.BUY_QCOIN ? fiatAccount.accountNumber : qcoinAccount.accountNumber,
      toAccountNumber: dto.direction === QCoinExchangeDirection.BUY_QCOIN ? qcoinAccount.accountNumber : fiatAccount.accountNumber,
      amount: Number(dto.fiatAmount),
      currency: fiatCurrency,
      meta: {
        direction: dto.direction,
        fiatAmount: Number(dto.fiatAmount),
        qcoinAmount: Number(dto.qcoinAmount),
        fiatCurrency,
        qcoinCurrency,
        description: dto.description || null,
      } as any,
    });
    await this.walletTransactionsRepository.save(tx);

    const fiatAmount = Number(dto.fiatAmount);

    const source = dto.direction === QCoinExchangeDirection.BUY_QCOIN ? fiatAccount : qcoinAccount;
    const destination = dto.direction === QCoinExchangeDirection.BUY_QCOIN ? qcoinAccount : fiatAccount;

    try {
      const journal = await this.postLedgerTransaction({
        reference,
        description: dto.description || `QCoin Exchange: ${reference}`,
        postingDate: new Date(),
        currency: fiatCurrency,
        tenantId: dto.tenantId,
        entries: [
          {
            glAccountId: source.glAccountId,
            amount: fiatAmount,
            side: EntrySide.DEBIT,
            subLedgerId: source.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
          {
            glAccountId: destination.glAccountId,
            amount: fiatAmount,
            side: EntrySide.CREDIT,
            subLedgerId: destination.accountNumber,
            subLedgerType: 'CUSTOMER_ACCOUNT',
          },
        ],
      });

      tx.status = WalletTransactionStatus.POSTED;
      tx.journalEntryId = journal.id;
      await this.walletTransactionsRepository.save(tx);
      return tx;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? JSON.stringify(error.response?.data || error.message)
        : String(error);
      tx.status = WalletTransactionStatus.FAILED;
      tx.failureReason = message;
      await this.walletTransactionsRepository.save(tx);
      throw new BadRequestException(message);
    }
  }

  async listHistory(query: QueryWalletTransactionHistoryDto) {
    const page = Number(query.page || 1);
    const pageSize = Number(query.pageSize || 25);

    const qb = this.walletTransactionsRepository
      .createQueryBuilder('tx')
      .where('tx.tenantId = :tenantId', { tenantId: query.tenantId });

    if (query.type) {
      qb.andWhere('tx.type = :type', { type: query.type });
    }
    if (query.status) {
      qb.andWhere('tx.status = :status', { status: query.status });
    }
    if (query.accountNumber) {
      qb.andWhere('(tx.fromAccountNumber = :acc OR tx.toAccountNumber = :acc)', { acc: query.accountNumber });
    }
    if (query.reference) {
      qb.andWhere('tx.reference ILIKE :reference', { reference: `%${query.reference}%` });
    }
    if (query.fromDate) {
      qb.andWhere('tx.createdAt >= :fromDate', { fromDate: new Date(query.fromDate) });
    }
    if (query.toDate) {
      qb.andWhere('tx.createdAt <= :toDate', { toDate: new Date(query.toDate) });
    }

    qb.orderBy('tx.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return { data, page, pageSize, totalPages, totalItems, hasMore: page < totalPages };
  }
}
