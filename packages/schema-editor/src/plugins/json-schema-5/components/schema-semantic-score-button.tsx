import { Button, Icon, Spinner } from 'design-react-kit';
import { useSchemaSemanticScore, useSemanticScoreColor } from '../hooks/use-semantic-score';

export const SchemaSemanticScoreButton = ({ specSelectors }) => {
  const {
    status,
    error,
    data: { score, isUpdated },
    recalculate,
  } = useSchemaSemanticScore(specSelectors.specJson().toJS());
  const semanticScoreColor = useSemanticScoreColor(score ?? 0);

  return (
    <Button
      color={!isUpdated ? 'secondary' : error ? 'danger' : semanticScoreColor}
      size="xs"
      onClick={() => recalculate()}
      disabled={status === 'pending'}
      title={
        !isUpdated ? 'Schema Semantic Score is outdated, click to recalculate' : 'Schema Semantic Score is up to date'
      }
      className="d-flex align-items-center"
    >
      <span className="me-2">
        {status === 'pending' ? <Spinner active small /> : <Icon icon="it-refresh" size="sm" fill="currentColor" />}
      </span>
      {error ? (
        <span>Schema Semantic Score β: ERROR</span>
      ) : (
        <span>Schema Semantic Score β: {score?.toFixed(2) ?? '-'}</span>
      )}
    </Button>
  );
};
