import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async getProjects(req: any) {
    const where = {
      ...(req.pagination.search
        ? {
            OR: [
              {
                title: { contains: req.pagination.search, mode: 'insensitive' },
              },
            ],
          }
        : {}),
    };

    return this.projectsRepository.findWithPagination(
      req.pagination,
      where,
      undefined,
      {
        user_roles: {
          include: {
            user: { select: { first_name: true, email: true } },
          },
        },
      },
    );
  }

  async getProjectById(id: number) {
    const project = await this.projectsRepository.findFirst({
      where: { id },
    });
    if (!project) {
      throw new NotFoundException(`project with ID ${id} not found`);
    }
    return project;
  }

  async createProject(data) {
    return this.projectsRepository.create({
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
