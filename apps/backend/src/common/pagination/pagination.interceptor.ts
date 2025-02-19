import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PaginationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { query } = request;

    // Create pagination options
    const paginationDto = new PaginationDto();
    paginationDto.page = parseInt(query.page) || 1;
    paginationDto.limit = parseInt(query.limit) || 10;
    paginationDto.sortBy = query.sortBy;
    paginationDto.sortOrder = query.sortOrder?.toLowerCase() as 'asc' | 'desc';
    paginationDto.search = query.search;

    // Attach pagination to request
    request.pagination = paginationDto;

    return next.handle();
  }
}