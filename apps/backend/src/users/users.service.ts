import { UsersRepository } from './users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';

@Injectable()
export class UsersService {
  constructor(private readonly UsersRepository: UsersRepository) {}

  async getUsers(req: any) {
    const where = {
      ...(req.pagination.search
        ? {
            OR: [
              {
                email: { contains: req.pagination.search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };
    return this.UsersRepository.findWithPagination(
      req.pagination,
      where,
      {
        id: true,
        created_at: true,
        updated_at: true,
        is_active: true,
        email: true,
        password: false,
        first_name: true,
        last_name: true,
        role: true,
        profile_complete: true,
      },
      undefined,
    );
  }

  async getUserById(id: number) {
    const user = await this.UsersRepository.findFirst({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(userId: number, data: any) {
    const updateData: any = Object.fromEntries(
      await Promise.all(
        Object.entries(data)
          .filter(([_, value]) => value !== undefined) // Exclude undefined values
          .map(async ([key, value]) => [key, value]),
      ),
    );

    // Pick only the properties defined in UpdateProjectDto
    const validData = {
      ...pick(updateData, ['first_name', 'last_name', 'profile_complete', 'role', 'is_active']),
      updated_at: new Date()
    };

    const updatedUser = await this.UsersRepository.update({
      where: { id: userId },
      data: validData,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        profile_complete: true,
        role: true,
      },
    });

    return updatedUser;
  }
}
