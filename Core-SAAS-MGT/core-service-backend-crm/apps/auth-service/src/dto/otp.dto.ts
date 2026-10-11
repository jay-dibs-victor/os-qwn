import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendVerificationOtpDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID',
  })
  tenantId: string;
}

export class VerifyEmailOtpDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  otp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID',
  })
  tenantId: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID',
  })
  tenantId: string;
}

export class ResetPasswordDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @Length(6, 6)
  @ApiProperty({
    example: '123456',
    description: '6-digit OTP code',
  })
  otp: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'NewSecurePassword123!',
    description: 'New password',
    minLength: 8,
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID',
  })
  tenantId: string;
}
