import { Card, CardBody, Icon } from 'design-react-kit';
import { useSchemaNavigation } from '../../overview/components/Navigation';

import './model-collapse-root.scss';

interface Props {
  title: string;
  specPath: string[];
  schema: any;
}

export function ModelCollapseRoot({ title, specPath }: Props) {
  const { push } = useSchemaNavigation();
  const specPathArray: string[] = specPath ? Array.from(specPath) : [];

  const handleClick = (): void => {
    push({
      id: specPathArray.join('-'),
      title,
      fullPath: specPathArray,
    });
  };

  return (
    <a href="#" className="text-decoration-none" onClick={handleClick}>
      <Card className="card-bg" spacing>
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
