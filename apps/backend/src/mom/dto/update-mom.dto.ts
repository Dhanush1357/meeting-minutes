import { IsString, IsBoolean } from 'class-validator';
import { MoMStatus } from '@prisma/client';

export class UpdateMomDto {
  @IsString()
  title?: string;

  status?: MoMStatus;

  @IsBoolean()
  is_active?: boolean;
}
