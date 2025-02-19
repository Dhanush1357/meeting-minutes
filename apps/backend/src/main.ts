import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const { useGlobalGuards } = app;
  useGlobalGuards(app.get(JwtAuthGuard));
  
  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
