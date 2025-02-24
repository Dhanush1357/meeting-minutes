import { IsString, IsBoolean } from 'class-validator';
import { MoMStatus } from '@prisma/client';

export class UpdateMomDto {
  @IsString()
  title?: string;

  project_id: number;

  @IsBoolean()
  is_active?: boolean;
}
