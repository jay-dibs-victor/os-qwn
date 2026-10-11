import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as fs from 'fs';
import * as path from 'path';
import { UsersRepository } from '../users.repository';
import { AuthTokensRepository } from '../auth-tokens.repository';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly authTokensRepository: AuthTokensRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: fs.readFileSync(
        path.join(process.cwd(), 'certs/public.pem'),
        'utf8',
      ),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload) {
    // Check if token is revoked — use findOneNullable so missing token
    // doesn't throw NotFoundException (most tokens are not in the revoked list)
    if (payload.jti) {
      const revokedToken = await this.authTokensRepository.findOneNullable({
        jti: payload.jti,
        revoked: true,
      });
      if (revokedToken) {
        throw new UnauthorizedException('Token has been revoked');
      }
    }

    const user = await this.usersRepository.findOneNullable({
      id: payload.sub,
      tenantId: payload.tenantId,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { ...user, jti: payload.jti };
  }
}
