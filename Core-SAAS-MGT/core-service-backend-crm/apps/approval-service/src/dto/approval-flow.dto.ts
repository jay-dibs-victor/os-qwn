import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsArray,
  ValidateNested,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ApprovalLevelDto {
  @IsNumber()
  @IsNotEmpty()
  level!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedUserIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedRoleIds?: string[];
}

export class CreateApprovalConfigDto {
  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsString()
  @IsOptional()
  requiredPermission?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalLevelDto)
  levels!: ApprovalLevelDto[];

  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class CreateApprovalRequestDto {
  @IsString()
  @IsNotEmpty()
  method!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;

  @IsObject()
  @IsNotEmpty()
  payload!: any;

  @IsString()
  @IsNotEmpty()
  initiatorId!: string;

  @IsString()
  @IsNotEmpty()
  tenantId!: string;

  @IsString()
  @IsOptional()
  requiredPermission?: string;
}

export class ApproveStepDto {
  @IsString()
  @IsNotEmpty()
  approverId!: string;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class RejectStepDto {
  @IsString()
  @IsNotEmpty()
  approverId!: string;

  @IsString()
  @IsOptional()
  reason?: string;

  @IsString()
  @IsOptional()
  comment?: string;
}
