import { UserRole } from '@prisma/client';
import { IsBoolean, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  first_name: string;

  @IsString()
  last_name?: string;

  profile_complete?: boolean;

  role?: UserRole;

  @IsBoolean()
  is_active?: boolean;
}
