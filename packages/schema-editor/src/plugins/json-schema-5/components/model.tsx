import { Spinner } from 'design-react-kit';
import { Map } from 'immutable';

const decodeRefName = (uri) => {
  const unescaped = uri.replace(/~1/g, '/').replace(/~0/g, '~');

  try {
    return decodeURIComponent(unescaped);
  } catch {
    return unescaped;
  }
};

const getModelName = (ref) => {
  if (ref.indexOf('#/definitions/') !== -1) {
    return decodeRefName(ref.replace(/^.*#\/definitions\//, ''));
  }
  if (ref.indexOf('#/components/schemas/') !== -1) {
    return decodeRefName(ref.replace(/^.*#\/components\/schemas\//, ''));
  }
};

export const Model = (props) => {
  let { schema } = props;
  const {
    getComponent,
    getConfigs,
    specSelectors,
    required,
    name: propName,
    isRef: propIsRef,
    specPath,
    displayName,
    includeReadOnly,
    includeWriteOnly,
  } = props;

  const getRefSchema = (model) => {
    return specSelectors.findDefinition(model);
  };

  const ObjectModel = getComponent('ObjectModel');
  const ArrayModel = getComponent('ArrayModel');
  const PrimitiveModel = getComponent('PrimitiveModel');
  let type = 'object';
  let $$ref = schema && schema.get('$$ref');
  const $ref = schema && schema.get('$ref');

  let name = propName;

  // If we weren't passed a `name` but have a resolved ref, grab the name from the ref
  if (!name && $$ref) {
    name = getModelName($$ref);
  }

  /*
   * If we have an unresolved ref, get the schema and name from the ref.
   * If the ref is external, we can't resolve it, so we just display the ref location.
   * This is for situations where:
   *  - the ref was not resolved by Swagger Client because we reached the traversal depth limit
   *  - we had a circular ref inside the allOf keyword
   */
  if ($ref) {
    const refName = getModelName($ref);
    const refSchema = getRefSchema(refName);
    if (Map.isMap(refSchema)) {
      schema = refSchema.mergeDeep(schema);
      if (!$$ref) {
        schema = schema.set('$$ref', $ref);
        $$ref = $ref;
      }
    } else if (Map.isMap(schema) && schema.size === 1) {
      schema = null;
      name = $ref;
    }
  }

  if (!schema) {
    return (
      <span className="model model-title">
        <span className="model-title__text">{displayName || name}</span>
        {!$ref && <Spinner active small />}
      </span>
    );
  }

  const deprecated = specSelectors.isOAS3() && schema.get('deprecated');
  const isRef = propIsRef !== undefined ? propIsRef : !!$$ref;
  type = (schema && schema.get('type')) || type;

  if (!schema?.get) {
    return null;
  }

  switch (type) {
    case 'object':
      return (
        <ObjectModel
          className="object"
          {...props}
          specPath={specPath}
          getConfigs={getConfigs}
          schema={schema}
          name={name || displayName}
          deprecated={deprecated}
          isRef={isRef}
          includeReadOnly={includeReadOnly}
          includeWriteOnly={includeWriteOnly}
        />
      );
    case 'array':
      return (
        <ArrayModel
          className="array"
          {...props}
          getConfigs={getConfigs}
          schema={schema}
          name={name}
          deprecated={deprecated}
          required={required}
          includeReadOnly={includeReadOnly}
          includeWriteOnly={includeWriteOnly}
        />
      );
    case 'string':
    case 'number':
    case 'integer':
    case 'boolean':
    default:
      return (
        <PrimitiveModel
          {...props}
          getComponent={getComponent}
          getConfigs={getConfigs}
          schema={schema}
          name={name}
          deprecated={deprecated}
          required={required}
        />
      );
  }
};
