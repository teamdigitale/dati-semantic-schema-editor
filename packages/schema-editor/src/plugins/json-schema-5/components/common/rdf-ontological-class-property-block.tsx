import { Spinner } from 'design-react-kit';
import { basename, useRDFPropertyResolver as useRDFPropertyResolver } from '../../hooks';

export function RDFOntologicalClassPropertyBlock({ fieldUri }) {
  const { data, status } = useRDFPropertyResolver(fieldUri);

  if (status === 'pending') {
    return (
      <span className="d-inline-block align-middle">
        <Spinner active small />
      </span>
    );
  }

  if (!data?.ontologicalClass) {
    return null;
  }

  const rdfProperty = (
    <>
      <a href={data.ontologicalClass} target='_blank' rel='noreferrer'>
        {basename(data.ontologicalClass)}
      </a>
      {data.ontologicalProperty && (
        <>
          .
          <a href={data.ontologicalProperty} target='_blank' rel='noreferrer'>
            {basename(data.ontologicalProperty)}
          </a>
        </>
      )}
    </>
  );

  return (
    <>
    <span
      className="rdf-ontological-class-property"
      style={{ textDecoration: rdfProperty ? 'underline dotted' : 'none' }}
    >
      [{rdfProperty}]
    </span>
    <span
      className="rdf-ontological-class-property ms-2 badge bg-primary"
      >
        <br />
        {data?.ontologicalPropertyComment}
      </span>
    </>
  );
}
