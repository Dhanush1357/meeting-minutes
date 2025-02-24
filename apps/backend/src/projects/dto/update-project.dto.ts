import { IsString, IsBoolean } from 'class-validator';
import { CategoriesOnProjects } from '@prisma/client';

export class UpdateProjectDto {
  @IsString()
  title?: string;

  user_roles?: CategoriesOnProjects[];

  @IsBoolean()
  is_active?: boolean;
}
