import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from './pagination/dto/pagination.dto';

@Injectable()
export class BaseRepository {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: string,
  ) {}

  async findWithPagination(
    pagination: PaginationDto,
    where: any = {},
    select: any = undefined,
    include: any = undefined,
  ) {
    const { page, limit, sortBy, sortOrder, search } = pagination;

    const skip = (page - 1) * limit;

    const queryOptions: any = {
      where,
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortOrder } : undefined,
    };
  
    // Conditionally add `select` or `include` but not both
    if (include) {
      queryOptions.include = include;
    } else if (select) {
      queryOptions.select = select;
    }

    // Execute queries in parallel for better performance
    const [total, items] = await Promise.all([
      this.prisma[this.model].count({ where }),
      this.prisma[this.model].findMany(queryOptions),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findFirst(params: any) {
    return this.prisma[this.model].findFirst(params);
  }

  async create(params: any) {
    return this.prisma[this.model].create(params);
  }

  async update(params: any) {
    return this.prisma[this.model].update(params);
  }
}