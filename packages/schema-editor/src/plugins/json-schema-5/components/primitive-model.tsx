import './primitive-model.scss';

import { sanitizeUrl } from '../../../utils';
import { getExtensions } from '../utils';
import { TypeFormat } from './common/type-format';
import { Alert } from 'design-react-kit';
import { JsonLdContextAccordion } from './common/jsonld-context-accordion';
import { ExampleBlock } from './common/example';

const propClass = 'property';

export const PrimitiveModel = ({ schema, depth, jsonldContext: rootJsonldContext, getComponent, getConfigs }) => {
  // don't render if schema isn't correctly formed
  if (!schema || !schema.get) {
    return <div></div>;
  }

  const { showExtensions } = getConfigs();

  const deprecated = schema.get('deprecated');
  const type = schema.get('type');
  const format = schema.get('format');
  const xml = schema.get('xml');
  const enumArray = schema.get('enum');
  const description = schema.get('description');
  const example = schema.get('example');
  const extensions = getExtensions(schema);
  const properties = schema
    .filter(
      (_, key) => ['enum', 'type', 'format', 'description', '$$ref', 'externalDocs', 'example'].indexOf(key) === -1,
    )
    .filterNot((_, key) => extensions.has(key));
  const externalDocsUrl = schema.getIn(['externalDocs', 'url']);
  const externalDocsDescription = schema.getIn(['externalDocs', 'description']);
  const jsonldContext = schema.get('x-jsonld-context') || rootJsonldContext;

  const Markdown = getComponent('Markdown', true);
  const Property = getComponent('Property');
  const Link = getComponent('Link');

  return (
    <div className="modello primitive-model">
      <TypeFormat type={type} format={format} />

      {enumArray && <div className="prop-enum">Enum: [ {enumArray.join(', ')} ]</div>}

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

      {showExtensions && extensions.size
        ? extensions
            .entrySeq()
            .map(([key, v]) => <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass={propClass} />)
        : null}

      {xml && xml.size ? (
        <span>
          <br />
          <span className={propClass}>xml:</span>
          {xml
            .entrySeq()
            .map(([key, v]) => (
              <span key={`${key}-${v}`} className={propClass}>
                <br />
                &nbsp;&nbsp;&nbsp;{key}: {String(v)}
              </span>
            ))
            .toArray()}
        </span>
      ) : null}

      {!!example && (
        <ExampleBlock depth={depth} example={example} jsonldContext={jsonldContext} getConfigs={getConfigs} />
      )}

      {depth === 1 && !!jsonldContext && <JsonLdContextAccordion jsonldContext={jsonldContext} />}
    </div>
  );
};
