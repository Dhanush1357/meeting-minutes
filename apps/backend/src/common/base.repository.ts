import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { PaginationDto } from './pagination/dto/pagination.dto';

@Injectable()
export class BaseRepository {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: string,
  ) {}

  /**
   * Finds items with pagination.
   *
   * @param pagination - pagination options
   * @param where - filter items by this condition
   * @param select - select specific columns
   * @param include - include related items
   * @returns paginated items with meta information
   */
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
      orderBy: sortBy ? { [sortBy]: sortOrder } : { created_at: 'desc' },
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

  /**
   * Retrieve a single record matching the given params.
   *
   * @param params - The `prisma findFirst` method options.
   * @returns The found record or null if no record matches the given params.
   */
  async findFirst(params: any) {
    return this.prisma[this.model].findFirst(params);
  }

  /**
   * Create a single record.
   *
   * @param params - The `prisma create` method options.
   * @returns The created record.
   */
  async create(params: any) {
    return this.prisma[this.model].create(params);
  }

  /**
   * Update a single record.
   *
   * @param params - The `prisma update` method options.
   * @returns The updated record.
   */
  async update(params: any) {
    return this.prisma[this.model].update(params);
  }

  /**
   * Recursively removes all undefined, null, and empty string values from an object or array.
   * @param obj - The object or array to clean.
   * @returns A new object or array with all unwanted values removed.
   */
  async cleanObject(obj: any): Promise<any> {
    if (Array.isArray(obj)) {
      // Clean each element in the array and remove empty elements
      const cleanedArray = await Promise.all(
        obj.map(async (item) => this.cleanObject(item)),
      );
      return cleanedArray.filter(
        (item) => item !== undefined && item !== null && item !== '',
      );
    } else if (obj !== null && typeof obj === 'object') {
      // Clean each property of the object recursively
      return Object.fromEntries(
        await Promise.all(
          Object.entries(obj)
            .filter(
              ([_, value]) =>
                value !== undefined && value !== null && value !== '',
            )
            .map(async ([key, value]) => [key, await this.cleanObject(value)]),
        ),
      );
    }
    return obj;
  }
}
