// Load environment variables FIRST, before any other imports
import { loadEnvironment } from './config/env.loader';
loadEnvironment();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ENV } from './common/constants/string-const';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Global CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration (only in non-production environments)
  if (process.env[ENV.NODE_ENV] !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Backend API Documentation')
      .setDescription('API description for the backend service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = process.env[ENV.PORT] || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (process.env[ENV.NODE_ENV] !== 'production') {
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/api`);
  }
}
bootstrap();
