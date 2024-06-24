import { Spinner } from 'design-react-kit';
import { basename, useRDFOntologiesResolver } from '../../hooks';

export function RDFOntologicalClassPropertyBlock({ jsonldContext, propertyName }) {
  const { data, status } = useRDFOntologiesResolver(jsonldContext, propertyName);
  const items = [
    ...(data.ontologicalClass ? [data.ontologicalClass] : []),
    ...(data.ontologicalProperty ? [data.ontologicalProperty] : []),
  ];

  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : items?.length > 0 ? (
    <strong>
      [
      {items.map((x, i) => (
        <>
          <a key={x} href={x} target="_blank" rel="noreferrer">
            {basename(x)}
          </a>
          {i < items.length - 1 && '.'}
        </>
      ))}
      ]
    </strong>
  ) : null;
}
