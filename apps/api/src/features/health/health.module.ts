import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
