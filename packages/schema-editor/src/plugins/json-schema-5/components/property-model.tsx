import { Badge, Spinner } from 'design-react-kit';
import { useSparqlQuery } from '../hooks/use-sparql';
import { basename } from '../utils';

export const PropertyModel = ({ fieldUri, fieldName }) => {
  const { data, status } = useSparqlQuery(
    `
    prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

    select distinct * where {
      <${fieldUri}>
        rdfs:domain ?domain ;
        rdfs:range ?class
      .
    }
  `,
  );
  const content = data?.results?.bindings
    ? Object.fromEntries(Object.entries(data.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  return status === 'pending' ? (
    <Spinner active small />
  ) : content ? (
    <>
      {!!content.domain && (
        <Badge color="primary" href={content.domain.toString()} target="_blank" rel="noreferrer" className="me-1">
          {basename(content.domain)}
        </Badge>
      )}

      <Badge color="secondary" href={fieldUri.toString()} target="_blank" rel="noreferrer" className="me-1">
        {fieldName.toString()}
      </Badge>

      {!!content.class && (
        <Badge color="success" href={content.class.toString()} target="_blank" rel="noreferrer" className="me-1">
          {basename(content.class)}
        </Badge>
      )}
    </>
  ) : null;
};
