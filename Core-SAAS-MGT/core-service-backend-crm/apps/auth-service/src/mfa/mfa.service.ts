import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { MfaBackupCode } from '../entities/mfa-backup-code.entity';
import { User } from '../entities/user.entity';
import { UsersRepository } from '../users.repository';
import { SMS_PROVIDER, SmsProvider } from './sms.provider';
import { StepUpVerifyDto } from './mfa.dto';

@Injectable()
export class MfaService {
  private readonly smsOtpStore = new Map<
    string,
    { hash: string; expiresAt: number }
  >();

  constructor(
    @InjectRepository(MfaBackupCode)
    private readonly backupCodeRepo: Repository<MfaBackupCode>,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    @Inject(SMS_PROVIDER) private readonly smsProvider: SmsProvider,
  ) {}

  async setupTotp(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.email,
      'CoreBankingSaaS',
      secret,
    );
    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { mfaSecret: secret },
    );
    return { secret, qrCode: await toDataURL(otpauthUrl) };
  }

  async enableTotp(user: User, code: string) {
    if (!user.mfaSecret) throw new BadRequestException('TOTP not set up.');
    if (!authenticator.verify({ token: code, secret: user.mfaSecret })) {
      throw new UnauthorizedException('Invalid TOTP code.');
    }
    await this.usersRepository.findOneAndUpdate(
      { id: user.id },
      { mfaEnabled: true },
    );
    const backupCodes = await this.generateBackupCodes(user);
    return { message: 'MFA enabled.', backupCodes };
  }

  verifyTotp(user: User, code: string): boolean {
    if (!user.mfaSecret) return false;
    return authenticator.verify({ token: code, secret: user.mfaSecret });
  }

  async sendSmsOtp(phone: string) {
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hash = await bcrypt.hash(otp, 10);
    this.smsOtpStore.set(phone, {
      hash,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });
    await this.smsProvider.send(phone, `Your CoreBanking OTP: ${otp}`);
    return { message: 'OTP sent.' };
  }

  async verifySmsOtp(phone: string, code: string): Promise<boolean> {
    const entry = this.smsOtpStore.get(phone);
    if (!entry || Date.now() > entry.expiresAt) return false;
    const valid = await bcrypt.compare(code, entry.hash);
    if (valid) this.smsOtpStore.delete(phone);
    return valid;
  }

  async generateBackupCodes(user: User): Promise<string[]> {
    await this.backupCodeRepo.delete({ user: { id: user.id } });
    const codes: string[] = [];
    for (let i = 0; i < 8; i++) {
      const raw = randomBytes(5).toString('hex').toUpperCase();
      codes.push(raw);
      const entity = this.backupCodeRepo.create({
        user,
        codeHash: await bcrypt.hash(raw, 10),
        tenantId: user.tenantId,
      });
      await this.backupCodeRepo.save(entity);
    }
    return codes;
  }

  async useBackupCode(user: User, raw: string): Promise<boolean> {
    const codes = await this.backupCodeRepo.find({
      where: { user: { id: user.id }, used: false },
    });
    for (const code of codes) {
      if (await bcrypt.compare(raw, code.codeHash)) {
        code.used = true;
        await this.backupCodeRepo.save(code);
        return true;
      }
    }
    return false;
  }

  issueStepUpToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id, step_up: true },
      { expiresIn: '5m' },
    );
  }

  async verifyStepUp(user: User, dto: StepUpVerifyDto): Promise<string> {
    let verified = false;

    if (dto.method === 'totp') {
      verified = this.verifyTotp(user, dto.code);
    } else if (dto.method === 'sms' && dto.phone) {
      verified = await this.verifySmsOtp(dto.phone, dto.code);
    } else if (dto.method === 'backup') {
      verified = await this.useBackupCode(user, dto.code);
    }

    if (!verified)
      throw new UnauthorizedException('Step-up verification failed.');
    return this.issueStepUpToken(user);
  }
}
