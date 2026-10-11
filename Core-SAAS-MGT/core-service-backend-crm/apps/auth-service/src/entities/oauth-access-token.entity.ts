import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';
import { OAuthClient } from './oauth-client.entity';
import { Tenant } from './tenant.entity';

@Entity('oauth_access_tokens')
export class OAuthAccessToken extends AbstractEntity {
  @Index()
  @Column({ name: 'access_token', unique: true, length: 2000 })
  accessToken: string;

  @Column({ name: 'token_type', default: 'Bearer' })
  tokenType: string;

  @Index()
  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'text' })
  scopes: string; // space-separated scopes

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'user_id', nullable: true })
  userId: string; // null for client_credentials flow

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
