import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProjectsRepository } from './projects.repository';

@Module({
  imports: [PrismaModule],
  providers: [ProjectsService, ProjectsRepository],
  controllers: [ProjectsController],
  exports: [ProjectsService],
})
export class ProjectsModule {}
