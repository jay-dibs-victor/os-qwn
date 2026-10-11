import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as Joi from 'joi';
import { AuthServiceController } from './auth-service.controller';
import { UsersController } from './users.controller';
import { AuthServiceService } from './auth-service.service';
import { DatabaseModule, RmqModule } from '@app/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { AuthToken } from './entities/auth-token.entity';
import { Otp } from './entities/otp.entity';
import { Tenant } from './entities/tenant.entity';
import { OAuthClient } from './entities/oauth-client.entity';
import { Scope } from './entities/scope.entity';
import { TenantScope } from './entities/tenant-scope.entity';
import { UserScope } from './entities/user-scope.entity';
import { Role } from './entities/role.entity';
import { Customer } from './entities/customer.entity';
import { UsersRepository } from './users.repository';
import { AuthTokensRepository } from './auth-tokens.repository';
import { TenantService } from './tenant.service';
import { DatabaseSeeder } from './database.seeder';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { OauthModule } from './oauth/oauth.module';
import { MfaModule } from './mfa/mfa.module';
import { EmailModule } from '@app/common';
import { ScopesModule } from './scopes/scopes.module';
import { GoogleController } from './oauth/google.controller';
import { CustomersModule } from './customers/customers.module';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsGateway } from './analytics/analytics.gateway';
import { LedgerSeeder } from './analytics/ledger.seeder';
import { TenantSettingsController } from './settings/tenant-settings.controller';
import { UploadModule } from './upload/upload.module';
import { GlAccount } from '../../ledger-service/src/entities/gl-account.entity';
import { JournalEntry } from '../../ledger-service/src/entities/journal-entry.entity';
import { LedgerEntry } from '../../ledger-service/src/entities/ledger-entry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        RABBITMQ_URI: Joi.string().required(),
        RABBITMQ_AUTH_QUEUE: Joi.string().required(),
        RBAC_SERVICE_URL: Joi.string().required(),
        SENDGRID_API_KEY: Joi.string().required(),
        MAIL_FROM_EMAIL: Joi.string().email().optional(),
        MAIL_FROM_NAME: Joi.string().optional(),
        GOOGLE_CLIENT_ID: Joi.string().optional(),
        GOOGLE_CLIENT_SECRET: Joi.string().optional(),
        GOOGLE_CALLBACK_URL: Joi.string().optional(),
        FRONTEND_URL: Joi.string().optional(),
        // ── File Upload (adapter pattern) ──────────────────────────────────
        WALLET_SERVICE_URL: Joi.string().optional().default('http://localhost:3015'),
        ACCOUNTS_SERVICE_URL: Joi.string().optional().default('http://localhost:3005'),
        UPLOAD_PROVIDER: Joi.string().valid('cloudinary', 's3', 'local').default('cloudinary'),
        // Cloudinary
        CLOUDINARY_CLOUD_NAME: Joi.string().allow('').optional(),
        CLOUDINARY_API_KEY: Joi.string().allow('').optional(),
        CLOUDINARY_API_SECRET: Joi.string().allow('').optional(),
        // AWS S3 — only needed when UPLOAD_PROVIDER=s3
        AWS_S3_BUCKET: Joi.string().allow('').optional(),
        AWS_S3_REGION: Joi.string().optional(),
        AWS_ACCESS_KEY_ID: Joi.string().allow('').optional(),
        AWS_SECRET_ACCESS_KEY: Joi.string().allow('').optional(),
        AWS_S3_PUBLIC_URL: Joi.string().allow('').optional(),
      }),
      envFilePath: './apps/auth-service/.env',
    }),
    DatabaseModule,
    RmqModule.register({ name: 'AUTH' }),
    TypeOrmModule.forFeature([User, AuthToken, Otp, Tenant, OAuthClient, Scope, TenantScope, UserScope, Role, Customer, GlAccount, JournalEntry, LedgerEntry]),
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        privateKey: fs.readFileSync(
          path.join(process.cwd(), 'certs/private.pem'),
          'utf8',
        ),
        publicKey: fs.readFileSync(
          path.join(process.cwd(), 'certs/public.pem'),
          'utf8',
        ),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
    forwardRef(() => OauthModule),
    MfaModule,
    EmailModule.forRoot('apps/auth-service/src/email/templates'),
    ScopesModule,
    CustomersModule,
    UploadModule,
  ],
  controllers: [AuthServiceController, UsersController, GoogleController, AnalyticsController, TenantSettingsController],
  providers: [
    AuthServiceService,
    UsersRepository,
    AuthTokensRepository,
    TenantService,
    DatabaseSeeder,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    AnalyticsService,
    AnalyticsGateway,
    LedgerSeeder,
  ],
  exports: [AuthServiceService],
})
export class AuthServiceModule {}
