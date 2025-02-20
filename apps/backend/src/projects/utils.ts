import { ProjectsRepository } from 'src/projects/projects.repository';
import { Injectable } from '@nestjs/common';

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
}
