import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateSchemaSemanticScore,
  InClientCache,
  SemanticScoreSummary,
  setCacheService,
  validateJsonldContext,
} from '@teamdigitale/schema-editor-utils';
import { fromJS } from 'immutable';
import { Config } from '../configs';

@Injectable()
export class SemanticScoreService {
  private readonly logger: Logger = new Logger(SemanticScoreService.name);
  private readonly cache: InClientCache<Promise<string[]>>;

  constructor(
    @Inject(ConfigService) private configService: ConfigService<Config, true>,
  ) {
    const sparqlCacheTTL = this.configService.get<number>('sparqlCacheTTL');
    this.cache = new InClientCache<Promise<string[]>>({ ttl: sparqlCacheTTL });
    setCacheService(this.cache);
  }

  onDestroy() {
    this.cache.destroy();
  }

  async validateJsonldContext(specJson: object) {
    this.logger.debug('Validating schema');
    const issues = await validateJsonldContext(fromJS(specJson));
    const errors = issues.filter((x) => x.level === 'error');
    if (errors.length > 0) {
      this.logger.debug(
        `${errors.length} JSON-LD context validation errors found`,
      );
    } else {
      this.logger.debug(`Schema validated successfully`);
    }
    return errors;
  }

  async calculateSchemaSemanticScore(
    specJson: object,
  ): Promise<{ schemaSemanticScore: number; summary: SemanticScoreSummary }> {
    this.logger.debug('Calculating schema semantic score');
    const sparqlUrl = this.configService.get('sparqlUrl', { infer: true });
    const result = await calculateSchemaSemanticScore(specJson, { sparqlUrl });
    this.logger.debug(
      `Schema semantic score calculated successfully. Calculated value: ${result.schemaSemanticScore.toFixed(2)}`,
    );
    return result;
  }
}
