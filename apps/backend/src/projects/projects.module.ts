import { forwardRef, Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { ProjectsRepository } from './projects.repository';
import { MailModule } from 'src/common/mail/mail.module';
import { ProjectUtils } from './utils';

@Module({
  imports: [PrismaModule, forwardRef(() => MailModule)],
  providers: [ProjectsService, ProjectsRepository, ProjectUtils],
  controllers: [ProjectsController],
  exports: [ProjectsService, ProjectUtils],
})
export class ProjectsModule {}
