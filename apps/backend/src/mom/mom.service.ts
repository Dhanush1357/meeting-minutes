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
  ) {}

  async getMom(req: any) {
    const projectId = Number(req.query.project_id); // Convert project_id to number if needed

    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    const role = req.user.role;

    const roleStatusMap: Record<string, string[]> = {
      REVIEWER: ['IN_REVIEW', 'NEEDS_REVISION', 'CLOSED', 'APPROVED'],
      APPROVER: ['AWAITING_APPROVAL', 'APPROVED', 'CLOSED'],
      CLIENT: ['APPROVED', 'CLOSED'],
      VENDOR: ['APPROVED', 'CLOSED'],
      PARTICIPANT: ['APPROVED', 'CLOSED'],
    };

     // Apply status filter if role exists in the map, else return all for CREATOR & SUPER_ADMIN
  const statusFilter = roleStatusMap[role] ? { status: { in: roleStatusMap[role] } } : {};

    const where: any = {
      project_id: projectId,
      ...statusFilter,
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

    return this.MomRepository.findWithPagination(
      req.pagination,
      where,
      undefined,
      undefined,
    );
  }

  async getMomById(id: number, req: any) {
    const mom = await this.MomRepository.findFirst({
      where: { id },
      include: {created_by:true}
    });
    if (!mom) {
      throw new NotFoundException(`mom with ID ${id} not found`);
    }

    return mom;
  }

  async createMom(data, req) {
    if (req.user.role !== 'CREATOR' && req.user.role !== 'SUPER_ADMIN') {
      throw new UnauthorizedException('Only creators & admins can create mom');
    }

    // Determine status based on user role
    const status = req.user.role === 'SUPER_ADMIN' ? 'APPROVED' : 'CREATED';

    // Determine MoM number if reference_mom_id is present
    let momNumber: string | null = null;

    if (data?.reference_mom_id) {
      const lastMom = await this.MomRepository.findFirst({
        where: { project_id: data.project_id },
        orderBy: { id: 'desc' },
        select: { mom_number: true },
      });

      momNumber = lastMom
        ? (parseInt(lastMom.mom_number) + 1).toString().padStart(3, '0')
        : '001';
    }

    // Create a new MoM entry
    const createdMom = await this.MomRepository.create({
      data: {
        creator_id: req.user.userId,
        title: data.title,
        status,
        place: data.place,
        discussion: data.discussion,
        open_issues: data.open_issues,
        updates: data.updates,
        notes: data.notes,
        project_id: data.project_id,
        reference_mom_id: data.reference_mom_id,
        mom_number: momNumber,
      },
    });

    // If creator is SUPER_ADMIN, generate PDF and send email
    if (req.user.role === 'SUPER_ADMIN') {
      const creator = await this.userRepository.findFirst({
        where: { id: req.user.userId },
      });

      const project = await this.projectRepository.findFirst({
        where: { id: data.project_id },
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

      // Generate PDF
      const pdfBuffer = await this.pdfGenerationService.generateMoMPdf(
        createdMom,
        project,
      );

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
        creator,
      );
    }

    return createdMom;
  }

  async updateMom(id: number, updateMomDto: UpdateMomDto, req: any) {
    if (
      req.user.role !== 'CREATOR' &&
      req.user.role !== 'SUPER_ADMIN' &&
      req.user.role !== 'REVIEWER' &&
      req.user.role !== 'APPROVER'
    ) {
      throw new UnauthorizedException(
        'Only admins, creators, reviewers & approvers can edit mom',
      );
    }

    const updateData: any = Object.fromEntries(
      await Promise.all(
        Object.entries(updateMomDto)
          .filter(([_, value]) => value !== undefined)
          .map(async ([key, value]) => [key, value]),
      ),
    );

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
      updated_at: new Date(), // Set updated_at to current timestamp
    };

    return this.MomRepository.update({
      where: { id },
      data: validData,
    });
  }

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
    const pdfBuffer = await this.pdfGenerationService.generateMoMPdf(
      mom,
      project,
    );
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
    const usersObject = this.momUtils.getUsersByRoles(mom, ['CREATOR', 'REVIEWER' ]);

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
     const usersObject = this.momUtils.getUsersByRoles(mom, "ALL");

     // Notify all
     await this.notificationService.sendNotification(
       usersObject.map((user) => user.user_id),
       `MoM is marked as Closed`,
       mom.project_id,
       'MOM_REJECTED',
     );
    return { message: 'MoM closed and notifications sent' };
  }
}
