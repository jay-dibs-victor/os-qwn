import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FleetContract,
  RemittanceSchedule,
  PayoutStrategy,
} from './entities/fleet-contract.entity';

export interface CreateFleetContractDto {
  tenantId: string;
  partnerId: string;
  driverId: string;
  vehicleId?: string;
  remittanceSchedule: RemittanceSchedule;
  payoutStrategy: PayoutStrategy;
  rateValue: number;
}

export interface FleetSplitResult {
  platformAmount: number;
  partnerAmount: number;
  driverAmount: number;
  partnerRate: number;
}

@Injectable()
export class FleetContractService {
  private readonly logger = new Logger(FleetContractService.name);

  constructor(
    @InjectRepository(FleetContract)
    private readonly repo: Repository<FleetContract>,
  ) {}

  async create(dto: CreateFleetContractDto): Promise<FleetContract> {
    const existing = await this.findActiveForDriver(dto.tenantId, dto.driverId, dto.partnerId);
    if (existing) {
      throw new BadRequestException('An active contract already exists for this driver-partner pair');
    }
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(tenantId: string): Promise<FleetContract[]> {
    return this.repo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<FleetContract> {
    const contract = await this.repo.findOne({ where: { id } });
    if (!contract) throw new NotFoundException('Fleet contract not found');
    return contract;
  }

  async update(id: string, dto: Partial<CreateFleetContractDto>): Promise<FleetContract> {
    const contract = await this.findById(id);
    Object.assign(contract, dto);
    return this.repo.save(contract);
  }

  async deactivate(id: string): Promise<void> {
    const contract = await this.findById(id);
    contract.isActive = false;
    await this.repo.save(contract);
  }

  async findActiveForDriver(
    tenantId: string,
    driverId: string,
    partnerId?: string,
  ): Promise<FleetContract | null> {
    const where: any = { tenantId, driverId, isActive: true };
    if (partnerId) where.partnerId = partnerId;
    return this.repo.findOne({ where });
  }

  async findPartnersBySchedule(
    tenantId: string,
    schedule: RemittanceSchedule,
  ): Promise<FleetContract[]> {
    return this.repo.find({
      where: { tenantId, remittanceSchedule: schedule, isActive: true },
    });
  }

  calculateSplit(params: {
    totalFare: number;
    platformRate: number;
    contract: FleetContract;
  }): FleetSplitResult {
    const { totalFare, platformRate, contract } = params;
    const platformAmount = Math.round(totalFare * platformRate * 100) / 100;
    const netPool = totalFare - platformAmount;

    let partnerAmount = 0;
    if (contract.payoutStrategy === PayoutStrategy.PERCENTAGE_SPLIT) {
      partnerAmount = Math.round(netPool * (contract.rateValue / 100) * 100) / 100;
    } else {
      partnerAmount = Math.min(contract.rateValue, netPool);
    }

    const driverAmount = Math.round((netPool - partnerAmount) * 100) / 100;
    const partnerRate = contract.payoutStrategy === PayoutStrategy.PERCENTAGE_SPLIT
      ? contract.rateValue / 100
      : 0;

    return { platformAmount, partnerAmount, driverAmount, partnerRate };
  }
}
