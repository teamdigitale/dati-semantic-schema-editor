import './rdf-properties.scss';

import { Breadcrumb, BreadcrumbItem, Icon, Spinner } from 'design-react-kit';
import { useSparqlQuery } from '../hooks/use-sparql';
import { basename } from '../utils';
import { useJsonLDContextResolver } from '../hooks';

export const RDFProperties = ({ propertyName, jsonldContext }) => {
  const { fieldUri, fieldName } = useJsonLDContextResolver(propertyName, jsonldContext);
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
    { skip: !fieldUri },
  );

  const content = data?.results?.bindings
    ? Object.fromEntries(Object.entries(data.results.bindings[0] || {}).map(([k, v]: any[]) => [k, v.value]))
    : undefined;

  const parts = [
    ...(content?.domain ? [{ title: basename(content.domain), href: content.domain.toString() }] : []),
    ...(fieldName ? [{ title: fieldName, href: fieldUri?.toString() }] : []),
  ];

  if (status === 'pending') {
    return <Spinner active small />;
  } else if (!parts?.length) {
    return null;
  }
  return (
    <div className="rdf-properties">
      <Breadcrumb>
        {parts.map((x, i) => (
          <BreadcrumbItem key={x.title}>
            <a href={x.href}>
              <Icon icon="it-link" size="xs" className="me-1" />
              {x.title}
            </a>
            {i < parts.length - 1 && <span className="separator">/</span>}
          </BreadcrumbItem>
        ))}
      </Breadcrumb>
    </div>
  );
};
