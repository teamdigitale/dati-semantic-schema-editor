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

  purgeJsonldContextNullProperties(specJson: object): object {
    if (typeof specJson !== 'object' || specJson === null) {
      return specJson;
    }

    // Helper to recursively traverse and replace
    const traverse = (value: object): object => {
      if (Array.isArray(value)) {
        return value.map(traverse);
      } else if (typeof value === 'object' && value !== null) {
        const newObj: object = {};
        for (const key of Object.keys(value)) {
          if (key === 'x-jsonld-context' && value[key] === null) {
            newObj[key] = undefined;
          } else {
            newObj[key] = traverse(value[key]);
          }
        }
        return newObj;
      }
      return value;
    };

    return traverse(specJson);
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
