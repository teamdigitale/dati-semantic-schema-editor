import type { LogLevel } from '@nestjs/common';

export interface LoggerModuleOptions {
  level?: LogLevel;
  writeOutput?: boolean;
}
