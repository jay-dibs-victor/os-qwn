import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RemittanceSchedule, RemittanceCycle, RemittanceStatus } from '../entities/remittance-schedule.entity';

@Injectable()
export class RemittanceService {
  private readonly logger = new Logger(RemittanceService.name);

  constructor(
    @InjectRepository(RemittanceSchedule)
    private readonly remittanceRepo: Repository<RemittanceSchedule>,
  ) {}

  async createSchedule(dto: {
    tenantId: string;
    partnerId: string;
    cycle: RemittanceCycle;
    amount: number;
    dueDate: Date;
  }): Promise<RemittanceSchedule> {
    const schedule = this.remittanceRepo.create({
      tenantId: dto.tenantId,
      partnerId: dto.partnerId,
      cycle: dto.cycle,
      amount: dto.amount,
      dueDate: dto.dueDate,
      status: RemittanceStatus.PENDING,
      auditTrail: [
        { event: 'SCHEDULE_CREATED', timestamp: new Date().toISOString(), actor: 'system', details: dto },
      ],
    });
    return this.remittanceRepo.save(schedule);
  }

  async processSchedule(tenantId: string, scheduleId: string, actor?: string): Promise<RemittanceSchedule> {
    const schedule = await this.remittanceRepo.findOne({ where: { id: scheduleId, tenantId } });
    if (!schedule) throw new NotFoundException('Remittance schedule not found');
    if (schedule.status !== RemittanceStatus.PENDING) {
      throw new BadRequestException(`Schedule is ${schedule.status}, not PENDING`);
    }

    schedule.status = RemittanceStatus.PROCESSING;
    schedule.processedAt = new Date();
    schedule.processedBy = actor || 'system';
    schedule.auditTrail = [
      ...(schedule.auditTrail || []),
      { event: 'PROCESSING_STARTED', timestamp: new Date().toISOString(), actor: actor || 'system', details: {} },
    ];
    await this.remittanceRepo.save(schedule);

    try {
      schedule.processedAmount = schedule.amount;
      schedule.status = RemittanceStatus.COMPLETED;
      schedule.auditTrail = [
        ...(schedule.auditTrail || []),
        { event: 'PROCESSING_COMPLETED', timestamp: new Date().toISOString(), actor: actor || 'system', details: { amount: schedule.amount } },
      ];
    } catch (err) {
      schedule.status = RemittanceStatus.FAILED;
      schedule.auditTrail = [
        ...(schedule.auditTrail || []),
        { event: 'PROCESSING_FAILED', timestamp: new Date().toISOString(), actor: actor || 'system', details: { error: (err as Error).message } },
      ];
    }

    return this.remittanceRepo.save(schedule);
  }

  async adminOverride(dto: {
    tenantId: string;
    scheduleId: string;
    reason: string;
    actor: string;
    releaseAmount?: number;
  }): Promise<RemittanceSchedule> {
    const schedule = await this.remittanceRepo.findOne({ where: { id: dto.scheduleId, tenantId: dto.tenantId } });
    if (!schedule) throw new NotFoundException('Remittance schedule not found');

    schedule.status = RemittanceStatus.ADMIN_OVERRIDE;
    schedule.isAdminOverride = true;
    schedule.overrideReason = dto.reason;
    schedule.processedAt = new Date();
    schedule.processedBy = dto.actor;
    if (dto.releaseAmount) schedule.processedAmount = dto.releaseAmount;
    schedule.auditTrail = [
      ...(schedule.auditTrail || []),
      { event: 'ADMIN_OVERRIDE', timestamp: new Date().toISOString(), actor: dto.actor, details: { reason: dto.reason, releaseAmount: dto.releaseAmount } },
    ];
    return this.remittanceRepo.save(schedule);
  }

  async getPendingSchedules(tenantId: string): Promise<RemittanceSchedule[]> {
    return this.remittanceRepo.find({
      where: { tenantId, status: RemittanceStatus.PENDING },
      order: { dueDate: 'ASC' },
    });
  }

  async getAllSchedules(tenantId: string): Promise<RemittanceSchedule[]> {
    return this.remittanceRepo.find({ where: { tenantId }, order: { createdAt: 'DESC' } });
  }

  async getSchedule(tenantId: string, scheduleId: string): Promise<RemittanceSchedule> {
    const schedule = await this.remittanceRepo.findOne({ where: { id: scheduleId, tenantId } });
    if (!schedule) throw new NotFoundException('Remittance schedule not found');
    return schedule;
  }

  async processDueSchedules(tenantId: string, actor?: string): Promise<RemittanceSchedule[]> {
    const due = await this.remittanceRepo.find({
      where: {
        tenantId,
        status: RemittanceStatus.PENDING,
        dueDate: LessThanOrEqual(new Date()),
      },
    });

    const results: RemittanceSchedule[] = [];
    for (const schedule of due) {
      const processed = await this.processSchedule(tenantId, schedule.id, actor);
      results.push(processed);
    }
    return results;
  }

  async getSummary(tenantId: string): Promise<{
    totalSchedules: number;
    pendingCount: number;
    completedCount: number;
    totalAmount: number;
    totalProcessed: number;
    overdueCount: number;
  }> {
    const all = await this.remittanceRepo.find({ where: { tenantId } });
    const now = new Date();
    return {
      totalSchedules: all.length,
      pendingCount: all.filter(s => s.status === RemittanceStatus.PENDING).length,
      completedCount: all.filter(s => s.status === RemittanceStatus.COMPLETED).length,
      totalAmount: all.reduce((s, r) => s + Number(r.amount), 0),
      totalProcessed: all.reduce((s, r) => s + Number(r.processedAmount), 0),
      overdueCount: all.filter(s => s.status === RemittanceStatus.PENDING && new Date(s.dueDate) < now).length,
    };
  }
}
