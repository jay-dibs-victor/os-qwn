import { Entity, Column, Index, Unique } from 'typeorm';
import { AbstractEntity } from '@app/common';

export enum PaymentAccountEntityType {
  DRIVER = 'driver',
  PLATFORM = 'platform',
  PARTNER = 'partner',
}

@Entity('payment_accounts')
@Unique(['tenantId', 'entityType', 'entityId'])
export class PaymentAccount extends AbstractEntity {
  @Column()
  @Index()
  tenantId: string;

  @Column({
    type: 'enum',
    enum: PaymentAccountEntityType,
  })
  entityType: PaymentAccountEntityType;

  @Column()
  @Index()
  entityId: string;

  @Column({ nullable: true })
  bankCode?: string;

  @Column({ nullable: true })
  accountNumber?: string;

  @Column({ nullable: true })
  accountName?: string;

  @Column({ nullable: true })
  subaccountCode?: string;

  @Column({ nullable: true })
  recipientCode?: string;

  @Column({ default: true })
  isActive: boolean;
}
