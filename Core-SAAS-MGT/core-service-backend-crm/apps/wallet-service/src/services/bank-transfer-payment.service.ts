import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { BankTransfer, BankTransferStatus } from '../entities/bank-transfer.entity';
import { DriverLedger, DriverLedgerDirection, DriverLedgerEntryType } from '../entities/driver-ledger.entity';
import { DriverDebtService } from './driver-debt.service';
import { DriverLedgerService } from './driver-ledger.service';
import {
  RecordCashPaymentDto,
  InitiateBankTransferDto,
  ConfirmBankTransferDto,
  ConfirmationParty,
} from '../dto/bank-transfer.dto';

@Injectable()
export class BankTransferPaymentService {
  constructor(
    @InjectRepository(BankTransfer)
    private readonly bankTransferRepository: Repository<BankTransfer>,
    @InjectRepository(DriverLedger)
    private readonly driverLedgerRepository: Repository<DriverLedger>,
    private readonly driverDebtService: DriverDebtService,
    private readonly driverLedgerService: DriverLedgerService,
  ) {}

  async recordCashPayment(dto: RecordCashPaymentDto): Promise<{ ledgerEntry: DriverLedger; debt: any }> {
    const commissionAmount = Number(dto.commissionAmount);
    const fareAmount = Number(dto.fareAmount);

    const ledgerEntry = await this.driverLedgerService.recordEntry({
      tenantId: dto.tenantId,
      driverCustomerId: dto.driverCustomerId,
      entryType: DriverLedgerEntryType.CASH_RIDE_COMMISSION,
      direction: DriverLedgerDirection.DEBIT,
      amount: commissionAmount,
      currency: dto.currency || 'NGN',
      reference: `CASH-CM-${uuidv4().slice(0, 8)}`,
      tripId: dto.tripId,
      description: `Commission for cash ride ${dto.tripId} (fare: ${fareAmount})`,
    });

    const debt = await this.driverDebtService.recordCommissionDebt(
      dto.tenantId,
      dto.driverCustomerId,
      commissionAmount,
      dto.tripId,
    );

    return { ledgerEntry, debt };
  }

  async initiateBankTransfer(dto: InitiateBankTransferDto): Promise<BankTransfer> {
    const reference = `BANK-TRF-${uuidv4().slice(0, 8)}`;

    const transfer = this.bankTransferRepository.create({
      tenantId: dto.tenantId,
      tripId: dto.tripId,
      driverCustomerId: dto.driverCustomerId,
      riderCustomerId: dto.riderCustomerId,
      amount: Number(dto.amount),
      currency: dto.currency || 'NGN',
      status: BankTransferStatus.AWAITING_CONFIRMATION,
      reference,
    });

    return this.bankTransferRepository.save(transfer);
  }

  async confirmBankTransfer(dto: ConfirmBankTransferDto): Promise<BankTransfer> {
    const transfer = await this.bankTransferRepository.findOne({
      where: { id: dto.bankTransferId, tenantId: dto.tenantId },
    });
    if (!transfer) throw new BadRequestException('Bank transfer not found');

    if (transfer.status === BankTransferStatus.CONFIRMED) {
      throw new BadRequestException('Bank transfer is already confirmed');
    }
    if (transfer.status === BankTransferStatus.DISPUTED) {
      throw new BadRequestException('Bank transfer is under dispute');
    }
    if (transfer.status === BankTransferStatus.MISMATCH) {
      throw new BadRequestException('Bank transfer has a mismatch; please open a dispute');
    }

    const confirmedAmount = Number(dto.confirmedAmount);

    if (dto.confirmedBy === ConfirmationParty.DRIVER) {
      if (transfer.driverConfirmedAt) {
        throw new BadRequestException('Driver has already confirmed this transfer');
      }
      transfer.driverConfirmedAmount = confirmedAmount;
      transfer.driverConfirmedAt = new Date();
      transfer.driverNote = dto.note;
    } else {
      if (transfer.riderConfirmedAt) {
        throw new BadRequestException('Rider has already confirmed this transfer');
      }
      transfer.riderConfirmedAmount = confirmedAmount;
      transfer.riderConfirmedAt = new Date();
      transfer.riderNote = dto.note;
    }

    const driverDone = transfer.driverConfirmedAt !== null;
    const riderDone = transfer.riderConfirmedAt !== null;

    if (driverDone && riderDone) {
      const driverAmount = Number(transfer.driverConfirmedAmount);
      const riderAmount = Number(transfer.riderConfirmedAmount);

      if (driverAmount === riderAmount && driverAmount === Number(transfer.amount)) {
        transfer.status = BankTransferStatus.CONFIRMED;

        await this.driverLedgerService.recordEntry({
          tenantId: transfer.tenantId,
          driverCustomerId: transfer.driverCustomerId,
          entryType: DriverLedgerEntryType.BANK_TRANSFER,
          direction: DriverLedgerDirection.CREDIT,
          amount: driverAmount,
          currency: transfer.currency,
          reference: `BANK-SET-${uuidv4().slice(0, 8)}`,
          tripId: transfer.tripId,
          description: `Bank transfer confirmed for trip ${transfer.tripId}`,
        });
      } else {
        transfer.status = BankTransferStatus.MISMATCH;
      }
    }

    return this.bankTransferRepository.save(transfer);
  }
}
