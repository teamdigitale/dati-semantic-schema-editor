import { Badge } from 'design-react-kit';
import { useOntoScore } from '../../hooks';

export function OntoScoreBlock({ schema, jsonldContext }) {
  const properties = schema.get('properties');
  const { score } = useOntoScore(jsonldContext, properties);

  return (
    <Badge
      color={score > 0.9 ? 'success' : score > 0.5 ? 'warning' : 'danger'}
      title='Ratio of semantic annotated properties to total properties. This is a beta feature and its implementation may change in future.'
      >
      <small>OntoScore &beta;: {score.toFixed(1)}</small>
    </Badge>
  );
}
