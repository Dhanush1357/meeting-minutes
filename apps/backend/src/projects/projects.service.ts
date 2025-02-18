import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async getProjects() {
    return this.prisma.project.findMany();
  }

  async getProjectById(id: number) {
    const project = await this.prisma.project.findFirst({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`project with ID ${id} not found`);
    }
    return project;
  }

  async createProject(data) {
    return this.prisma.project.create({
      data: {
        title: data.title,
        creator_id: data.creator_id,
        user_roles: {
          create: data.user_roles.map((role: any) => ({
            user_id: role.user_id,
            role: role.role,
            assigned_by: role.assigned_by,
          })),
        },
      },
      include: {
        user_roles: true,
      },
    });
  }
}
