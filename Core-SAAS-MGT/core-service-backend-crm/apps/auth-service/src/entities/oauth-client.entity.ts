import { Entity, Column, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { Tenant } from './tenant.entity';

@Entity('oauth_clients')
export class OAuthClient extends AbstractEntity {
  @Column({ name: 'client_name' })
  clientName: string;

  @Index()
  @Column({ name: 'client_id', unique: true })
  clientId: string;

  @Column({ name: 'client_secret_hash', nullable: true })
  clientSecretHash: string;

  @Column({ name: 'is_public', default: true })
  isPublic: boolean;

  @Column({ name: 'redirect_uris', type: 'text' })
  redirectUris: string;

  @Column({ default: 'openid profile' })
  scopes: string;

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'grant_types', default: 'authorization_code' })
  grantTypes: string; // comma-separated: 'authorization_code,client_credentials,refresh_token'

  @Column({ name: 'allowed_origins', type: 'text', nullable: true })
  allowedOrigins: string; // newline-separated CORS origins

  @Column({ name: 'token_lifetime', default: 3600 })
  tokenLifetime: number; // seconds (default 1 hour)

  @Column({ name: 'refresh_token_lifetime', default: 2592000 })
  refreshTokenLifetime: number; // seconds (default 30 days)

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Tenant, { eager: false })
  tenant: Tenant;
}
