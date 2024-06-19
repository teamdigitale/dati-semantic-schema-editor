import Im, { Map } from 'immutable';
import { useSchemaNavigation } from '../../overview/components/Navigation';
import { useSchemaBasePath } from '../hooks';

export const ModelRoot = ({
  name,
  expanded,
  getComponent,
  specSelectors,
  specActions,
  layoutSelectors,
  layoutActions,
  getConfigs,
}) => {
  const { push } = useSchemaNavigation();
  const [specPathBase] = useSchemaBasePath(specSelectors);
  const { defaultModelsExpandDepth } = getConfigs();

  const fullPath = [...specPathBase, name];
  const specPath = Im.List(fullPath);

  const schemaValue = specSelectors.specResolvedSubtree(fullPath);
  const rawSchemaValue = specSelectors.specJson().getIn(fullPath);

  const schema = Map.isMap(schemaValue) ? schemaValue : Im.Map();
  const rawSchema = Map.isMap(rawSchemaValue) ? rawSchemaValue : Im.Map();

  const displayName = schema.get('title') || rawSchema.get('title') || name;

  if (expanded && schema.size === 0 && rawSchema.size > 0) {
    specActions.requestResolvedSubtree(fullPath);
  }

  const handleItemClick = (evt, name: string) => {
    evt?.preventDefault();
    if (!expanded) {
      push({ id: name, title: name });
    }
  };

  const JumpToPath = getComponent('JumpToPath', true);
  const Model = getComponent('Model');

  return (
    <div key={name} className="model-container">
      {!expanded ? (
        <a key={name} href="#" className="d-block neutral-2-bg p-3 mb-3" onClick={(e) => handleItemClick(e, name)}>
          <div className="d-flex">
            <div className="flex-grow-1">
              <strong>{name}</strong>
            </div>
            <div className="d-flex">
              <JumpToPath specPath={fullPath} content={'#'} />
            </div>
          </div>
        </a>
      ) : (
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
          />
        </div>
      )}
    </div>
  );
};
