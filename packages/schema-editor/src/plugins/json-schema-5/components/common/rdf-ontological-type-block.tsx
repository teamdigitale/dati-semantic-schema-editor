import { Badge } from 'design-react-kit';
import { useJsonLDResolver, useRDFPropertyResolver } from '../../hooks';
import { basename } from '../../utils';

export const RDFOntologicalTypeBlock = ({ propertyName, jsonldContext, className }) => {
  const { data: jsonLDResolverResult } = useJsonLDResolver(jsonldContext, [propertyName]);
  const { data } = useRDFPropertyResolver(jsonLDResolverResult?.fieldUri);

  return data?.ontologicalType ? (
    <Badge color="primary" href={data?.ontologicalType} target="_blank" rel="noreferrer" className={className}>
      {basename(data?.ontologicalType)}
    </Badge>
  ) : null;
};
