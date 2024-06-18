import { Badge, Icon } from 'design-react-kit';
import { useJsonLDContextResolver } from '../hooks';
import { RDFProperties } from './rdf-properties';

export const RDFContext = ({ propertyName, jsonldContext }) => {
  const resolvedContext = useJsonLDContextResolver(propertyName, jsonldContext);

  return resolvedContext ? (
    <div>
      <div className="d-flex flex-wrap gap-2">
        <RDFProperties {...resolvedContext} />
      </div>

      {resolvedContext.vocabularyUri && (
        <div className="d-flex flex-wrap gap-2 mt-2">
          <Badge color="warning" href={resolvedContext.vocabularyUri} target="_blank" rel="noreferrer">
            <span>
              Vocabulary <Icon icon="it-external-link" size="xs" color="white" title="View vocabulary" />
            </span>
          </Badge>
        </div>
      )}
    </div>
  ) : null;
};
