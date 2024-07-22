import { List, Map } from 'immutable';

export interface Props {
  name: string;
  fullPath: string[];
  jsonldContextFullPath: string[] | undefined;
  getComponent?: any;
  specSelectors?: any;
  specActions?: any;
  layoutSelectors?: any;
  layoutActions?: any;
  getConfigs?: any;
}

export const ModelRoot = ({
  name,
  fullPath,
  jsonldContextFullPath,
  getComponent,
  specSelectors,
  specActions,
  getConfigs,
}: Props) => {
  const specPath = List(fullPath);

  const schemaValue = specSelectors.specResolvedSubtree(fullPath);
  const rawSchemaValue = specSelectors.specJson().getIn(fullPath);

  const schema = Map.isMap(schemaValue) ? schemaValue : Map();
  const rawSchema = Map.isMap(rawSchemaValue) ? rawSchemaValue : Map();

  const displayName = schema.get('title') || rawSchema.get('title') || name;

  if (schema.size === 0 && rawSchema.size > 0) {
    specActions.requestResolvedSubtree(fullPath);
  }

  const jsonldContext = jsonldContextFullPath
    ? specSelectors.specResolvedSubtree(jsonldContextFullPath)?.get('x-jsonld-context')
    : undefined;

  const Model = getComponent('Model');

  return (
    <div className="d-block neutral-2-bg p-3 mb-3">
      <Model
        name={name}
        schema={schema}
        displayName={displayName}
        fullPath={fullPath}
        specPath={specPath}
        getComponent={getComponent}
        specSelectors={specSelectors}
        getConfigs={getConfigs}
        includeReadOnly={true}
        includeWriteOnly={true}
        expanded={true}
        depth={1}
        jsonldContext={jsonldContext}
      />
    </div>
  );
};
