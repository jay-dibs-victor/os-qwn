import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';
import { OAuthClient } from './oauth-client.entity';
import { Tenant } from './tenant.entity';

@Entity('oauth_refresh_tokens')
export class OAuthRefreshToken extends AbstractEntity {
  @Index()
  @Column({ name: 'refresh_token', unique: true, length: 500 })
  refreshToken: string;

  @Index()
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string; // null for client_credentials flow (though refresh not used there)

  @Index()
  @Column({ name: 'client_id' })
  clientId: string;

  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ManyToOne(() => User, { nullable: true, eager: false })
  user: User;

  @ManyToOne(() => OAuthClient, { eager: false })
  client: OAuthClient;

  @ManyToOne(() => Tenant, { eager: false })
  tenant: Tenant;
}
