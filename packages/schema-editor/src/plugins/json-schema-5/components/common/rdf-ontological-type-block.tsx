import { Badge } from 'design-react-kit';
import { basename, useRDFOntologiesResolver } from '../../hooks';

export const RDFOntologicalTypeBlock = ({ propertyName, jsonldContext, className }) => {
  const { data } = useRDFOntologiesResolver(jsonldContext, propertyName);

  return data?.ontologicalType ? (
    <Badge color="primary" href={data?.ontologicalType} target="_blank" rel="noreferrer" className={className}>
      {basename(data?.ontologicalType)}
    </Badge>
  ) : null;
};
