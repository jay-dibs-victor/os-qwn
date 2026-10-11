import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyMfaDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'cdd6ec9d-12c7-49bc-a881-ff3ace5e0630', description: 'User ID' })
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '123456', description: '6-digit MFA code from authenticator app' })
  code: string;
}
