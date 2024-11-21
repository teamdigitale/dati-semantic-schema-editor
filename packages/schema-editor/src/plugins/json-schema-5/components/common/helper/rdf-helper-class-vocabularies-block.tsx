import { Badge, Spinner, Table } from 'design-react-kit';
import { Fragment } from 'react';
import { useRDFClassVocabulariesResolver } from '../../../hooks';
import { uri2shortUri } from '../../../utils';

interface Props {
  classUri: string;
}

export const RDFHelperClassVocabulariesBlock = ({ classUri }: Props) => {
  const { data, status } = useRDFClassVocabulariesResolver(classUri);

  const vocabularies = data?.filter((x) => x?.controlledVocabulary) || [];

  return (
    <div className="lightgrey-bg-b4 p-3 mb-4">
      <h6>
        Vocabularies for <Badge color="primary">{uri2shortUri(classUri)}</Badge>
      </h6>

      {status === 'pending' ? (
        <div className="d-flex align-middle">
          <Spinner active small />
        </div>
      ) : status === 'error' ? (
        <div>There was en error trying to load vocabularies</div>
      ) : !vocabularies.length ? (
        <div>No vocabularies to show</div>
      ) : (
        <div style={{ maxHeight: '12rem', overflowY: 'auto' }}>
          <Table>
            <thead>
              <tr>
                <th>Controlled vocabulary</th>
                <th>Classes</th>
                <th>API</th>
              </tr>
            </thead>
            <tbody>
              {vocabularies.map((item, index) => (
                <tr key={index}>
                  <td>
                    <a href={item.controlledVocabulary} target="_blank" rel="noreferrer" title={item.label}>
                      {uri2shortUri(item.controlledVocabulary as string)}
                    </a>
                  </td>
                  <td>
                    {item?.subclass?.split(',').map((uri, subIndex, array) => (
                      <Fragment key={`${index}-${subIndex}`}>
                        <a href={uri.trim()} target="_blank" rel="noreferrer">
                          {uri2shortUri(uri.trim())}
                        </a>
                        {subIndex < array.length - 1 ? ', ' : ''}
                      </Fragment>
                    ))}
                  </td>
                  <td>
                    {item?.api ? (
                      <a href={item.api} target="_blank" rel="noreferrer">
                        API endpoint
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </div>
  );
};
