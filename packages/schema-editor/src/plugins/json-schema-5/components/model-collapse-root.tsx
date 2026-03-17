import './model-collapse-root.scss';

import { Card, CardBody, Icon, UncontrolledTooltip } from 'design-react-kit';
import { useRef } from 'react';
import { useSchemaNavigation } from '../../overview/components/Navigation';
import { useSemanticScoreColor } from '../hooks';
import { useGlobalSemanticScore } from './semantic-score';

interface Props {
  title: string;
  specPath: string[];
  schema: any;
}

export function ModelCollapseRoot({ title, specPath }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { push } = useSchemaNavigation();
  const { data: semanticData } = useGlobalSemanticScore();
  const specPathArray: string[] = specPath ? Array.from(specPath) : [];

  const handleClick = (): void => {
    push({
      id: specPathArray.join('-'),
      title,
      fullPath: specPathArray,
    });
  };

  const name = title;
  const modelScoreEntry = semanticData?.models.find((m) => m.name === name);
  const modelScore = modelScoreEntry?.score;
  const semanticScoreColor = useSemanticScoreColor(modelScore ?? 0);
  const semanticScoreClass = modelScoreEntry ? `score-${semanticScoreColor}` : 'score-none';

  const SemanticScoreTooltip = () => (
    <UncontrolledTooltip placement="top" target={ref}>
      {modelScore !== undefined ? (
        <>
          <strong>Semantic score: {modelScore?.toFixed(2)}</strong>
          <br />
          Indicates the completeness of semantic annotations.
        </>
      ) : (
        <>
          <strong>Semantic score not available</strong>
          <br />
          Scores are calculated only for schema elements of type object.
        </>
      )}
    </UncontrolledTooltip>
  );

  return (
    <a href="#" className="text-decoration-none" onClick={handleClick}>
      <Card className="card-bg" spacing>
        <div ref={ref} className={`model-border ${semanticScoreClass}`}></div>
        <CardBody>
          <h5 className="big-heading d-flex justify-content-between text-primary mb-0">
            <span className="text-truncate">{title || 'Show'}</span>
            <Icon icon="it-chevron-right" color="primary" />
          </h5>
        </CardBody>
      </Card>
      <SemanticScoreTooltip />
    </a>
  );
}
