// Load environment variables FIRST, before any other imports
import { loadEnvironment } from './config/env.loader';
loadEnvironment();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ENV } from './common/constants/string-const';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // Cookie parser middleware
  app.use(cookieParser());

  // Global CORS
  const nodeEnv = process.env[ENV.NODE_ENV] ?? 'development';
  const isProd = nodeEnv === 'production';
  if (nodeEnv === 'development') {
    // Allow all origins in development (echoes request origin, supports credentials)
    app.enableCors({
      origin: true,
      credentials: true,
    });
  } else if (isProd) {
    // Restrict to FRONTEND_URL in production
    const frontendUrl = process.env[ENV.FRONTEND_URL];
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL must be set when NODE_ENV=production');
    }
    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });
  } else {
    // For other environments, default to FRONTEND_URL if provided, otherwise throw
    const frontendUrl = process.env[ENV.FRONTEND_URL];
    if (!frontendUrl) {
      throw new Error(`FRONTEND_URL must be set when NODE_ENV=${nodeEnv}`);
    }
    app.enableCors({
      origin: frontendUrl,
      credentials: true,
    });
  }

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger configuration (only in non-production environments unless explicitly disabled)
    const swaggerEnabled = (process.env[ENV.SWAGGER_ENABLED] ?? 'true').toString() === 'true';
  if (!isProd && swaggerEnabled) {
    const swaggerUser = process.env[ENV.SWAGGER_USER];
    const swaggerPassword = process.env[ENV.SWAGGER_PASSWORD];

    // Optional basic auth protection for Swagger UI if credentials provided
    if (swaggerUser && swaggerPassword) {
      app.use(['/api/docs', '/api-json'], basicAuth({
        users: { [swaggerUser]: swaggerPassword },
        challenge: true,
      }));
    }

    const config = new DocumentBuilder()
      .setTitle('Backend API Documentation')
      .setDescription('API description for the backend service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);

    // UI configuration to improve developer experience
    const deepLinking = (process.env[ENV.SWAGGER_UI_DEEP_LINKING] ?? 'true').toString() === 'true';
    const docExpansion = (process.env[ENV.SWAGGER_UI_DOC_EXPANSION] ?? 'none').toString() as 'list' | 'full' | 'none';
    const filterEnv = process.env[ENV.SWAGGER_UI_FILTER];
    const filter = filterEnv === undefined ? true : (filterEnv === 'true' ? true : (filterEnv === 'false' ? false : filterEnv));

    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        deepLinking,
        docExpansion,
        filter,
        displayRequestDuration: true,
        tryItOutEnabled: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        defaultModelsExpandDepth: -1,
      },
      customSiteTitle: 'Backend API Docs',
    });
  }

  const port = process.env[ENV.PORT] || 3000;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (!isProd && swaggerEnabled) {
    console.log(`📚 Swagger documentation available at: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
