import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { MfaService } from './mfa.service';
import {
  SendSmsOtpDto,
  StepUpVerifyDto,
  UseBackupCodeDto,
  VerifySmsOtpDto,
  VerifyTotpDto,
} from './mfa.dto';

@ApiTags('Auth MFA')
@ApiBearerAuth()
@Controller('auth/mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('totp/setup')
  @ApiOperation({ summary: 'Setup TOTP', description: 'Initialize TOTP setup for the authenticated user. Returns the secret and QR code URL.' })
  @ApiResponse({ status: 201, description: 'TOTP setup initialized - returns secret and QR code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  setupTotp(@Req() req: Request) {
    return this.mfaService.setupTotp(req.user as User);
  }

  @Post('totp/enable')
  @ApiOperation({ summary: 'Enable TOTP', description: 'Verify and enable TOTP for the authenticated user using the code from their authenticator app.' })
  @ApiBody({ type: VerifyTotpDto })
  @ApiResponse({ status: 201, description: 'TOTP enabled successfully' })
  @ApiResponse({ status: 400, description: 'Invalid TOTP code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  enableTotp(@Req() req: Request, @Body() dto: VerifyTotpDto) {
    return this.mfaService.enableTotp(req.user as User, dto.code);
  }

  @Post('sms/send')
  @ApiOperation({ summary: 'Send SMS OTP', description: 'Send a one-time password via SMS to the specified phone number.' })
  @ApiBody({ type: SendSmsOtpDto })
  @ApiResponse({ status: 201, description: 'SMS OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid phone number' })
  sendSmsOtp(@Body() dto: SendSmsOtpDto) {
    return this.mfaService.sendSmsOtp(dto.phone);
  }

  @Post('sms/verify')
  @ApiOperation({ summary: 'Verify SMS OTP', description: 'Verify a one-time password received via SMS.' })
  @ApiBody({ type: VerifySmsOtpDto })
  @ApiResponse({ status: 201, description: 'OTP verification result' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  async verifySmsOtp(@Body() dto: VerifySmsOtpDto) {
    const valid = await this.mfaService.verifySmsOtp(dto.phone, dto.code);
    return { verified: valid };
  }

  @Post('backup-codes/regenerate')
  @ApiOperation({ summary: 'Regenerate backup codes', description: 'Generate a new set of backup recovery codes for the authenticated user.' })
  @ApiResponse({ status: 201, description: 'New backup codes generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  regenerateBackupCodes(@Req() req: Request) {
    return this.mfaService.generateBackupCodes(req.user as User);
  }

  @Post('backup-codes/use')
  @ApiOperation({ summary: 'Use backup code', description: 'Use a backup recovery code to gain access when the primary MFA method is unavailable.' })
  @ApiBody({ type: UseBackupCodeDto })
  @ApiResponse({ status: 201, description: 'Backup code validated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or already used backup code' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  useBackupCode(@Req() req: Request, @Body() dto: UseBackupCodeDto) {
    return this.mfaService.useBackupCode(req.user as User, dto.code);
  }

  @Post('step-up/verify')
  @ApiOperation({ summary: 'Step-up verification', description: 'Perform step-up authentication for sensitive operations by verifying an additional factor.' })
  @ApiBody({ type: StepUpVerifyDto })
  @ApiResponse({ status: 201, description: 'Step-up verification successful' })
  @ApiResponse({ status: 400, description: 'Verification failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  stepUpVerify(@Req() req: Request, @Body() dto: StepUpVerifyDto) {
    return this.mfaService.verifyStepUp(req.user as User, dto);
  }
}
