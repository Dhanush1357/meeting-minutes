import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getMetrics() {
    const totalProjects = await this.prisma.project.count();
    const totalUsers = await this.prisma.user.count();
    return { totalProjects, totalUsers };
  }
}
