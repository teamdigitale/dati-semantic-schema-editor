import { useJsonLDContextResolver } from '../hooks';
import { DictModel } from './dict-model';
import { PropertyModel } from './property-model';

export const ContextModel = ({ propertyName, jsonldContext }) => {
  const resolvedContext = useJsonLDContextResolver(propertyName, jsonldContext);

  return resolvedContext ? (
    <div>
      <div>
        <PropertyModel {...resolvedContext} />
      </div>

      {resolvedContext.vocabularyUri && (
        <div className="mt-2">
          <DictModel {...resolvedContext} />
        </div>
      )}
    </div>
  ) : null;
};
