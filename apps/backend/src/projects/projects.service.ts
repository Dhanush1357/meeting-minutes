import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { UpdateProjectDto } from './dto/update-project.dto';
import { pick } from 'lodash';
import { NotificationsService } from 'src/common/notification/notifications.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository, private readonly notificationService: NotificationsService) {}

  async getProjects(req: any) {
    const where: any = {
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

    // If the user is not SUPER_ADMIN, restrict projects to only those they are assigned to
    if (req.user.role !== 'SUPER_ADMIN') {
      where.user_roles = {
        some: { user_id: req.user.userId },
      };
    }

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

  async getProjectById(id: number, req: any) {
    const project = await this.projectsRepository.findFirst({
      where: { id },
      include: { user_roles: true },
    });
    if (!project) {
      throw new NotFoundException(`project with ID ${id} not found`);
    }

    // Restrict access if user is not assigned to the project
    if (!project.user_roles.some((role) => role.user_id === req.user.userId)) {
      throw new UnauthorizedException('Access denied');
    }

    return project;
  }

  async createProject(data, req) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only admins can create projects');
    }

    const project = await this.projectsRepository.create({
      data: {
        title: data.title,
        creator_id: req.user.userId,
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

    const users = project.user_roles.map((role) => role.user_id);
    await this.notificationService.sendNotification(users, `New project created: ${project.title}`, project.id, 'PROJECT_CREATED');

    return project;
  }

  async updateProject(
    id: number,
    updateProjectDto: UpdateProjectDto,
    req: any,
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only admins can edit projects');
    }

    const project = await this.projectsRepository.findFirst({ where: { id }, include: { user_roles: true } });
    if (!project) throw new NotFoundException(`Project with ID ${id} not found`);

    const updateData: any = Object.fromEntries(
      await Promise.all(
        Object.entries(updateProjectDto)
          .filter(([_, value]) => value !== undefined)
          .map(async ([key, value]) => [key, value]),
      ),
    );

    const validData = {
      ...pick(updateData, ['title', 'status', 'is_active']),
      updated_at: new Date(), // Set updated_at to current timestamp
    };

    const updatedProject = await this.projectsRepository.update({
      where: { id },
      data: validData,
    });

    const users = project.user_roles.map(role => role.user_id);
    await this.notificationService.sendNotification(users, `Project updated: ${project.title}`, project.id, 'PROJECT_UPDATED');

    return updatedProject;
  }

  async closeProject(id: number, req: any) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only admins can close projects');
    }

    await this.projectsRepository.update({ where: { id }, data: { status: 'CLOSED' } });

    await this.notificationService.sendNotification([], `Project #${id} has been closed`, id, 'PROJECT_CLOSED');
    await this.notificationService.removeProjectNotifications(id);

    return { message: 'Project closed successfully' };
}
}
