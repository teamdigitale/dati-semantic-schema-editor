import Im, { Map } from 'immutable';
import { useSchemaBasePath } from '../hooks';

export const ModelRoot = ({
  name,
  jsonldContext,
  getComponent,
  specSelectors,
  specActions,
  layoutSelectors,
  layoutActions,
  getConfigs,
}) => {
  const [specPathBase] = useSchemaBasePath(specSelectors);
  const { defaultModelsExpandDepth } = getConfigs();

  const fullPath = [...specPathBase, name];
  const specPath = Im.List(fullPath);

  const schemaValue = specSelectors.specResolvedSubtree(fullPath);
  const rawSchemaValue = specSelectors.specJson().getIn(fullPath);

  const schema = Map.isMap(schemaValue) ? schemaValue : Im.Map();
  const rawSchema = Map.isMap(rawSchemaValue) ? rawSchemaValue : Im.Map();

  const displayName = schema.get('title') || rawSchema.get('title') || name;

  if (schema.size === 0 && rawSchema.size > 0) {
    specActions.requestResolvedSubtree(fullPath);
  }

  const Model = getComponent('Model');

  return (
    <div className="d-block neutral-2-bg p-3 mb-3">
      <Model
        name={name}
        expandDepth={defaultModelsExpandDepth}
        schema={schema || Im.Map()}
        displayName={displayName}
        fullPath={fullPath}
        specPath={specPath}
        getComponent={getComponent}
        specSelectors={specSelectors}
        getConfigs={getConfigs}
        layoutSelectors={layoutSelectors}
        layoutActions={layoutActions}
        includeReadOnly={true}
        includeWriteOnly={true}
        expanded={true}
        depth={1}
        jsonldContext={jsonldContext}
      />
    </div>
  );
};
