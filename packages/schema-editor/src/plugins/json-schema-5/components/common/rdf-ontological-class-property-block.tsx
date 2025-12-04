import { basename } from '@teamdigitale/schema-editor-utils';
import { Icon, Spinner } from 'design-react-kit';
import { useRDFPropertyResolver } from '../../hooks';

export function RDFOntologicalClassPropertyBlock({ fieldUri }) {
  const { data, status, error } = useRDFPropertyResolver(fieldUri);

  // When the fieldUri is null, it means that it has been dis-associated from the schema. See https://www.w3.org/TR/json-ld11/#terminology
  if (!fieldUri) {
    return null;
  }

  // Pending status
  if (status === 'pending') {
    return (
      <span className="d-inline-block align-middle">
        <Spinner active small />
      </span>
    );
  }

  // Error status
  if (status === 'error') {
    return <Icon icon="it-error" color="danger" title={error} />;
  }

  // Identifier field
  if (fieldUri.startsWith('@')) {
    return <span className="rdf-ontological-class-property">[{fieldUri}]</span>;
  }

  // Not found item
  if (!data?.isFound) {
    return (
      <span
        className="rdf-ontological-class-property"
        title={`URI not found: ${fieldUri}. Do you need to disassociate it from the @context?`}
      >
        [⚠]
      </span>
    );
  }

  // Resolved item
  return (
    <span className="rdf-ontological-class-property">
      {!data.ontologicalClass && (
        <span title={`Cannot retrieve domain class for property ${fieldUri}`}>[⚠]&nbsp;</span>
      )}
      {'['}
      {data.ontologicalClass && (
        <>
          <a href={data.ontologicalClass} target="_blank" rel="noreferrer">
            {basename(data.ontologicalClass)}
          </a>
          .
        </>
      )}
      {data.ontologicalProperty && (
        <a href={data.ontologicalProperty} target="_blank" rel="noreferrer">
          {basename(data.ontologicalProperty)}
        </a>
      )}
      {']'}
    </span>
  );
}
