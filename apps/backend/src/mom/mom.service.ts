import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MomRepository } from './mom.repository';
import { UpdateMomDto } from './dto/update-mom.dto';
import { pick } from 'lodash';
import { PdfGenerationService } from 'src/common/pdf/pdf-generation.service';
import { MailService } from 'src/common/mail/mail.service';
import { UsersRepository } from 'src/users/users.repository';
import { ProjectsRepository } from 'src/projects/projects.repository';
import { NotificationsService } from 'src/common/notification/notifications.service';
import { MomUtils } from './utils';
import { MoMStatus, ProjectUserRole, UserRole } from '@prisma/client';
import { ProjectUtils } from 'src/projects/utils';

@Injectable()
export class MomService {
  constructor(
    private readonly MomRepository: MomRepository,
    private readonly pdfGenerationService: PdfGenerationService,
    private readonly notificationService: NotificationsService,
    private readonly mailService: MailService,
    private readonly userRepository: UsersRepository,
    private readonly projectRepository: ProjectsRepository,
    private readonly momUtils: MomUtils,
    private readonly projectUtils: ProjectUtils,
  ) {}

  /**
   * Fetches a paginated list of MoMs based on the project ID and other filters.
   *
   * @param req - The request object containing pagination and search params.
   *
   * @returns A paginated list of MoMs.
   *
   * @throws {BadRequestException} If project ID is not provided in the query.
   */
  async getMom(req: any) {
    const projectId = Number(req.query.project_id);

    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const where: any = {
      project_id: projectId,
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

    if (req.user.role === UserRole.SUPER_ADMIN) {
      return this.MomRepository.findWithPagination(
        req.pagination,
        where,
        undefined,
        undefined,
      );
    }

    // Fetch user role from project.user_roles
    const userRole = await this.projectUtils.getUserRoleInProject(
      projectId,
      req.user.id,
    );

    const roleStatusMap: Record<string, string[]> = {
      CREATOR: [
        'CREATED',
        'IN_REVIEW',
        'AWAITING_APPROVAL',
        'NEEDS_REVISION',
        'CLOSED',
        'APPROVED',
      ],
      REVIEWER: ['IN_REVIEW', 'NEEDS_REVISION', 'CLOSED', 'APPROVED'],
      APPROVER: ['AWAITING_APPROVAL', 'APPROVED', 'CLOSED'],
      CLIENT: ['APPROVED', 'CLOSED'],
      VENDOR: ['APPROVED', 'CLOSED'],
      PARTICIPANT: ['APPROVED', 'CLOSED'],
    };

    // Apply status filter if role exists in the map, else return all for CREATOR & SUPER_ADMIN
    const statusFilter = roleStatusMap[userRole]
      ? { status: { in: roleStatusMap[userRole] } }
      : {};

    Object.assign(where, statusFilter);

    return this.MomRepository.findWithPagination(
      req.pagination,
      where,
      undefined,
      undefined,
    );
  }

  /**
   * Fetches a MoM by its ID
   *
   * @param id - The MoM ID
   * @param req - The request object
   * @returns The MoM object
   * @throws {NotFoundException} If no MoM is found with the given ID
   */
  async getMomById(id: number, req: any) {
    const mom = await this.MomRepository.findFirst({
      where: { id },
      include: {
        project: {
          select: {
            user_roles: {
              select: {
                role: true,
                user_id: true,
                user: { select: { first_name: true, last_name: true } },
              },
            },
          },
        },
        created_by: {
          select: {
            id: true,
            created_at: true,
            updated_at: true,
            is_active: true,
            email: true,
            password: false,
            first_name: true,
            last_name: true,
            role: true,
            profile_complete: true,
          },
        },
      },
    });
    if (!mom) {
      throw new NotFoundException(`mom with ID ${id} not found`);
    }

    return mom;
  }

  /**
   * Creates a new MoM entry
   *
   * @param data - The MoM data
   * @param req - The request object
   * @returns The created MoM entry
   * @throws {NotFoundException} If the project with given ID is not found
   * @throws {UnauthorizedException} If the user is not a member of the project or if the user does not have the necessary permissions to create a MoM
   */
  async createMom(data, req) {
    const project = await this.projectUtils.getProjectDetails(data.project_id);

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${data.project_id} not found`,
      );
    }

    let userRole;

    // Check if user exists in user_roles
    const userRoleEntry = project.user_roles.find(
      (user) => user.user_id === req.user.id,
    );

    if (userRoleEntry) {
      userRole = userRoleEntry.role;
    } else if (project.creator_id === req.user.id) {
      // If user is the creator return role from created_by column
      userRole = project.created_by.role;
    } else {
      throw new UnauthorizedException('You are not a member of this project');
    }

    // Check if user has the necessary permissions to create a MoM
    if (
      userRole !== ProjectUserRole.CREATOR &&
      userRole !== UserRole.SUPER_ADMIN
    ) {
      throw new UnauthorizedException('Only creators & admins can create mom');
    }

    // Determine status based on user role
    const status =
      req.user.role === UserRole.SUPER_ADMIN
        ? MoMStatus.APPROVED
        : MoMStatus.CREATED;

    // Determine MoM number if reference_mom_id is present
    let momNumber: string | null = null;

    if (
      data?.reference_mom_ids &&
      Array.isArray(data.reference_mom_ids) &&
      data.reference_mom_ids.length > 0
    ) {
      const lastMom = await this.MomRepository.findFirst({
        where: { project_id: data.project_id },
        orderBy: { id: 'desc' },
        select: { mom_number: true },
      });

      const isValidNumber =
        lastMom?.mom_number && !isNaN(Number(lastMom.mom_number));
      momNumber = isValidNumber
        ? (parseInt(lastMom.mom_number) + 1).toString().padStart(3, '0')
        : '001';
    }
    const cleanedData = await this.projectRepository.cleanObject(data);

    // Parse reference_mom_ids to ensure it's properly formatted
    let reference_mom_ids;
    if (cleanedData.reference_mom_ids) {
      if (Array.isArray(cleanedData.reference_mom_ids)) {
        reference_mom_ids = cleanedData.reference_mom_ids;
      } else if (typeof cleanedData.reference_mom_ids === 'string') {
        try {
          reference_mom_ids = JSON.parse(cleanedData.reference_mom_ids);
        } catch (e) {
          reference_mom_ids = [cleanedData.reference_mom_ids];
        }
      } else {
        reference_mom_ids = [cleanedData.reference_mom_ids];
      }
    }

    // Create a new MoM entry
    const createdMom = await this.MomRepository.create({
      data: {
        creator_id: req.user.id,
        project_id: cleanedData.project_id,
        title: cleanedData.title,
        discussion: cleanedData.discussion,
        open_issues: cleanedData.open_issues,
        updates: cleanedData.updates,
        notes: cleanedData.notes,
        completion_date: cleanedData.completion_date,
        place: cleanedData.place,
        reference_mom_ids: reference_mom_ids,
        mom_number: momNumber,
        category: cleanedData.category,
        type: cleanedData.type,
        status,
      },
    });

    // If creator is SUPER_ADMIN, generate PDF and send email
    if (req.user.role === UserRole.SUPER_ADMIN && cleanedData?.user_emails) {
      // Generate PDF
      const pdfBuffer =
        await this.pdfGenerationService.generateMoMPdf(createdMom);

      // Send email with PDF attachment
      await this.mailService.sendMoMCreatedEmail(
        createdMom,
        [
          {
            filename: `MOM_${momNumber}_${new Date().getFullYear()}-${new Date().getFullYear() + 1}.pdf`,
            content: pdfBuffer,
          },
        ],
        project,
        createdMom.created_by,
        cleanedData.user_emails,
      );
    }

    return createdMom;
  }

  /**
   * Updates a MoM by ID
   *
   * The method takes into account the user's role and only allows admins, creators, reviewers & approvers to edit MoMs
   *
   * @param id The ID of the MoM to update
   * @param updateMomDto The update payload
   * @param req The request object containing the user details
   * @returns The updated MoM with the user roles and user details
   * @throws UnauthorizedException if the user is not an admin, creator, reviewer or approver
   */
  async updateMom(id: number, updateMomDto: UpdateMomDto, req: any) {
    const projectId = updateMomDto.project_id;

    // Fetch user role from project.user_roles
    const userRole = await this.projectUtils.getUserRoleInProject(
      projectId,
      req.user.id,
    );

    if (
      userRole !== UserRole.SUPER_ADMIN &&
      userRole !== ProjectUserRole.CREATOR &&
      userRole !== ProjectUserRole.REVIEWER &&
      userRole !== ProjectUserRole.APPROVER
    ) {
      throw new UnauthorizedException(
        'Only admins, creators, reviewers & approvers can edit mom',
      );
    }

    const updateData: any =
      await this.projectRepository.cleanObject(updateMomDto);

    const validData = {
      ...pick(updateData, [
        'title',
        'is_active',
        'completion_date',
        'place',
        'discussion',
        'open_issues',
        'updates',
        'notes',
      ]),
      updated_at: new Date(),
    };

    return this.MomRepository.update({
      where: { id },
      data: validData,
    });
  }

  /**
   * Sends the MoM for review by updating its status and notifying the reviewers.
   *
   * @param id - The ID of the MoM to be sent for review.
   * @param req - The request object containing user information.
   * @returns A message indicating the MoM has been sent for review.
   * @throws {NotFoundException} If the MoM with the given ID is not found.
   */
  async sendForReview(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status to REVIEW_PENDING
    await this.MomRepository.update({
      where: { id },
      data: { status: 'IN_REVIEW' },
    });

    // Extract reviewers from project.user_roles
    const reviewers = this.momUtils.getUsersByRoles(mom, ['REVIEWER']);

    // Notify reviewers
    await this.notificationService.sendNotification(
      reviewers.map((user) => user.user_id),
      `New mom created`,
      mom.project_id,
      'MOM_CREATED',
    );

    await this.mailService.notifyReviewers(mom, reviewers);
    return { message: 'MoM sent for review' };
  }

  /**
   * Sends the MoM for approval by updating its status and notifying the approvers and the creator.
   *
   * @param id - The ID of the MoM to be sent for approval.
   * @param req - The request object containing user information.
   * @returns A message indicating the MoM has been sent for approval.
   * @throws {NotFoundException} If the MoM with the given ID is not found.
   */
  async sendForApproval(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status to APPROVAL_PENDING
    await this.MomRepository.update({
      where: { id },
      data: { status: 'AWAITING_APPROVAL' },
    });

    // Extract reviewers from project.user_roles
    const usersObject = this.momUtils.getUsersByRoles(mom, [
      'APPROVER',
      'CREATOR',
    ]);

    // Notify approvers & creator
    await this.notificationService.sendNotification(
      usersObject.map((user) => user.user_id),
      `MoM sent for Approval`,
      mom.project_id,
      'MOM_APPROVAL',
    );
    await this.mailService.notifyApprovers(mom, usersObject);
    return { message: 'MoM sent for approval' };
  }

  /**
   * Rejects the MoM by the reviewer, updates its status to 'NEEDS_REVISION',
   * and notifies the creator.
   *
   * @param id - The ID of the MoM to be rejected.
   * @param req - The request object containing user information.
   * @returns A message indicating the MoM has been rejected by the reviewer.
   * @throws {NotFoundException} If the MoM with the given ID is not found.
   */
  async rejectByReviewer(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status
    await this.MomRepository.update({
      where: { id },
      data: { status: 'NEEDS_REVISION' },
    });

    // Extract reviewers from project.user_roles
    const usersObject = this.momUtils.getUsersByRoles(mom, ['CREATOR']);

    // Notify creator
    await this.notificationService.sendNotification(
      usersObject.map((user) => user.user_id),
      `MoM Rejected by Reviewer`,
      mom.project_id,
      'MOM_REJECTED',
    );
    await this.mailService.notifyCreatorRejection(mom, usersObject);
    return { message: 'MoM rejected by reviewer' };
  }

  /**
   * Approves the MoM by the approver, updates its status to 'APPROVED',
   * generates a PDF, and notifies all users in the project.
   *
   * @param id - The ID of the MoM to be approved.
   * @param req - The request object containing user information.
   * @returns A message indicating the MoM has been approved by the approver and notifications have been sent.
   * @throws {NotFoundException} If the MoM with the given ID is not found.
   */
  async approve(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status to APPROVED
    await this.MomRepository.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Extract all users from project.user_roles
    const usersObject = this.momUtils.getUsersByRoles(mom, 'ALL');

    const project = await this.projectRepository.findFirst({
      where: { id: mom.project_id },
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

    // Generate PDF and notify all users
    await this.notificationService.sendNotification(
      usersObject.map((user) => user.user_id),
      `MoM Accepted by Approver`,
      mom.project_id,
      'MOM_ACCEPTED',
    );
    // Generate PDF
    const pdfBuffer = await this.pdfGenerationService.generateMoMPdf(mom);
    await this.mailService.notifyApproval(mom, pdfBuffer, project);
    return { message: 'MoM approved and notifications sent' };
  }

  async rejectByApprover(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status
    await this.MomRepository.update({
      where: { id },
      data: { status: 'NEEDS_REVISION' },
    });

    // Extract reviewers from project.user_roles
    const usersObject = this.momUtils.getUsersByRoles(mom, [
      'CREATOR',
      'REVIEWER',
    ]);

    // Notify creator & reviewer
    await this.notificationService.sendNotification(
      usersObject.map((user) => user.user_id),
      `MoM Rejected by Approver`,
      mom.project_id,
      'MOM_REJECTED',
    );
    await this.mailService.notifyRejectionByApprover(mom, usersObject);
    return { message: 'MoM rejected by approver' };
  }

  async closeMom(id: number, req: any) {
    const mom = await this.momUtils.geMomDetails(id);
    if (!mom) {
      throw new NotFoundException(`MoM with ID ${id} not found`);
    }

    // Update status to CLOSED
    await this.MomRepository.update({
      where: { id },
      data: { status: 'CLOSED' },
    });

    // Extract reviewers from project.user_roles
    const usersObject = this.momUtils.getUsersByRoles(mom, 'ALL');

    // Notify all
    await this.notificationService.sendNotification(
      usersObject.map((user) => user.user_id),
      `MoM is marked as Closed`,
      mom.project_id,
      'MOM_CLOSED',
    );
    return { message: 'MoM closed and notifications sent' };
  }
}
