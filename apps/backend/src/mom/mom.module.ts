import { Module } from '@nestjs/common';
import { MomService } from './mom.service';
import { MomController } from './mom.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MomRepository } from './mom.repository';

@Module({
  imports: [PrismaModule],
  providers: [MomService, MomRepository],
  controllers: [MomController],
  exports: [MomService],
})
export class MomModule {}
