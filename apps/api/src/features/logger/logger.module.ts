import { Global, Module } from '@nestjs/common';
import { ConfigurableModuleClass } from './logger.module-definition';
import { LoggerService } from './logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule extends ConfigurableModuleClass {}
