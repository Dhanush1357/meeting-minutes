import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Prisma module to access database
  providers: [DashboardService], // Dashboard service to handle logic
  controllers: [DashboardController], // Dashboard controller to handle incoming requests
})
export class DashboardModule {}
