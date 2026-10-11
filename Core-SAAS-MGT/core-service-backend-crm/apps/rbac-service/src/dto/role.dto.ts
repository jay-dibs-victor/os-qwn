import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin', description: 'Role name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Administrator with full access', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @ApiPropertyOptional({ example: ['perm-uuid-1', 'perm-uuid-2'], description: 'Permission IDs to assign to this role' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Admin', description: 'Role name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Administrator with full access', description: 'Role description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: ['perm-uuid-1', 'perm-uuid-2'], description: 'Permission IDs to assign to this role' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}
