import { Icon, Spinner } from 'design-react-kit';
import { basename, useRDFClassResolver } from '../../hooks';
import { isUri } from '../../utils';

export function RDFOntologicalClassBlock({ classUri }) {
  const { data, status, error } = useRDFClassResolver(classUri);

  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : status === 'error' ? (
    <Icon icon="it-error" color="danger" title={`${error}.\nCheck console log.`}/>
  ) :
  data?.ontologicalClass ? (
    <span className="rdf-ontological-class-property">
      [
      <a
        key={data.ontologicalClass}
        href={data.ontologicalClass}
        target="_blank"
        rel="noreferrer"
        title={data?.ontologicalClassComment}
      >
        {basename(data?.ontologicalClass)}
      </a>
      ]
    </span>
  ) : classUri ? (
    <span title={`URI not found: ${classUri}.`}>⚠</span>
  ) : null;
}
