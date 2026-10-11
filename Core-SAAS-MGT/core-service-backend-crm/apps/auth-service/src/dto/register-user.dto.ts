import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsNotEmpty()
  @Matches(/^\+\d{1,3}\d{6,14}$/, {
    message: 'phone must be a valid international phone number (e.g., +2348012345678)',
  })
  @ApiProperty({
    example: '+2348012345678',
    description: 'User phone number (international format with country code)',
  })
  phone: string;

  @IsString()
  @MinLength(8)
  @ApiProperty({
    example: 'SecurePassword123!',
    description: 'Password (minimum 8 characters)',
    minLength: 8,
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID for multi-tenant architecture',
  })
  tenantId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName: string;
}
