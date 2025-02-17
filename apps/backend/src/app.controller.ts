import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'MoM Management System API is running!';
  }

  @Get('health')
  healthCheck(): { status: string } {
    return { status: 'OK' };
  }
}
