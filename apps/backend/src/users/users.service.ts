import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, data: any) {
    // Initialize empty update data object
    const updateData: any = {};

    // Only add fields that are provided
    if (data.first_name !== undefined) {
      updateData.first_name = data.first_name;
    }

    if (data.last_name !== undefined) {
      updateData.last_name = data.last_name;
    }

    // If new password is provided, hash it
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.profile_complete !== undefined) {
      updateData.profile_complete = data.profile_complete;
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
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

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
}
