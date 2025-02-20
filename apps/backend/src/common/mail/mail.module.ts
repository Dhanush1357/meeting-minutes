import { Module, forwardRef } from '@nestjs/common';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from 'src/projects/projects.module';

@Module({
  imports: [ConfigModule, forwardRef(() => ProjectsModule)],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
