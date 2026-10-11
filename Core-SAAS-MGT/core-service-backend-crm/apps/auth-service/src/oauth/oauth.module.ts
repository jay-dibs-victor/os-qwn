import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClient } from '../entities/oauth-client.entity';
import { AuthCode } from '../entities/auth-code.entity';
import { OAuthAccessToken } from '../entities/oauth-access-token.entity';
import { OAuthRefreshToken } from '../entities/oauth-refresh-token.entity';
import { Tenant } from '../entities/tenant.entity';
import { OauthService } from './oauth.service';
import { OauthController } from './oauth.controller';
import { AuthServiceModule } from '../auth-service.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OAuthClient,
      AuthCode,
      OAuthAccessToken,
      OAuthRefreshToken,
      Tenant,
    ]),
    forwardRef(() => AuthServiceModule),
  ],
  providers: [OauthService],
  controllers: [OauthController],
  exports: [OauthService],
})
export class OauthModule {}
