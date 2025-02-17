import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // This route will return the metrics (e.g., total number of projects and users)
  @Get('metrics')
  async getMetrics() {
    return this.dashboardService.getMetrics();
  }
}
