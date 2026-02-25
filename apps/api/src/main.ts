import {
  ClassSerializerInterceptor,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
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
  const swaggerEnabled =
    configService.get('nodeEnv', { infer: true }) !== 'production';
  if (swaggerEnabled) {
    const config = new DocumentBuilder()
      .setOpenAPIVersion('3.0.3')
      .setTitle('Semantic Score Calculator')
      .setDescription(
        `## 🇬🇧 Compute the Semantic Score of an API

This API computes the semantic score of an OpenAPI specification document
looking at the mapping between RDF properties and JSON Schema properties
defined via the \`x-jsonld-context\` OpenAPI 3.0 keyword.

The Semantic Score is a value between 0 and 1, providing
a synthetic indicator of the compliance of a data model
to a given set of semantic assets published via schema.gov.it

It can be used by developers, API consumers or API providers
to get insights on the data models used in their APIs
and improve its semantic quality.

For further information on mapping JSON Schema properties
to RDF properties, see [REST API Linked Data Keywords](https://datatracker.ietf.org/doc/draft-polli-restapi-ld-keywords/).

This API is associated with the Schema Editor provided by schema.gov.it
at <https://teamdigitale.github.io/dati-semantic-schema-editor/latest/>

## 🇮🇹 Calcola il Semantic Score di una API

Questa API calcola il punteggio semantico di un documento OpenAPI 3.0
guardando il mapping tra proprietà RDF e proprietà JSON Schema
definite tramite la keyword \`x-jsonld-context\` OpenAPI 3.0.

Il Semantic Score è un valore decimale incluso tra 0 e 1,
calcolato come rapporto tra il numero di proprietà semantiche risolte
sui contenuti del Catalogo e quelle totali presenti nel file di definizione degli schemi dati.

Può essere utilizzato da sviluppatori, consumatori e provider di API
per ottenere informazioni sulle modalità di utilizzo dei modelli di dati
e migliorare la qualità semantica delle API.

Per ulteriori informazioni sul mapping tra proprietà JSON Schema e proprietà RDF,
vedere [REST API Linked Data Keywords](https://datatracker.ietf.org/doc/draft-polli-restapi-ld-keywords/).

Questa API è associata all'Editor di Schemi Dati fornito da schema.gov.it
all'indirizzo <https://teamdigitale.github.io/dati-semantic-schema-editor/latest/>`,
      )
      .setVersion(packageJson.version)
      .setContact(
        'Team Digitale',
        'https://teamdigitale.governo.it',
        'teamdigitale@governo.it',
      )
      .setLicense('Apache-2.0', 'https://opensource.org/licenses/Apache-2.0')
      .setTermsOfService('https://schema.gov.it/note-legali')
      .addExtension(
        'x-summary',
        'API to compute the semantic score of an OpenAPI specification document.',
        'info',
      )
      .addServer('http://localhost:3000', 'Local development server')
      .addServer(
        'https://schema-editor-api-ndc-dev.apps.cloudpub.testedev.istat.it/',
        'Public development server',
      )
      .addGlobalResponse(API_RESPONSE_429)
      .addGlobalResponse(API_RESPONSE_DEFAULT)
      .addTag('Health', 'Know the health status of the service.')
      .addTag('SemanticScore', 'Compute the semantic score.')
      .build();

    const document = SwaggerModule.createDocument(app, config, {
      autoTagControllers: true,
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
