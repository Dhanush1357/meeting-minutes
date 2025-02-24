import { ProjectsRepository } from 'src/projects/projects.repository';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProjectUtils {
  constructor(private readonly projectRepository: ProjectsRepository) {}

  /**
   * Fetches project details including assigned users.
   *
   * @param projectId - The project ID.
   * @returns Project details including assigned users.
   */
  async getProjectDetails(projectId: number) {
    return await this.projectRepository.findFirst({
      where: { id: projectId },
      include: {
        created_by: {
          select: {
            id: true,
            role: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        user_roles: {
          include: {
            user: {
              select: { email: true },
            },
          },
        },
      },
    });
  }

  /**
   * Retrieves the role of a user within a specific project.
   *
   * @param projectId - The ID of the project.
   * @param userId - The ID of the user.
   * @returns The role of the user in the project.
   * @throws NotFoundException - If the project is not found.
   * @throws ForbiddenException - If the user does not have access to the project.
   */
  async getUserRoleInProject(projectId: number, userId: number): Promise<string> {
    const project = await this.projectRepository.findFirst({
      where: { id: projectId },
      select: {
        created_by: {
          select: {
            id: true,
            role: true,
          },
        }, 
        user_roles: true 
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user exists in user_roles
    const userRoleEntry = project.user_roles.find((user) => user.user_id === userId);

    if (userRoleEntry) {
      return userRoleEntry.role;
    }

    // If user is the creator return role from created_by column
    if (project.creator_id === userId) {
      return project.created_by.role;
    }

    throw new ForbiddenException('You do not have access to this project');
  }
}
