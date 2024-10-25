import { Icon, Spinner, Table } from 'design-react-kit';
import { useRDFClassVocabulariesResolver } from '../../../hooks';
import { uri2shortUri } from '../../../utils';

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
  ) : data?.length ? (
    <div>
      <Table>
        <thead>
          <tr>
            <th>Controlled Vocabulary for {uri2shortUri(classUri)}</th>
            <th>Subclasses</th>
            <th>API</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) =>
            item?.controlledVocabulary ? (
              <tr key={index}>
                <td>
                  <a href={item.controlledVocabulary} target="_blank" rel="noreferrer">
                    {uri2shortUri(item.controlledVocabulary)}
                  </a>
                </td>
                <td>{uri2shortUri(item?.subclass)}</td>
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
            ) : null,
          )}
        </tbody>
      </Table>
    </div>
  ) : null;
};
