import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';

@Entity('mfa_backup_codes')
export class MfaBackupCode extends AbstractEntity {
  @Index()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ name: 'code_hash' })
  codeHash: string;

  @Column({ default: false })
  used: boolean;

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;
}
