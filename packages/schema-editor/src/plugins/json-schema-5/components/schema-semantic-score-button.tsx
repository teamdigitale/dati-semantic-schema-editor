import { Button, Icon, Spinner } from 'design-react-kit';
import { useSemanticScoreColor } from '../hooks/use-semantic-score';
import { useGlobalSemanticScore } from './semantic-score';

export const SchemaSemanticScoreButton = () => {
  const { data, status, error, calculate } = useGlobalSemanticScore();
  const score = data?.score;
  const semanticScoreColor = useSemanticScoreColor(score ?? 0);
  const scoreLabel = error ? 'ERROR' : (score?.toFixed(2) ?? '-');

  return (
    <Button
      color={status === 'pending' ? 'secondary' : error ? 'danger' : semanticScoreColor}
      size="xs"
      onClick={() => calculate()}
      disabled={status === 'pending'}
      title={
        status === 'idle' || status === 'error'
          ? 'Schema Semantic Score is outdated, click to recalculate'
          : 'Schema Semantic Score is up to date'
      }
      className="d-flex align-items-center"
    >
      <span className="me-2">
        {status === 'pending' ? <Spinner active small /> : <Icon icon="it-refresh" size="sm" fill="currentColor" />}
      </span>
      <span>Schema Semantic Score β: {scoreLabel}</span>
    </Button>
  );
};
