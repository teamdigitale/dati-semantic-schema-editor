import { List, Map } from 'immutable';

import './model-root.scss';

export interface Props {
  name: string;
  fullPath: string[];
  getComponent?: any;
  specSelectors?: any;
  specActions?: any;
  jsonldContextSelectors?: any;
  getConfigs?: any;
}

export const ModelRoot = ({
  name,
  fullPath,
  getComponent,
  specSelectors,
  specActions,
  jsonldContextSelectors,
  getConfigs,
}: Props) => {
  const specPath = List(fullPath);

  // Schema corrente in formato JSON.
  // Se non è ancora stato risolto, viene fatta la risoluzione (specActions.requestResolvedSubtree)
  const schemaValue = specSelectors.specResolvedSubtree(fullPath);
  const rawSchemaValue = specSelectors.specJson().getIn(fullPath);

  const schema = Map.isMap(schemaValue) ? schemaValue : Map();
  const rawSchema = Map.isMap(rawSchemaValue) ? rawSchemaValue : Map();

  if (schema.size === 0 && rawSchema.size > 0) {
    specActions.requestResolvedSubtree(fullPath);
  }

  // JSONLD schema (se presente)
  // Se non è ancora stato risolto, viene fatta la  risoluzione
  const jsonldContext = jsonldContextSelectors.jsonldContextResolvedSubtree(fullPath);

  // Altre proprietà
  const displayName = schema.get('title') || rawSchema.get('title') || name;

  // Components
  const Model = getComponent('Model');

  return (
    <div className="model-root d-block p-3 mb-3">
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
