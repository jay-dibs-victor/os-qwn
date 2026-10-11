import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  Matches,
  IsNotEmpty,
} from 'class-validator';
import { UserStatus, UserRole } from '../entities/user.entity';

export class CreateAdminUserDto {
  @IsEmail()
  @ApiProperty({ example: 'admin@queensos.com', description: 'User email address' })
  email: string;

  @IsNotEmpty()
  @Matches(/^\+\d{1,3}\d{6,14}$/, {
    message: 'phone must be a valid international phone number (e.g., +2348012345678)',
  })
  @ApiProperty({ example: '+2348012345678', description: 'International phone number' })
  phone: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({ example: 'SecurePassword123!', description: 'Account password (min 8 chars)' })
  password: string;

  @IsString()
  @ApiProperty({ example: 'root-admin', description: 'Tenant ID for multi-tenancy' })
  tenantId: string;

  @IsString()
  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @IsString()
  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;

  @IsOptional()
  @IsEnum(UserStatus)
  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE, description: 'User account status' })
  status?: UserStatus;

  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'Whether the user is verified' })
  isVerified?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiPropertyOptional({ enum: UserRole, example: UserRole.STAFF, description: 'Platform role for this user' })
  role?: UserRole;
}

export class UpdateAdminUserDto {
  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ example: 'admin@queensos.com', description: 'User email address' })
  email?: string;

  @IsOptional()
  @Matches(/^\+\d{1,3}\d{6,14}$/, {
    message: 'phone must be a valid international phone number (e.g., +2348012345678)',
  })
  @ApiPropertyOptional({ example: '+2348012345678', description: 'International phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'John', description: 'User first name' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Doe', description: 'User last name' })
  lastName?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.SUSPENDED, description: 'User account status' })
  status?: UserStatus;

  @IsOptional()
  @ApiPropertyOptional({ example: true, description: 'Whether the user is verified' })
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ example: 'NewSecurePassword123!', description: 'Account password (min 8 chars)' })
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  @ApiPropertyOptional({ enum: UserRole, example: UserRole.STAFF, description: 'Platform role for this user' })
  role?: UserRole;
}

export type PublicUser = {
  id: string;
  email: string;
  phone: string;
  firstName: string | null;
  lastName: string | null;
  tenantId: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
};
