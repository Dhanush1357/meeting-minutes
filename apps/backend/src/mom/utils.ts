import { MomRepository } from './mom.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MomUtils {
  constructor(private readonly MomRepository: MomRepository) {}

  /**
   * Fetches mom details including assigned users.
   *
   * @param momId - The mom ID.
   * @returns mom details including assigned users.
   */
  async geMomDetails(momId: number) {
    return await this.MomRepository.findFirst({
      where: { id: momId },
      include: {
        project: {
          select: {
            user_roles: {
              select: {
                project_id: true,
                role: true,
                user_id: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Extracts users from MoM's project user roles based on given roles.
   *
   * @param mom - The MoM object.
   * @param roles - An array of roles to filter (e.g., ['REVIEWER', 'CREATOR']) or 'ALL' to get all users.
   * @returns Array of users matching the given roles or all users if 'ALL' is provided.
   */
  getUsersByRoles(mom: any, roles: string[] | 'ALL') {
    if (!mom?.project?.user_roles) {
      return [];
    }

    if (roles === 'ALL') {
      return mom.project.user_roles.map((userRole) => userRole.user); // Return all users
    }

    return mom.project.user_roles
      .filter((userRole) => roles.includes(userRole.role)) // Filter users by the given roles
      .map((userRole) => userRole); // Extract user objects
  }
}
