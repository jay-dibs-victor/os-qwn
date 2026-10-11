import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    example: 'admin@queensos.com',
    description: 'User email address',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'SecurePassword123!', description: 'User password' })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    example: 'root-admin',
    description: 'Tenant ID (optional - determined from user record)',
    required: false,
  })
  tenantId?: string;
}
