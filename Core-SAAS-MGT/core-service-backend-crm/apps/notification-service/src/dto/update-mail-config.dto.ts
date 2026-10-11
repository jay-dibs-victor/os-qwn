import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MailProvider } from '../entities/mail-config.entity';

export class UpdateMailConfigDto {
  @ApiPropertyOptional({ example: 'Resend', description: 'Name to identify this mail config' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: MailProvider, example: MailProvider.RESEND, description: 'Email provider' })
  @IsOptional()
  @IsEnum(MailProvider)
  provider?: MailProvider;

  @ApiPropertyOptional({ example: 're_abc123...', description: 'API key for the provider' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ example: 'noreply@queensos.com', description: 'Sender email address' })
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @ApiPropertyOptional({ example: 'Queens OS', description: 'Sender display name' })
  @IsOptional()
  @IsString()
  fromName?: string;

  @ApiPropertyOptional({ description: 'Set as the default mail config' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ description: 'Whether this config is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Provider-specific configuration (JSON)' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
