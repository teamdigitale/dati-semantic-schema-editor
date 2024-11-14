import { Icon, Spinner } from 'design-react-kit';
import { useRDFClassResolver } from '../../hooks';
import { uri2shortUri } from '../../utils';

interface OntologicalClassProps {
  uri: string;
  comment: string | undefined;
  error?: boolean;
}
const OntologicalClass = ({ uri, comment, error }: OntologicalClassProps) => {
  return (
    <span className="rdf-ontological-class-property">
      [{error ? '⚠' : ''}
      <a key={uri} href={uri} target="_blank" rel="noreferrer" title={comment}>
        {uri2shortUri(uri)}
      </a>
      ]
    </span>
  );
};
export function RDFOntologicalClassBlock({ classUri }) {
  const { data, status, error } = useRDFClassResolver(classUri);

  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : status === 'error' ? (
    <Icon icon="it-error" color="danger" title={error} />
  ) : classUri && data?.ontologicalClass ? (
    <OntologicalClass uri={data.ontologicalClass} comment={data?.ontologicalClassComment} />
  ) : classUri ? (
    <OntologicalClass uri={classUri} comment={`URI not found: ${classUri}`} error />
  ) : null;
}
