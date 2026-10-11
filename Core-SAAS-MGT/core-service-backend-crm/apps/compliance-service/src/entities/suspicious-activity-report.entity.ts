import { AbstractEntity } from '@app/common';
import { Column, Entity } from 'typeorm';

export enum SarStatus {
  FILED = 'FILED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  CLOSED = 'CLOSED',
}

@Entity('suspicious_activity_reports')
export class SuspiciousActivityReport extends AbstractEntity {
  @Column()
  customerId: string;

  @Column({ type: 'simple-array' })
  alertIds: string[];

  @Column({ type: 'text' })
  narrative: string;

  @Column()
  filedBy: string;

  @Column({ type: 'varchar', length: 20, default: SarStatus.FILED })
  status: SarStatus;

  @Column()
  tenantId: string;
}
