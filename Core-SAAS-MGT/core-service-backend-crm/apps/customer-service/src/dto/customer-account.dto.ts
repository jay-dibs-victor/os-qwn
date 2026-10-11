import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import {
  CustomerAccountKind,
  CustomerProfileType,
} from '../entities/customer-account.entity';

export class CreateCustomerAccountDto {
  @ApiPropertyOptional({ example: 'cust_1234' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ example: 'root-admin' })
  @IsOptional()
  @IsString()
  tenantId?: string;

  @ApiPropertyOptional({
    enum: CustomerAccountKind,
    example: CustomerAccountKind.RIDER,
  })
  @IsOptional()
  @IsEnum(CustomerAccountKind)
  kind?: CustomerAccountKind;

  @ApiPropertyOptional({
    enum: CustomerProfileType,
    example: CustomerProfileType.INDIVIDUAL,
  })
  @IsOptional()
  @IsEnum(CustomerProfileType)
  profileType?: CustomerProfileType;

  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+2348012345678' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;
}

export class UpdateCustomerAccountDto extends CreateCustomerAccountDto {}
