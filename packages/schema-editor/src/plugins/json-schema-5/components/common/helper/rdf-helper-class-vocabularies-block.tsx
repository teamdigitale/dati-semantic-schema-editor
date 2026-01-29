import { Badge, Button, Icon, Spinner, Table } from 'design-react-kit';
import { Fragment, useMemo } from 'react';
import { useRDFClassVocabulariesResolver, useVocabulariesQuery } from '../../../hooks';
import { uri2shortUri } from '../../../utils';
import { JSONLD_PLAYGROUND_FRAME } from './rdf-helper-const';

interface Props {
  classUri: string;
}

export const RDFHelperClassVocabulariesBlock = ({ classUri }: Props) => {
  const { data, status } = useRDFClassVocabulariesResolver(classUri);
  const { data: jsonldData } = useVocabulariesQuery();

  const vocabularies = data?.filter((x) => x?.controlledVocabulary) || [];

  const playgroundUrl = useMemo(() => {
    if (!jsonldData) return '';
    const jsonldEncoded = encodeURIComponent(JSON.stringify(jsonldData, null, 2)); // replace with YAML.dump when json-ld.org playground supports it
    const frameEncoded = encodeURIComponent(JSON.stringify(JSONLD_PLAYGROUND_FRAME, null, 2)); // replace with YAML.dump when json-ld.org playground supports it
    return `https://ioggstream.github.io/json-ld.org/playground/next/#startTab=tab-framed&json-ld=${jsonldEncoded}&frame=${frameEncoded}`;
  }, [jsonldData]);

  return (
    <div className="lightgrey-bg-b4 p-3 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="mb-0">
          Vocabularies for <Badge color="primary">{uri2shortUri(classUri)}</Badge>
        </h6>
        {playgroundUrl && (
          // @ts-expect-error Button props are not fully typed whenrendered as anchors
          <Button outline color="primary" size="sm" href={playgroundUrl} rel="noreferrer" target="_blank">
            Explore <Icon icon="it-external-link" size="sm" fill="currentColor" className="ms-2" />
          </Button>
        )}
      </div>

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
