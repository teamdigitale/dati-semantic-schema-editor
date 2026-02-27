import { createContext } from 'react';
import { ISemanticScoreContext } from './semantic-score-context';

export const SemanticScoreContext = createContext<ISemanticScoreContext>(null as never);
