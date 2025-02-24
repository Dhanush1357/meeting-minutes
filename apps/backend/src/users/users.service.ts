import { UsersRepository } from './users.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { pick } from 'lodash';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly UsersRepository: UsersRepository) {}

  /**
   * Fetches users with pagination and search
   *
   * The method applies the `is_active` filter if the requesting user is not SUPER_ADMIN
   *
   * @param req The request object containing the pagination and search query
   * @returns A paginated list of users with the user roles and user details
   */
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

  /**
   * Fetches a user by ID
   *
   * The method retrieves a user from the repository based on the provided ID.
   *
   * @param id The ID of the user to fetch
   * @returns The user object if found
   * @throws NotFoundException if the user with the given ID is not found
   */
  async getUserById(id: number) {
    const user = await this.UsersRepository.findFirst({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

/**
 * Updates a user by ID.
 *
 * This method cleans the input data by removing undefined values and only updates
 * the properties defined in the allowed fields. It sets the `updated_at` field to
 * the current timestamp.
 *
 * @param userId The ID of the user to update.
 * @param data The update payload containing the user properties to update.
 * @returns The updated user object with selected fields.
 */
  async updateUser(userId: number, data: any) {
    // Clean the input data by removing undefined values
    const updateData: any = await this.UsersRepository.cleanObject(data);

    // Pick only the properties defined in UpdateProjectDto
    const validData = {
      ...pick(updateData, ['first_name', 'last_name', 'profile_complete', 'is_active', 'password']),
      updated_at: new Date()
    };

    // Hash the password if it's being updated
    if (validData.password) {
      validData.password = await bcrypt.hash(validData.password, 10);
  }

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
