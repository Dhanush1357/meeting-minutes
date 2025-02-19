import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ProjectsModule } from './projects/projects.module';
import { PaginationInterceptor } from './common/pagination/pagination.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MomModule } from './mom/mom.module';
import { NotificationsModule } from './common/notification/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available throughout the app
    }),
    AuthModule,
    UsersModule,
    ProjectsModule,
    MomModule,
    NotificationsModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: PaginationInterceptor,
    },
  ],
  controllers: [AppController],
})
export class AppModule {}
