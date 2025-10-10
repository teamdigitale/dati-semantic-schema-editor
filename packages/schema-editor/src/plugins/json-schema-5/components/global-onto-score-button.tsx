import { Button, Icon, Spinner } from 'design-react-kit';
import { useGlobalSemanticScore, useSemanticScoreColor } from '../hooks/use-onto-score';

export const GlobalSemanticScoreButton = ({ specSelectors }) => {
  const {
    status,
    error,
    data: { score, isUpdated },
    recalculate,
  } = useGlobalSemanticScore(specSelectors.specJson().toJS());
  const semanticScoreColor = useSemanticScoreColor(score ?? 0);

  return (
    <Button
      color={!isUpdated ? 'secondary' : error ? 'danger' : semanticScoreColor}
      size="xs"
      onClick={() => recalculate()}
      disabled={status === 'pending'}
      title={
        !isUpdated ? 'Global Semantic Score is outdated, click to recalculate' : 'Global Semantic Score is up to date'
      }
      className="d-flex align-items-center"
    >
      <span className="me-2">
        {status === 'pending' ? <Spinner active small /> : <Icon icon="it-refresh" size="sm" fill="currentColor" />}
      </span>
      {error ? (
        <span>Global Semantic Score β: ERROR</span>
      ) : (
        <span>Global Semantic Score β: {score?.toFixed(2) ?? '-'}</span>
      )}
    </Button>
  );
};
