import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAPIObject } from '@nestjs/swagger';
import * as yaml from 'yaml';
import * as packageJson from '../../../package.json';
import { Config } from '../configs';
import { readFileSync } from 'fs';
import { join } from 'path';

export class OpenapiService {
  private readonly logger: Logger = new Logger(OpenapiService.name);

  constructor(
    @Inject(ConfigService) private configService: ConfigService<Config, true>,
  ) {}

  getOpenApiDocument() {
    this.logger.debug('Reading OpenAPI template document');

    const serverUrl = this.configService.get('serverUrl', { infer: true });
    const isDevelopmentServer = serverUrl.includes('localhost');
    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'public',
      'openapi.template.yaml',
    );
    this.logger.debug(`Template path: ${templatePath}`);

    const rawYaml = readFileSync(templatePath, 'utf8');
    const yamlObject: OpenAPIObject = yaml.parse(rawYaml);
    yamlObject.info.version = packageJson.version;
    yamlObject.servers![1] = {
      url: `${serverUrl}/api/v1`,
      description: isDevelopmentServer
        ? 'Local development server'
        : 'Public server',
      // @ts-expect-error - x-sandbox is not a valid property of ServerObject
      'x-sandbox': isDevelopmentServer,
    };

    return yamlObject;
  }
}
