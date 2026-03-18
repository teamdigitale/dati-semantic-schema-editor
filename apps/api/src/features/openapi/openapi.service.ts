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

    const templatePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'public',
      'openapi.template.yaml',
    );
    this.logger.debug(`Template path: ${templatePath}`);
    let rawYaml = readFileSync(templatePath, 'utf8');

    const basePath = this.configService.get('basePath', { infer: true });
    rawYaml = rawYaml
      .replace('version: 0.0.1', `version: ${packageJson.version}`)
      .replace('https://example.com', basePath);

    return yaml.parse(rawYaml) as OpenAPIObject;
  }
}
