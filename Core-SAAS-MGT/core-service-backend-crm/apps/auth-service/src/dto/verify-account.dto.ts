import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyAccountDto {
  @IsNotEmpty()
  @IsUUID()
  @ApiProperty({ example: 'cdd6ec9d-12c7-49bc-a881-ff3ace5e0630', description: 'User ID to verify' })
  userId: string;
}
