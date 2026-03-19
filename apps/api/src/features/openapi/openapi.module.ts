import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenapiService } from './openapi.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenapiService],
  exports: [OpenapiService],
})
export class OpenapiModule {}
