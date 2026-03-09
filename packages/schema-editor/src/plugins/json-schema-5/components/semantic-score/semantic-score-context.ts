import { SemanticScoreSummary } from '@teamdigitale/schema-editor-utils';
import { AsyncState } from '../../models';

export interface ISemanticScoreContext extends AsyncState<SemanticScoreSummary> {
  calculate: () => Promise<void>;
}
