import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getHello(): string {
    return 'MoM Management System API is running!';
  }

  @Public()
  @Get('health')
  healthCheck(): { status: string } {
    return { status: 'OK' };
  }
}
