import { Module } from '@nestjs/common';
import { SemanticScoreController } from './semantic-score.controller';
import { SemanticScoreService } from './semantic-score.service';

@Module({
  controllers: [SemanticScoreController],
  providers: [SemanticScoreService],
})
export class SemanticScoreModule {}
