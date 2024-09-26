import { Spinner } from 'design-react-kit';
import { basename, useRDFClassResolver } from '../../hooks';

export function RDFOntologicalClassBlock({ classUri }) {
  const { data, status } = useRDFClassResolver(classUri);
  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : data?.ontologicalClass ? (
    <span className="rdf-ontological-class-property">
      [
        <>
          <a key={data?.ontologicalClass} href={data?.ontologicalClass} target="_blank" rel="noreferrer"
          title={data?.ontologicalClassComment}>
            {basename(data?.ontologicalClass)}
          </a>
        </>
      ]

    </span>
  ) : classUri ? <><span title="URI not found.">⚠</span></> : null;
}
