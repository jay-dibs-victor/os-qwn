import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { Request } from 'express';
import { AuthServiceService } from '../auth-service.service';
import { LoginUserDto } from '../dto/login-user.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthServiceService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request): Promise<any> {
    const loginUserDto = req.body as LoginUserDto;
    try {
      return await this.authService.validateUser(loginUserDto);
    } catch {
      throw new UnauthorizedException();
    }
  }
}
