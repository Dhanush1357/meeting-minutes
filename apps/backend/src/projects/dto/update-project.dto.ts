import { IsString, IsBoolean } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectDto {
  @IsString()
  title?: string;

  status?: ProjectStatus;

  @IsBoolean()
  is_active?: boolean;
}
