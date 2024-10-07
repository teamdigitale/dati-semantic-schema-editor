import { useRDFClassVocabulariesResolver } from '../../hooks';

interface Props {
  classUri: string;
}

export const RDFHelperClassVocabulariesBlock = ({ classUri }: Props) => {
  const { data } = useRDFClassVocabulariesResolver(classUri);

  return data ? (
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
              <td>{uriToCurie(item.controlledVocabulary)}</td>
              <td>{uriToCurie(item?.subclass)}</td>
              <td>
                <a href={item?.api} target="_blank" rel="noreferrer">
                  API endpoint
                </a>
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
