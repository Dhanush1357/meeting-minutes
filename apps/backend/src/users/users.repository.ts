import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/base.repository';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma, 'user');
  }
}