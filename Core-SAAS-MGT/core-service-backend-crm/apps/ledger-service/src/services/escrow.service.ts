import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EscrowWallet, EscrowWalletStatus, EscrowCycleType } from '../entities/escrow-wallet.entity';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @InjectRepository(EscrowWallet)
    private readonly escrowRepo: Repository<EscrowWallet>,
  ) {}

  async createWallet(dto: {
    tenantId: string;
    partnerId: string;
    cycleType?: EscrowCycleType;
    reference?: string;
  }): Promise<EscrowWallet> {
    const existing = await this.escrowRepo.findOne({
      where: { tenantId: dto.tenantId, partnerId: dto.partnerId, status: EscrowWalletStatus.ACTIVE },
    });
    if (existing) {
      return existing;
    }

    const wallet = this.escrowRepo.create({
      tenantId: dto.tenantId,
      partnerId: dto.partnerId,
      cycleType: dto.cycleType || EscrowCycleType.DAILY,
      currentBalance: 0,
      lockedBalance: 0,
      releasedBalance: 0,
      reference: dto.reference,
      status: EscrowWalletStatus.ACTIVE,
      cycleStartDate: new Date(),
      auditTrail: [{ event: 'WALLET_CREATED', timestamp: new Date().toISOString(), actor: 'system', details: dto }],
    });
    return this.escrowRepo.save(wallet);
  }

  async lockFunds(dto: {
    tenantId: string;
    walletId: string;
    amount: number;
    reference?: string;
    actor?: string;
  }): Promise<EscrowWallet> {
    const wallet = await this.escrowRepo.findOne({ where: { id: dto.walletId, tenantId: dto.tenantId } });
    if (!wallet) throw new NotFoundException('Escrow wallet not found');
    if (wallet.status !== EscrowWalletStatus.ACTIVE && wallet.status !== EscrowWalletStatus.LOCKED) {
      throw new BadRequestException('Wallet is not active');
    }
    if (wallet.currentBalance < dto.amount) {
      throw new BadRequestException(`Insufficient balance: ${wallet.currentBalance} < ${dto.amount}`);
    }

    wallet.currentBalance = Number(wallet.currentBalance) - Number(dto.amount);
    wallet.lockedBalance = Number(wallet.lockedBalance) + Number(dto.amount);
    wallet.status = EscrowWalletStatus.LOCKED;
    wallet.auditTrail = [
      ...(wallet.auditTrail || []),
      {
        event: 'FUNDS_LOCKED',
        timestamp: new Date().toISOString(),
        actor: dto.actor || 'system',
        details: { amount: dto.amount, reference: dto.reference },
      },
    ];
    return this.escrowRepo.save(wallet);
  }

  async releaseFunds(dto: {
    tenantId: string;
    walletId: string;
    amount: number;
    reference?: string;
    actor?: string;
  }): Promise<EscrowWallet> {
    const wallet = await this.escrowRepo.findOne({ where: { id: dto.walletId, tenantId: dto.tenantId } });
    if (!wallet) throw new NotFoundException('Escrow wallet not found');
    if (wallet.lockedBalance < dto.amount) {
      throw new BadRequestException(`Insufficient locked balance: ${wallet.lockedBalance} < ${dto.amount}`);
    }

    wallet.lockedBalance = Number(wallet.lockedBalance) - Number(dto.amount);
    wallet.releasedBalance = Number(wallet.releasedBalance) + Number(dto.amount);
    wallet.auditTrail = [
      ...(wallet.auditTrail || []),
      {
        event: 'FUNDS_RELEASED',
        timestamp: new Date().toISOString(),
        actor: dto.actor || 'system',
        details: { amount: dto.amount, reference: dto.reference },
      },
    ];

    if (wallet.lockedBalance === 0) {
      wallet.status = EscrowWalletStatus.RELEASED;
      wallet.cycleEndDate = new Date();
      wallet.cycleHistory = [
        ...(wallet.cycleHistory || []),
        {
          cycleStart: wallet.cycleStartDate?.toISOString() || '',
          cycleEnd: wallet.cycleEndDate?.toISOString() || '',
          amountLocked: Number(dto.amount),
          amountReleased: Number(dto.amount),
          status: 'COMPLETED',
        },
      ];
      wallet.cycleStartDate = new Date();
    }

    return this.escrowRepo.save(wallet);
  }

  async getWallet(tenantId: string, partnerId: string): Promise<EscrowWallet | null> {
    return this.escrowRepo.findOne({
      where: { tenantId, partnerId, status: EscrowWalletStatus.ACTIVE },
    });
  }

  async getAllWallets(tenantId: string): Promise<EscrowWallet[]> {
    return this.escrowRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async getWalletById(tenantId: string, walletId: string): Promise<EscrowWallet> {
    const wallet = await this.escrowRepo.findOne({ where: { id: walletId, tenantId } });
    if (!wallet) throw new NotFoundException('Escrow wallet not found');
    return wallet;
  }

  async adminOverride(dto: {
    tenantId: string;
    walletId: string;
    amount: number;
    reason: string;
    actor: string;
  }): Promise<EscrowWallet> {
    const wallet = await this.escrowRepo.findOne({ where: { id: dto.walletId, tenantId: dto.tenantId } });
    if (!wallet) throw new NotFoundException('Escrow wallet not found');

    wallet.lockedBalance = Math.max(0, Number(wallet.lockedBalance) - Number(dto.amount));
    wallet.releasedBalance = Number(wallet.releasedBalance) + Number(dto.amount);
    wallet.status = EscrowWalletStatus.RELEASED;
    wallet.auditTrail = [
      ...(wallet.auditTrail || []),
      {
        event: 'ADMIN_OVERRIDE',
        timestamp: new Date().toISOString(),
        actor: dto.actor,
        details: { amount: dto.amount, reason: dto.reason },
      },
    ];
    return this.escrowRepo.save(wallet);
  }

  async getBalanceSummary(tenantId: string): Promise<{
    totalCurrent: number;
    totalLocked: number;
    totalReleased: number;
    activeWallets: number;
  }> {
    const wallets = await this.escrowRepo.find({ where: { tenantId } });
    return {
      totalCurrent: wallets.reduce((s, w) => s + Number(w.currentBalance), 0),
      totalLocked: wallets.reduce((s, w) => s + Number(w.lockedBalance), 0),
      totalReleased: wallets.reduce((s, w) => s + Number(w.releasedBalance), 0),
      activeWallets: wallets.filter(w => w.status === EscrowWalletStatus.ACTIVE || w.status === EscrowWalletStatus.LOCKED).length,
    };
  }
}
