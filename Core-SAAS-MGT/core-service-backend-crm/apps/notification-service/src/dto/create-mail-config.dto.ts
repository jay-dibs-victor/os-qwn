import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MailProvider } from '../entities/mail-config.entity';

export class CreateMailConfigDto {
  @ApiProperty({ example: 'Resend', description: 'Name to identify this mail config' })
  @IsString()
  name: string;

  @ApiProperty({ enum: MailProvider, example: MailProvider.RESEND, description: 'Email provider' })
  @IsEnum(MailProvider)
  provider: MailProvider;

  @ApiProperty({ example: 're_abc123...', description: 'API key for the provider' })
  @IsString()
  apiKey: string;

  @ApiProperty({ example: 'noreply@queensos.com', description: 'Sender email address' })
  @IsEmail()
  fromEmail: string;

  @ApiPropertyOptional({ example: 'Queens OS', description: 'Sender display name' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ default: false, description: 'Set as the default mail config' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Whether this config is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Provider-specific configuration (JSON)' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
