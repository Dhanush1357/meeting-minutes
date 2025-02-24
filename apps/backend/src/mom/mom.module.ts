import { Module } from '@nestjs/common';
import { MomService } from './mom.service';
import { MomController } from './mom.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MomRepository } from './mom.repository';
import { PdfGenerationService } from 'src/common/pdf/pdf-generation.service';
import { MailModule } from 'src/common/mail/mail.module';
import { MailService } from 'src/common/mail/mail.service';
import { UsersRepository } from 'src/users/users.repository';
import { ProjectsRepository } from 'src/projects/projects.repository';
import { MomUtils } from './utils';
import { ProjectUtils } from 'src/projects/utils';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [
    MomService,
    MomRepository,
    PdfGenerationService,
    UsersRepository,
    ProjectsRepository,
    MomUtils,
    ProjectUtils
  ],
  controllers: [MomController],
  exports: [MomService],
})
export class MomModule {}
