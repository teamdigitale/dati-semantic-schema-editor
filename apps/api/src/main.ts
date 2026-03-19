import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Config } from './features/configs';
import { AllExceptionsFilter } from './features/exceptions';
import { LoggerService } from './features/logger';
import { OpenapiService } from './features/openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService<Config, true>);
  const globalPrefix = configService.get('globalPrefix', { infer: true });
  const apiVersion = configService.get('apiVersion', { infer: true });
  const port = configService.get('port', { infer: true });

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: configService.get('corsOrigin', { infer: true }),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global prefix for API
  app.setGlobalPrefix(globalPrefix);

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
  });

  // Global serializer interceptor
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages:
        configService.get('nodeEnv', { infer: true }) === 'production',
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Graceful shutdown hooks
  app.enableShutdownHooks();

  // Swagger documentation
  const swaggerUIEnabled =
    configService.get('nodeEnv', { infer: true }) !== 'production';
  const openapiService = app.get(OpenapiService);
  const document = openapiService.getOpenApiDocument();
  SwaggerModule.setup(
    `${globalPrefix}/v${apiVersion}/swagger-ui`,
    app,
    document,
    {
      ui: swaggerUIEnabled,
      yamlDocumentUrl: `${globalPrefix}/v${apiVersion}/openapi.yaml`,
      jsonDocumentUrl: `${globalPrefix}/v${apiVersion}/openapi.json`,
    },
  );

  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('nodeEnv', { infer: true })}`);
  logger.log(
    `Health Check: http://localhost:${port}/${globalPrefix}/v${apiVersion}/status`,
  );
  if (swaggerUIEnabled) {
    logger.log(
      `Swagger UI: http://localhost:${port}/${globalPrefix}/v${apiVersion}/swagger-ui`,
    );
  }
}

bootstrap().catch((error) => {
  console.error('Error starting server', error);
  process.exit(1);
});
