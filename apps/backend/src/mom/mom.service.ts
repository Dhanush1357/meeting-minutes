import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { MomRepository } from './mom.repository';
import { UpdateMomDto } from './dto/update-mom.dto';
import { pick } from 'lodash';

@Injectable()
export class MomService {
  constructor(private readonly MomRepository: MomRepository) {}

  async getMom(req: any) {
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
    return await this.MomRepository.create({
      data: {
        creator_id: req.user.id,
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
        'status',
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
}
