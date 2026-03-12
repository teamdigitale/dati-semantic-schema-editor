import { SemanticScoreSummary } from '@teamdigitale/schema-editor-utils';
import { AsyncState } from '../../models';

export type ISemanticScoreContext = AsyncState<SemanticScoreSummary> & {
  calculate: () => Promise<void>;
};
