import { Badge, Icon } from 'design-react-kit';
import { useJsonLDResolver } from '../../hooks';

export const RDFVocabularyBlock = ({ propertyName, jsonldContext, className }) => {
  const { data } = useJsonLDResolver(jsonldContext, [propertyName]);

  return data?.vocabularyUri ? (
    <Badge color="success" href={data?.vocabularyUri} target="_blank" rel="noreferrer" className={className}>
      <span>
        Show values <Icon icon="it-external-link" size="xs" color="white" title="View vocabulary" />
      </span>
    </Badge>
  ) : null;
};
