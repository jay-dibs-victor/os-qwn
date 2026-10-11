import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { CoinWallet, EntityType } from './entities/coin-wallet.entity';
import { CoinTransaction, CoinTransactionType } from './entities/coin-transaction.entity';
import { SiteWideFareConfigService } from './services/site-wide-fare-config.service';

@Injectable()
export class CoinRewardService {
  private readonly logger = new Logger(CoinRewardService.name);

  constructor(
    @InjectRepository(CoinWallet)
    private readonly walletRepo: Repository<CoinWallet>,
    @InjectRepository(CoinTransaction)
    private readonly txnRepo: Repository<CoinTransaction>,
    private readonly fareConfigService: SiteWideFareConfigService,
  ) {}

  async awardTripCoins(
    tripId: string,
    tenantId: string,
    riderCustomerId: string,
    driverCustomerId: string,
  ): Promise<{ riderCoins: number; driverCoins: number; tenantCoins: number }> {
    const enabled = await this.fareConfigService.getValue('COIN_REWARD_ENABLED', 'true');
    if (enabled?.toLowerCase() !== 'true') {
      this.logger.log('Coin rewards disabled, skipping');
      return { riderCoins: 0, driverCoins: 0, tenantCoins: 0 };
    }

    const riderAmount = Number(await this.fareConfigService.getValue('RIDER_COIN_REWARD_PER_TRIP') || '10');
    const driverAmount = Number(await this.fareConfigService.getValue('DRIVER_COIN_REWARD_PER_TRIP') || '25');
    const tenantAmount = Number(await this.fareConfigService.getValue('TENANT_COIN_REWARD_PER_TRIP') || '5');

    const reference = `COIN_TRIP_${tripId}_${uuidv4().slice(0, 8)}`;

    await this.creditWallet(riderCustomerId, EntityType.RIDER, tenantId, riderAmount, reference, `Trip coin reward for ${tripId}`, tripId);
    await this.creditWallet(driverCustomerId, EntityType.DRIVER, tenantId, driverAmount, reference, `Trip coin reward for ${tripId}`, tripId);
    await this.creditWallet(tenantId, EntityType.TENANT, tenantId, tenantAmount, reference, `Trip coin reward for ${tripId}`, tripId);

    this.logger.log(`Awarded coins for trip ${tripId}: rider=${riderAmount}, driver=${driverAmount}, tenant=${tenantAmount}`);
    return { riderCoins: riderAmount, driverCoins: driverAmount, tenantCoins: tenantAmount };
  }

  private async getOrCreateWallet(
    entityId: string,
    entityType: EntityType,
    tenantId: string,
  ): Promise<CoinWallet> {
    let wallet = await this.walletRepo.findOne({
      where: { entityId, entityType },
    });
    if (!wallet) {
      wallet = this.walletRepo.create({ entityId, entityType, balance: 0, tenantId });
      wallet = await this.walletRepo.save(wallet);
    }
    return wallet;
  }

  private async creditWallet(
    entityId: string,
    entityType: EntityType,
    tenantId: string,
    amount: number,
    reference: string,
    description: string,
    tripId?: string,
  ): Promise<void> {
    const wallet = await this.getOrCreateWallet(entityId, entityType, tenantId);
    wallet.balance = Number(wallet.balance) + amount;
    await this.walletRepo.save(wallet);

    const txnRecord = this.txnRepo.create({
      walletId: wallet.id,
      amount,
      type: CoinTransactionType.CREDIT,
      reference,
      description,
      tripId,
      tenantId,
    });
    await this.txnRepo.save(txnRecord);
  }

  async getCoinBalance(entityId: string, entityType: EntityType): Promise<CoinWallet | null> {
    return this.walletRepo.findOne({ where: { entityId, entityType } });
  }

  async listCoinTransactions(
    walletId: string,
    page = 0,
    pageSize = 20,
  ): Promise<{ data: CoinTransaction[]; page: number; pageSize: number; totalItems: number; totalPages: number }> {
    const [data, totalItems] = await this.txnRepo.findAndCount({
      where: { walletId },
      order: { createdAt: 'DESC' },
      skip: page * pageSize,
      take: pageSize,
    });
    return { data, page, pageSize, totalItems, totalPages: Math.ceil(totalItems / pageSize) };
  }

  async listAllWallets(tenantId: string): Promise<CoinWallet[]> {
    return this.walletRepo.find({ where: { tenantId }, order: { entityType: 'ASC', entityId: 'ASC' } });
  }

  async getWalletByEntity(entityId: string, entityType: EntityType): Promise<CoinWallet | null> {
    return this.walletRepo.findOne({ where: { entityId, entityType } });
  }
}
