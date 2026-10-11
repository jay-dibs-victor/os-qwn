import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'user.create', description: 'Unique permission slug' })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({ example: 'Create User', description: 'Human-readable permission name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Allows creating new users in the system', description: 'Permission description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class UpdatePermissionDto {
  @ApiPropertyOptional({ example: 'user.create', description: 'Unique permission slug' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional({ example: 'Create User', description: 'Human-readable permission name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Allows creating new users', description: 'Permission description' })
  @IsString()
  @IsOptional()
  description?: string;
}
