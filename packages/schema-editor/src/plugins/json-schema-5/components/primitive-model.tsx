import './primitive-model.scss';

import { getExtensions } from '../utils';
import { DeprecatedBlock } from './common/deprecated-block';
import { DescriptionBlock } from './common/description-block';
import { ExampleBlock } from './common/example-block';
import { ExternalDocsBlock } from './common/external-docs-block';
import { JsonLdContextBlock } from './common/jsonld-context-block';
import { TypeFormatBlock } from './common/type-format-block';
import { PropertiesBlock } from './common/properties-block';
import { TitleBlock } from './common/title-block';

export const PrimitiveModel = ({
  schema,
  name,
  displayName,
  depth,
  specPath,
  jsonldContext: rootJsonldContext,
  getComponent,
  getConfigs,
}) => {
  const { showExtensions } = getConfigs();

  const title = (schema?.get('title') as string) || displayName || name || '';
  const jsonldContext = rootJsonldContext || schema.get('x-jsonld-context');
  const type = schema.get('type');
  const format = schema.get('format');
  const xml = schema.get('xml');
  const enumArray = schema.get('enum');
  const extensions = getExtensions(schema);
  const properties = schema
    .filter(
      (_, key) => ['enum', 'type', 'format', 'description', '$$ref', 'externalDocs', 'example'].indexOf(key) === -1,
    )
    .filterNot((_, key) => extensions.has(key));

  return (
    <div className="modello primitive-model">
      <TitleBlock title={title} specPath={specPath} depth={depth} getComponent={getComponent} />

      <TypeFormatBlock type={type} format={format} />

      {enumArray && <div className="prop-enum">Enum: [ {enumArray.join(', ')} ]</div>}

      <DeprecatedBlock schema={schema} />

      <DescriptionBlock schema={schema} getComponent={getComponent} />

      <ExternalDocsBlock schema={schema} getComponent={getComponent} />

      <PropertiesBlock properties={properties} getComponent={getComponent} />

      {showExtensions && <PropertiesBlock properties={extensions} getComponent={getComponent} />}

      {xml && xml.size ? (
        <span>
          <br />
          <span className="property">xml:</span>
          {xml
            .entrySeq()
            .map(([key, v]) => (
              <span key={`${key}-${v}`} className="property">
                <br />
                &nbsp;&nbsp;&nbsp;{key}: {String(v)}
              </span>
            ))
            .toArray()}
        </span>
      ) : null}

      <ExampleBlock schema={schema} jsonldContext={jsonldContext} depth={depth} getConfigs={getConfigs} />

      <JsonLdContextBlock jsonldContext={jsonldContext} depth={depth} />
    </div>
  );
};
