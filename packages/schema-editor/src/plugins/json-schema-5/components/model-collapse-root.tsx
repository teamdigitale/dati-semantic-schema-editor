import './model-collapse-root.scss';

import { Card, CardBody, Icon } from 'design-react-kit';
import { useSchemaNavigation } from '../../overview/components/Navigation';
import { useSemanticScoreColor } from '../hooks';
import { useGlobalSemanticScore } from './semantic-score';

interface Props {
  title: string;
  specPath: string[];
  schema: any;
}

export function ModelCollapseRoot({ title, specPath }: Props) {
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
  const modelScore = modelScoreEntry?.score ?? 0;
  const semanticScoreColor = useSemanticScoreColor(modelScore);
  const semanticScoreClass = modelScoreEntry ? `score-${semanticScoreColor}` : '';

  return (
    <a href="#" className="text-decoration-none" onClick={handleClick}>
      <Card className={`card-bg ${semanticScoreClass}`} spacing>
        <CardBody>
          <h5 className="big-heading d-flex justify-content-between text-primary mb-0">
            {title || 'Show'}
            <Icon icon="it-chevron-right" color="primary" />
          </h5>
        </CardBody>
      </Card>
    </a>
  );
}
