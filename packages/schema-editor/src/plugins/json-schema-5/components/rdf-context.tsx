import { useJsonLDContextResolver } from '../hooks';
import { RDFVocabulary } from './rdf-vocabulary';
import { RDFProperties } from './rdf-properties';

export const RDFContext = ({ propertyName, jsonldContext }) => {
  const resolvedContext = useJsonLDContextResolver(propertyName, jsonldContext);

  return resolvedContext ? (
    <div>
      <div>
        <RDFProperties {...resolvedContext} />
      </div>

      {resolvedContext.vocabularyUri && (
        <div className="mt-2">
          <RDFVocabulary {...resolvedContext} />
        </div>
      )}
    </div>
  ) : null;
};
