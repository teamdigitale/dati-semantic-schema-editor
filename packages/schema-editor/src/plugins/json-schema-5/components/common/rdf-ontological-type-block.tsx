import { Badge } from 'design-react-kit';
import { basename, useJsonLDResolver, useRDFOntologiesResolver } from '../../hooks';

export const RDFOntologicalTypeBlock = ({ propertyName, jsonldContext, className }) => {
  const { data: jsonLDResolverResult } = useJsonLDResolver(jsonldContext, [propertyName]);
  const { data } = useRDFOntologiesResolver(jsonLDResolverResult?.fieldUri);

  return data?.ontologicalType ? (
    <Badge color="primary" href={data?.ontologicalType} target="_blank" rel="noreferrer" className={className}>
      {basename(data?.ontologicalType)}
    </Badge>
  ) : null;
};
