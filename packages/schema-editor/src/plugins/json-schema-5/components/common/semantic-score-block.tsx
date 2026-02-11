import { Badge, Spinner } from 'design-react-kit';
import { Map } from 'immutable';
import { useSemanticScore, useSemanticScoreColor } from '../../hooks';

interface Props {
  dataModelKey: string;
  dataModelValue: Map<any, any>;
  jsonldContext: Map<any, any> | undefined;
}

export function SemanticScoreBlock({ dataModelKey, dataModelValue, jsonldContext }: Props) {
  const { status, error, data } = useSemanticScore(dataModelKey, dataModelValue, jsonldContext);
  const score = data?.score ?? 0;
  const rawPropertiesCount = data?.rawPropertiesCount ?? 0;
  const validPropertiesCount = data?.validPropertiesCount ?? 0;
  const semanticScoreColor = useSemanticScoreColor(score);

  return !dataModelKey || !dataModelValue ? (
    <></>
  ) : status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : status === 'error' ? (
    <Badge
      color="danger"
      title={`A beta feature showing the ratio of semantic annotated properties to total properties (-/${rawPropertiesCount}).\nERROR: ${error}.`}
    >
      <small>Semantic Score &beta;: ERROR</small>
    </Badge>
  ) : (
    <Badge
      color={semanticScoreColor}
      title={`A beta feature showing the ratio of semantic annotated properties to total properties (${validPropertiesCount}/${rawPropertiesCount}).`}
    >
      <small>Semantic Score &beta;: {score.toFixed(2)}</small>
    </Badge>
  );
}
