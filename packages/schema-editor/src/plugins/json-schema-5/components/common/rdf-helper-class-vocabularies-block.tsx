import { Icon, Spinner } from 'design-react-kit';
import { useRDFClassVocabulariesResolver } from '../../hooks';

interface Props {
  classUri: string;
}

export const RDFHelperClassVocabulariesBlock = ({ classUri }: Props) => {
  const { data, status, error } = useRDFClassVocabulariesResolver(classUri);

  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : status === 'error' ? (
    <Icon icon="it-error" color="danger" title={`${error}.\nCheck console log.`} />
  ) : data ? (
    <div>
      <h6>Vocabularies for {uriToCurie(classUri)}</h6>
      <table>
        <thead>
          <tr>
            <th>Controlled Vocabulary</th>
            <th>Subclasses</th>
            <th>API</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>
                <a href={item.controlledVocabulary} target="_blank" rel="noreferrer">
                  {uriToCurie(item.controlledVocabulary)}
                </a>
              </td>
              <td>{uriToCurie(item?.subclass)}</td>
              <td>
                {item?.api ? (
                  <a href={item?.api} target="_blank" rel="noreferrer">
                    API endpoint
                  </a>
                ) : (
                  <>-</>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : null;
};

const uriToCurie = (uri) => {
  const parts = uri.split(/[/#]/);
  return `${parts[parts.length - 2]}:${parts[parts.length - 1]}`;
};
