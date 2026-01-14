import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import * as packageJson from '../package.json';
import { AppModule } from './app.module';
import { Config } from './features/configs';
import { AllExceptionsFilter, GlobalErrorDTO } from './features/exceptions';
import { LoggerService } from './features/logger';
import { API_RESPONSE_429, API_RESPONSE_DEFAULT } from './features/swagger';

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
  app.setGlobalPrefix('api', {
    exclude: ['status', 'docs'],
  });

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

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
  const swaggerEnabled =
    configService.get('nodeEnv', { infer: true }) !== 'production';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setOpenAPIVersion('3.0.3')
      .setTitle('Semantic Score Calculator')
      .setDescription(
        `## Compute the Semantic Score of an API
This API computes the semantic score of an OpenAPI specification document. It is useful to evaluate the semantic quality of an API. It can be used by developers, API consumers or API providers to improve the semantic quality of their APIs.`,
      )
      .setVersion(packageJson.version)
      .setContact(
        'Team Digitale',
        'https://teamdigitale.governo.it',
        'teamdigitale@governo.it',
      )
      .setLicense('BSD3', 'https://opensource.org/licenses/BSD-3-Clause')
      .setTermsOfService('https://schema.gov.it/note-legali')
      .addExtension(
        'x-summary',
        'API to compute the semantic score of an OpenAPI specification document.',
        'info',
      )
      .addServer('http://localhost:3000', 'Local development server')
      .addGlobalResponse(API_RESPONSE_429)
      .addGlobalResponse(API_RESPONSE_DEFAULT)
      .addTag('health', 'Know the health status of the service.')
      .addTag('semantic-score', 'Compute the semantic score.')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      extraModels: [GlobalErrorDTO],
    });
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = configService.get('port', { infer: true });
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Environment: ${configService.get('nodeEnv', { infer: true })}`);
  logger.log(`Health Check: http://localhost:${port}/status`);
  if (swaggerEnabled) {
    logger.log(`Swagger UI: http://localhost:${port}/docs`);
  }
}

bootstrap().catch((error) => {
  console.error('Error starting server', error);
  process.exit(1);
});
