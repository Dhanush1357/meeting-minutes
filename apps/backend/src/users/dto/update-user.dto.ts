import { UserRole } from '@prisma/client';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name?: string;

  profile_complete?: boolean;

  @IsBoolean()
  is_active?: boolean;
}
