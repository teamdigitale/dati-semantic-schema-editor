import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  calculateSchemaSemanticScore,
  InClientCache,
  setCacheService,
  SemanticScoreSummary,
} from '@teamdigitale/schema-editor-utils';
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

  async calculateSchemaSemanticScore(
    specJson: any,
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
