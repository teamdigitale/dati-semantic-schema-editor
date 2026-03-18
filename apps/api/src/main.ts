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

const GLOBAL_PREFIX = 'api';
const API_VERSION = '1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const configService = app.get(ConfigService<Config, true>);

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
  app.setGlobalPrefix(GLOBAL_PREFIX);

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION,
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
    `${GLOBAL_PREFIX}/v${API_VERSION}/swagger-ui`,
    app,
    document,
    {
      ui: swaggerUIEnabled,
      yamlDocumentUrl: `${GLOBAL_PREFIX}/v${API_VERSION}/openapi.yaml`,
      jsonDocumentUrl: `${GLOBAL_PREFIX}/v${API_VERSION}/openapi.json`,
    },
  );

  const port = configService.get('port', { infer: true });
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('nodeEnv', { infer: true })}`);
  logger.log(
    `Health Check: http://localhost:${port}/${GLOBAL_PREFIX}/v${API_VERSION}/status`,
  );
  if (swaggerUIEnabled) {
    logger.log(
      `Swagger UI: http://localhost:${port}/${GLOBAL_PREFIX}/v${API_VERSION}/swagger-ui`,
    );
  }
}

bootstrap().catch((error) => {
  console.error('Error starting server', error);
  process.exit(1);
});
