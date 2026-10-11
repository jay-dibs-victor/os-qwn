import { IsString, IsNotEmpty, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePolicyDto {
  @ApiProperty({ example: 'High-Value Transfer Policy', description: 'Policy name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: { maxAmount: 1000000, requireApproval: true }, description: 'Policy rules as a JSON object' })
  @IsObject()
  @IsNotEmpty()
  rules!: any;

  @ApiProperty({ example: 'root-admin', description: 'Tenant identifier' })
  @IsString()
  @IsNotEmpty()
  tenantId!: string;
}

export class EvaluatePolicyDto {
  @ApiProperty({ example: 'policy-uuid', description: 'Policy ID to evaluate' })
  @IsString()
  @IsNotEmpty()
  policyId!: string;

  @ApiProperty({ example: { amount: 500000, userId: 'user-uuid' }, description: 'Evaluation context data' })
  @IsObject()
  @IsNotEmpty()
  context!: any;
}
