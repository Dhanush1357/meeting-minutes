import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { UpdateProjectDto } from './dto/update-project.dto';
import { pick } from 'lodash';
import { NotificationsService } from 'src/common/notification/notifications.service';
import { MailService } from 'src/common/mail/mail.service';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly notificationService: NotificationsService,
    private mailService: MailService,
  ) {}

  /**
   * Fetches projects with pagination and search
   *
   * The method takes into account the user's role and only returns projects that the user is assigned to
   * if the user is not SUPER_ADMIN
   *
   * @param req The request object containing the pagination and search query
   * @returns A paginated list of projects with the user roles and user details
   */
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

  /**
   * Fetches a project by ID
   *
   * The method takes into account the user's role and only returns projects that the user is assigned to
   * if the user is not SUPER_ADMIN
   *
   * @param id The ID of the project to fetch
   * @param req The request object containing the user details
   * @returns The project with the user roles and user details
   * @throws NotFoundException if the project with the given ID is not found
   * @throws UnauthorizedException if the user is not assigned to the project
   */
  async getProjectById(id: number, req: any) {
    const project = await this.projectsRepository.findFirst({
      where: { id },
      include: {
        // Include creator information
        created_by: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            email: true,
          },
        },
        // Include user roles with user information
        user_roles: {
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                role: true,
                email: true,
              },
            },
          },
        },
      },
    });
    if (!project) {
      throw new NotFoundException(`project with ID ${id} not found`);
    }

    // Restrict access if user is not assigned to the project
    if (
      req.user.role !== 'SUPER_ADMIN' &&
      !project.user_roles.some((role) => role.user_id === req.user.userId)
    ) {
      throw new UnauthorizedException('Access denied');
    }

    return project;
  }

  /**
   * Creates a new project with the given title and user roles
   *
   * The method takes into account the user's role and only allows admins to create projects
   *
   * @param data The create payload containing the title and user roles
   * @param req The request object containing the user details
   * @returns The created project with the user roles and user details
   * @throws UnauthorizedException if the user is not an admin
   */
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
        user_roles: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    // Find the user with the "CREATOR" role
    const creatorRole = project.user_roles.find(
      (role) => role.role === 'CREATOR',
    );
    if (creatorRole) {
      await this.mailService.sendProjectCreatedMail(
        creatorRole.user.email,
        project,
      );
    }

    // Notify all assigned users
    const users = project.user_roles.map((role) => role.user_id);
    await this.notificationService.sendNotification(
      users,
      `New project created: ${project.title}`,
      project.id,
      'PROJECT_CREATED',
    );

    return project;
  }

  /**
   * Updates a project by ID
   *
   * The method takes into account the user's role and only allows admins to edit projects
   *
   * @param id The ID of the project to update
   * @param updateProjectDto The update payload
   * @param req The request object containing the user details
   * @returns The updated project with the user roles and user details
   * @throws NotFoundException if the project with the given ID is not found
   * @throws UnauthorizedException if the user is not an admin
   */
  async updateProject(
    id: number,
    updateProjectDto: UpdateProjectDto,
    req: any,
  ) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only admins can edit projects');
    }

    const project = await this.projectsRepository.findFirst({
      where: { id },
      include: { user_roles: true },
    });
    if (!project)
      throw new NotFoundException(`Project with ID ${id} not found`);

    const updateData: any = Object.fromEntries(
      await Promise.all(
        Object.entries(updateProjectDto)
          .filter(([_, value]) => value !== undefined)
          .map(async ([key, value]) => [key, value]),
      ),
    );

    // Extract user_roles separately
    const { user_roles, ...otherData } = updateData;

    const validData = {
      ...pick(updateData, ['title', 'is_active']),
      updated_at: new Date(), // Set updated_at to current timestamp
    };

    // Handle user_roles relation update
    if (user_roles) {
      validData.user_roles = {
        deleteMany: {}, // Removes all existing user_roles for the project
        create: user_roles.map((role) => ({
          user_id: role.user_id,
          role: role.role,
          assigned_by: role.assigned_by,
        })),
      };
    }

    const updatedProject = await this.projectsRepository.update({
      where: { id },
      data: validData,
    });

    const users = project.user_roles.map((role) => role.user_id);
    await this.notificationService.sendNotification(
      users,
      `Project updated: ${project.title}`,
      project.id,
      'PROJECT_UPDATED',
    );

    return updatedProject;
  }

  /**
   * Closes a project by ID
   *
   * The method takes into account the user's role and only allows admins to close projects
   *
   * @param id The ID of the project to close
   * @param req The request object containing the user details
   * @returns A success message
   * @throws NotFoundException if the project with the given ID is not found
   * @throws UnauthorizedException if the user is not an admin
   */
  async closeProject(id: number, req: any) {
    if (req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only admins can close projects');
    }

    const project = await this.projectsRepository.findFirst({
      where: { id },
      include: { user_roles: true },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    await this.projectsRepository.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    const users = project.user_roles.map((role) => role.user_id);
    await this.notificationService.sendNotification(
      users,
      `Project #${id} has been closed`,
      id,
      'PROJECT_CLOSED',
    );
    await this.notificationService.removeProjectNotifications(id);

    return { message: 'Project closed successfully' };
  }
}
