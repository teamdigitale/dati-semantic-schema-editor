import './object-model.scss';

import { Alert } from 'design-react-kit';
import { List } from 'immutable';
import { sanitizeUrl } from '../../../utils';
import { ExampleBlock } from './common/example';
import { JsonLdContextAccordion } from './common/jsonld-context-accordion';
import { RDFContext } from './rdf-context';

const braceOpen = '{';
const braceClose = '}';
const propClass = 'property';

const ObjectModel = ({
  schema,
  name,
  getComponent,
  getConfigs,
  depth,
  onToggle,
  expanded,
  specPath,
  jsonldContext: rootJsonldContext,
  ...otherProps
}) => {
  if (!schema) {
    return null;
  }

  const { specSelectors, expandDepth, includeReadOnly, includeWriteOnly } = otherProps;
  const { showExtensions } = getConfigs();

  const jsonldContext = schema.get('x-jsonld-context') || rootJsonldContext;
  const example = schema.get('example');
  const description = schema.get('description');
  const properties = schema.get('properties');
  const additionalProperties = schema.get('additionalProperties');
  const requiredProperties = schema.get('required');
  const infoProperties = schema.filter((v, key) => ['maxProperties', 'minProperties', 'nullable'].indexOf(key) !== -1);
  const deprecated = schema.get('deprecated');
  const externalDocsUrl = schema.getIn(['externalDocs', 'url']);
  const externalDocsDescription = schema.getIn(['externalDocs', 'description']);
  const extensions = schema
    .entrySeq()
    .filter(([key]) => key.startsWith('x-'))
    .filter(([key]) => !['x-jsonld-context', 'x-jsonld-type'].includes(key));

  const isOAS3 = specSelectors.isOAS3();
  const allOf = isOAS3 ? schema.get('allOf') : null;
  const anyOf = isOAS3 ? schema.get('anyOf') : null;
  const oneOf = isOAS3 ? schema.get('oneOf') : null;
  const not = isOAS3 ? schema.get('not') : null;

  const Markdown = getComponent('Markdown', true);
  const Model = getComponent('Model');
  const ModelCollapse = getComponent('ModelCollapse');
  const Property = getComponent('Property');
  const Link = getComponent('Link');

  return (
    <div className="modello object-model">
      <ModelCollapse modelName={name} onToggle={onToggle} expanded={expanded ? true : depth <= expandDepth}>
        {/* <TypeFormat type="object" /> */}

        {!!deprecated && <Alert color="warning">This definition is deprecated</Alert>}

        {!!description && <Markdown source={description} />}

        {!!externalDocsUrl && (
          <div className="external-docs">
            <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
              {externalDocsDescription || externalDocsUrl}
            </Link>
          </div>
        )}

        <div>
          <span className="brace-open object">{braceOpen}</span>
          <span className="inner-object">
            <table className="modello code">
              <tbody>
                {properties &&
                  properties.size &&
                  properties
                    .entrySeq()
                    .filter(([key, value]) => {
                      return (
                        (!value.get('readOnly') || includeReadOnly) && (!value.get('writeOnly') || includeWriteOnly)
                      );
                    })
                    .map(([key, value]) => {
                      const isDeprecated = isOAS3 && value.get('deprecated');
                      const isRequired = List.isList(requiredProperties) && requiredProperties.contains(key);
                      const classNames = ['property-row'];
                      if (isDeprecated) {
                        classNames.push('deprecated');
                      }
                      if (isRequired) {
                        classNames.push('required');
                      }
                      return (
                        <tr key={key} className={classNames.join(' ')}>
                          <td>
                            {key}
                            {isRequired && <span className="star">*</span>}
                          </td>
                          <td>
                            {jsonldContext && <RDFContext propertyName={key} jsonldContext={jsonldContext} />}
                            <Model
                              key={`object-${name}-${key}_${value}`}
                              {...otherProps}
                              required={isRequired}
                              getComponent={getComponent}
                              specPath={specPath.push('properties', key)}
                              getConfigs={getConfigs}
                              schema={value}
                              depth={depth + 1}
                            />
                          </td>
                        </tr>
                      );
                    })
                    .toArray()}

                {showExtensions && extensions?.toArray().length > 0 && (
                  <>
                    <tr>
                      <td>&nbsp;</td>
                    </tr>

                    {extensions
                      .map(([key, value]) => {
                        const normalizedValue = !value ? null : value.toJS ? value.toJS() : value;
                        return (
                          <tr key={key} className="extension">
                            <td>{key}</td>
                            <td>{JSON.stringify(normalizedValue)}</td>
                          </tr>
                        );
                      })
                      .toArray()}
                  </>
                )}

                {!additionalProperties || !additionalProperties.size ? null : (
                  <tr>
                    <td>{'< * >:'}</td>
                    <td>
                      <Model
                        {...otherProps}
                        required={false}
                        getComponent={getComponent}
                        specPath={specPath.push('additionalProperties')}
                        getConfigs={getConfigs}
                        schema={additionalProperties}
                        depth={depth + 1}
                      />
                    </td>
                  </tr>
                )}

                {!allOf ? null : (
                  <tr>
                    <td>{'allOf ->'}</td>
                    <td>
                      {allOf.map((schema, k) => (
                        <div key={k}>
                          <Model
                            {...otherProps}
                            required={false}
                            getComponent={getComponent}
                            specPath={specPath.push('allOf', k)}
                            getConfigs={getConfigs}
                            schema={schema}
                            depth={depth + 1}
                          />
                        </div>
                      ))}
                    </td>
                  </tr>
                )}

                {!anyOf ? null : (
                  <tr>
                    <td>{'anyOf ->'}</td>
                    <td>
                      {anyOf.map((schema, k) => (
                        <div key={k}>
                          <Model
                            {...otherProps}
                            required={false}
                            getComponent={getComponent}
                            specPath={specPath.push('anyOf', k)}
                            getConfigs={getConfigs}
                            schema={schema}
                            depth={depth + 1}
                          />
                        </div>
                      ))}
                    </td>
                  </tr>
                )}

                {!oneOf ? null : (
                  <tr>
                    <td>{'oneOf ->'}</td>
                    <td>
                      {oneOf.map((schema, k) => (
                        <div key={k}>
                          <Model
                            {...otherProps}
                            required={false}
                            getComponent={getComponent}
                            specPath={specPath.push('oneOf', k)}
                            getConfigs={getConfigs}
                            schema={schema}
                            depth={depth + 1}
                          />
                        </div>
                      ))}
                    </td>
                  </tr>
                )}

                {!not ? null : (
                  <tr>
                    <td>{'not ->'}</td>
                    <td>
                      <div>
                        <Model
                          {...otherProps}
                          required={false}
                          getComponent={getComponent}
                          specPath={specPath.push('not')}
                          getConfigs={getConfigs}
                          schema={not}
                          depth={depth + 1}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </span>
          <span className="brace-close">{braceClose}</span>
        </div>

        {!!example && (
          <ExampleBlock depth={1} example={example} jsonldContext={jsonldContext} getConfigs={getConfigs} />
        )}

        {!!jsonldContext && <JsonLdContextAccordion jsonldContext={jsonldContext} />}

        {infoProperties.size
          ? infoProperties
              .entrySeq()
              .map(([key, v]) => <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass={propClass} />)
          : null}
      </ModelCollapse>
    </div>
  );
};

export default ObjectModel;
