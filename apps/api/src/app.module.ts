import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { Config, configuration, validate } from './features/configs';
import { HealthModule } from './features/health';
import { LoggerModule } from './features/logger';
import { SemanticScoreModule } from './features/semantic-score';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

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
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        fallthrough: false,
      },
    }),
    SemanticScoreModule,
  ],
})
export class AppModule {}
