import { Entity, Column, ManyToOne, Index } from 'typeorm';
import { AbstractEntity } from '@app/common';
import { User } from './user.entity';
import { OAuthClient } from './oauth-client.entity';

@Entity('auth_codes')
export class AuthCode extends AbstractEntity {
  @Index()
  @Column({ unique: true })
  code: string;

  @Column({ name: 'code_challenge', nullable: true })
  codeChallenge: string;

  @Column({ name: 'code_challenge_method', default: 'S256' })
  codeChallengeMethod: string;

  @Column({ name: 'redirect_uri' })
  redirectUri: string;

  @Column()
  scopes: string;

  @Index()
  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ default: false })
  used: boolean;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @ManyToOne(() => OAuthClient, { eager: true })
  client: OAuthClient;
}
