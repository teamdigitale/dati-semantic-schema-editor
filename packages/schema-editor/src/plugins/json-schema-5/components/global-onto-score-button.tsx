import { Button, Icon, Spinner } from 'design-react-kit';
import { useGlobalOntoScore, useOntoScoreColor } from '../hooks/use-onto-score';

export const GlobalOntoScoreButton = ({ specSelectors }) => {
  const {
    status,
    error,
    data: { score, isUpdated },
    recalculate,
  } = useGlobalOntoScore(specSelectors.specJson().toJS());
  const ontoscoreColor = useOntoScoreColor(score ?? 0);

  return (
    <Button
      color={!isUpdated ? 'secondary' : error ? 'danger' : ontoscoreColor}
      size="xs"
      onClick={() => recalculate()}
      disabled={status === 'pending'}
      title={!isUpdated ? 'Global OntoScore is outdated, click to recalculate' : 'Global OntoScore is up to date'}
      className="d-flex align-items-center"
    >
      <span className="me-2">
        {status === 'pending' ? <Spinner active small /> : <Icon icon="it-refresh" size="sm" fill="currentColor" />}
      </span>
      {error ? <span>Global OntoScore β: ERROR</span> : <span>Global OntoScore β: {score?.toFixed(2) ?? '-'}</span>}
    </Button>
  );
};
