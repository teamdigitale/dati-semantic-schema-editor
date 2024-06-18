import './array-model.scss';

import { sanitizeUrl } from '../../../utils';
import { TypeFormat } from './common/type-format';
import { Alert } from 'design-react-kit';
import { JsonLdContextAccordion } from './common/jsonld-context-accordion';
import { Example } from './common/example';

const propClass = 'property';

export const ArrayModel = (props) => {
  const { getComponent, getConfigs, schema, depth, specPath, jsonldContext: rootJsonldContext } = props;

  const deprecated = schema.get('deprecated');
  const description = schema.get('description');
  const items = schema.get('items');
  const example = schema.get('example');
  const properties = schema.filter(
    (v, key) => ['type', 'items', 'description', '$$ref', 'externalDocs'].indexOf(key) === -1,
  );
  const externalDocsUrl = schema.getIn(['externalDocs', 'url']);
  const externalDocsDescription = schema.getIn(['externalDocs', 'description']);
  const jsonldContext = schema.get('x-jsonld-context') || rootJsonldContext;

  const Markdown = getComponent('Markdown', true);
  const Model = getComponent('Model');
  const Property = getComponent('Property');
  const Link = getComponent('Link');

  return (
    <div className="modello array-model">
      <TypeFormat type="array" />

      {!!deprecated && <Alert color="warning">This definition is deprecated</Alert>}

      {!!description && <Markdown source={description} />}

      {!!externalDocsUrl && (
        <div className="external-docs">
          <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
            {externalDocsDescription || externalDocsUrl}
          </Link>
        </div>
      )}

      {properties.size
        ? properties
            .entrySeq()
            .map(([key, v]) => <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass={propClass} />)
        : null}

      <div>
        <Model
          {...props}
          getConfigs={getConfigs}
          specPath={specPath.push('items')}
          name={null}
          schema={items}
          required={false}
          depth={depth + 1}
        />
      </div>

      {depth === 1 && !!example && <Example example={example} jsonldContext={jsonldContext} getConfigs={getConfigs} />}

      {depth === 1 && !!jsonldContext && <JsonLdContextAccordion jsonldContext={jsonldContext} />}
    </div>
  );
};
