import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async updateUser(userId: number, data: any) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  async getUsers() {
    return this.prisma.user.findMany();
  }
}
