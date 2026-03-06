import { useContext } from 'react';
import { SemanticScoreContext } from './context';
import { ISemanticScoreContext } from './semantic-score-context';

export const useGlobalSemanticScore = (): ISemanticScoreContext => useContext(SemanticScoreContext);
