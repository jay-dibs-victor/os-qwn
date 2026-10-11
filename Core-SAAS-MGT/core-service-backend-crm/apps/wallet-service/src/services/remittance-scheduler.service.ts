import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RemittanceSchedule, RemittanceStatus, RemittanceCycle } from '../entities/remittance-schedule.entity';
import { RemittanceService } from './remittance.service';

@Injectable()
export class RemittanceSchedulerService {
  private readonly logger = new Logger(RemittanceSchedulerService.name);

  constructor(
    @InjectRepository(RemittanceSchedule)
    private readonly remittanceRepo: Repository<RemittanceSchedule>,
    private readonly remittanceService: RemittanceService,
  ) {}

  async processOverdueRemittances(tenantId?: string): Promise<RemittanceSchedule[]> {
    const where: any = { status: RemittanceStatus.PENDING, dueDate: LessThanOrEqual(new Date()) };
    if (tenantId) where.tenantId = tenantId;
    const overdue = await this.remittanceRepo.find({ where });
    const results: RemittanceSchedule[] = [];
    for (const schedule of overdue) {
      try {
        const result = await this.remittanceService.processSchedule(schedule.tenantId, schedule.id, 'scheduler');
        results.push(result);
      } catch (err) {
        this.logger.error(`Failed to process overdue schedule ${schedule.id}: ${(err as Error).message}`);
      }
    }
    return results;
  }

  async createAndProcessSchedule(dto: {
    tenantId: string;
    partnerId: string;
    cycle: RemittanceCycle;
    amount: number;
    dueDate: Date;
  }): Promise<RemittanceSchedule> {
    const schedule = await this.remittanceService.createSchedule(dto);
    return this.remittanceService.processSchedule(dto.tenantId, schedule.id, 'scheduler');
  }
}
