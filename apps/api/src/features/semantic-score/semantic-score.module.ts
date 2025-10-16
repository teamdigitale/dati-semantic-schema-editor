import { Module } from '@nestjs/common';
import { SemanticScoreController } from './semantic-score.controller';

@Module({
  controllers: [SemanticScoreController],
})
export class SemanticScoreModule {}
