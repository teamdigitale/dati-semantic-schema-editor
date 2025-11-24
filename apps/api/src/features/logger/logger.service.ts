import {
  Inject,
  Injectable,
  LoggerService as NestLoggerService,
} from '@nestjs/common';
import { type Logger, createLogger, format, transports } from 'winston';
import { MODULE_OPTIONS_TOKEN } from './logger.module-definition';
import { LoggerModuleOptions } from './logger.options';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly winstonLogger: Logger;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private readonly options: LoggerModuleOptions,
  ) {
    const date = new Date();

    this.winstonLogger = createLogger({
      level: this.options.level || 'debug',
      format: format.combine(
        format.label({ label: 'semantic-score' }),
        format.timestamp(),
        format.printf((x) => {
          return `${x.timestamp} [${x.label}] ${x.level?.toUpperCase().padEnd(5)} ${x.message}${x.stack ? ' - ' + x.stack : ''}`;
        }),
        format.colorize({ all: true }),
      ),
      transports: [
        ...(this.options.writeOutput
          ? [
              new transports.File({
                filename:
                  'logger_' + date.getMonth() + '-' + date.getDate() + '.log',
              }),
              new transports.File({
                level: 'error',
                filename:
                  'error_' + date.getMonth() + '-' + date.getDate() + '.log',
              }),
            ]
          : []),
        new transports.Console(),
      ],
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.winstonLogger.info(message, ...optionalParams);
  }
  error(message: any, ...optionalParams: any[]) {
    this.winstonLogger.error(message, ...optionalParams);
  }
  warn(message: any, ...optionalParams: any[]) {
    this.winstonLogger.warn(message, ...optionalParams);
  }
  debug(message: any, ...optionalParams: any[]) {
    this.winstonLogger.debug(message, ...optionalParams);
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.winstonLogger.verbose(message, ...optionalParams);
  }
  fatal(message: any, ...optionalParams: any[]) {
    this.winstonLogger.log('fatal', message, ...optionalParams);
  }
}
