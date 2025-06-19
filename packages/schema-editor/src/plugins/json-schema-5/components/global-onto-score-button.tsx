import { Button, Spinner } from 'design-react-kit';
import { useCallback, useMemo, useState } from 'react';
import { useConfiguration } from '../../configuration';
import { calculateGlobalOntoscore, to32CharString } from '../utils';

export const GlobalOntoScoreButton = ({ specSelectors }) => {
  const { sparqlUrl = '' } = useConfiguration();

  const [ontoscore, setOntoscore] = useState<number>(0);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);

  const specJson = useMemo(() => specSelectors.specJson().toJS(), [specSelectors.specJson().toJS()]);
  const currentHash = useMemo(() => to32CharString(JSON.stringify(specJson)), [specJson]);

  const recalculate = useCallback(async () => {
    try {
      setLoading(true);

      // Calculate global ontoscore
      const { globalOntoScore } = await calculateGlobalOntoscore(specJson, { sparqlUrl });
      setOntoscore(globalOntoScore);

      // Update hash to give a feedback to the user
      const hash = to32CharString(JSON.stringify(specJson));
      setLastHash(hash);
    } finally {
      setLoading(false);
    }
  }, [specJson, sparqlUrl]);

  const isUpdated = lastHash && currentHash && lastHash === currentHash;

  return (
    <Button
      color={isUpdated ? 'success' : 'secondary'}
      size="xs"
      onClick={recalculate}
      disabled={isLoading}
      title={isUpdated ? 'Global OntoScore is up to date' : 'Global OntoScore is outdated, click to recalculate'}
    >
      {isLoading && <Spinner active small className="me-2" />}
      <span>Global OntoScore β: {ontoscore !== null ? ontoscore.toFixed(2) : '-'}</span>
    </Button>
  );
};
