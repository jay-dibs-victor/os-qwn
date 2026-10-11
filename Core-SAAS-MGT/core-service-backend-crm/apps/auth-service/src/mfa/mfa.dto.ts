import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsIn,
  Length,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SetupTotpDto {
  @ApiProperty({ example: 'user-uuid', description: 'User ID to setup TOTP for' })
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class VerifyTotpDto {
  @ApiProperty({ example: '123456', description: '6-digit TOTP code' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class SendSmsOtpDto {
  @ApiProperty({ example: '+2348012345678', description: 'Phone number to send OTP to' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenantId: string;
}

export class VerifySmsOtpDto {
  @ApiProperty({ example: '+2348012345678', description: 'Phone number that received the OTP' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP code received via SMS' })
  @IsString()
  @Length(6, 6)
  code: string;
}

export class StepUpVerifyDto {
  @ApiProperty({ example: 'totp', enum: ['totp', 'sms', 'backup'], description: 'Step-up verification method' })
  @IsString()
  @IsIn(['totp', 'sms', 'backup'])
  method: 'totp' | 'sms' | 'backup';

  @ApiProperty({ example: '123456', description: 'Verification code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({ example: '+2348012345678', description: 'Phone number (required for SMS method)' })
  @IsString()
  @IsOptional()
  phone?: string;
}

export class UseBackupCodeDto {
  @ApiProperty({ example: 'ABCD-EFGH-IJKL-MNOP', description: 'Backup recovery code' })
  @IsString()
  @IsNotEmpty()
  code: string;
}
