import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { Config, configuration, validate } from './features/configs';
import { HealthModule } from './features/health';
import { LoggerModule } from './features/logger';
import { OpenapiModule } from './features/openapi';
import { SemanticScoreModule } from './features/semantic-score';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      load: [configuration],
      validate,
    }),
    LoggerModule.forRoot({
      level: 'debug',
      writeOutput: process.env.NODE_ENV === 'production',
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<Config, true>) => ({
        throttlers: [
          {
            ttl: configService.get('throttleTTL', { infer: true }),
            limit: configService.get('throttleLimit', { infer: true }),
          },
        ],
      }),
    }),
    HealthModule,
    OpenapiModule,
    SemanticScoreModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
