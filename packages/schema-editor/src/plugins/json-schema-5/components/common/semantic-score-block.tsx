import { Badge, Spinner } from 'design-react-kit';
import { Map } from 'immutable';
import { useSemanticScore, useSemanticScoreColor } from '../../hooks';

interface Props {
  jsonldContext: Map<string, any> | undefined;
  propertiesPaths: string[][] | undefined;
}

export function SemanticScoreBlock({ jsonldContext, propertiesPaths }: Props) {
  const {
    status,
    error,
    data: { rawPropertiesCount, semanticPropertiesCount, score },
  } = useSemanticScore(jsonldContext, propertiesPaths);
  const semanticScoreColor = useSemanticScoreColor(score ?? 0);

  return !jsonldContext || !propertiesPaths ? (
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
      title={`A beta feature showing the ratio of semantic annotated properties to total properties (${semanticPropertiesCount}/${rawPropertiesCount}).`}
    >
      <small>Semantic Score &beta;: {score.toFixed(2)}</small>
    </Badge>
  );
}
