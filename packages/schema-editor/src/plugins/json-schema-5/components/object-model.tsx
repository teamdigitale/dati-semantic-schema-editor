import './object-model.scss';

import { List } from 'immutable';
import { DeprecatedBlock } from './common/deprecated-block';
import { DescriptionBlock } from './common/description-block';
import { ExampleBlock } from './common/example-block';
import { ExternalDocsBlock } from './common/external-docs-block';
import { HeadingBlock } from './common/heading-block';
import { JsonLdContextBlock } from './common/jsonld-context-block';
import { OntoScoreBlock } from './common/onto-score-block';
import { PropertiesBlock } from './common/properties-block';
import { RDFOntologicalClassPropertyBlock } from './common/rdf-ontological-class-property-block';
import { TypeFormatVocabularyBlock } from './common/type-format-vocabulary-block';
import type { ModelCollapse as ModelCollapseComponent } from './model-collapse';

const braceOpen = '{';
const braceClose = '}';

const ObjectModel = ({
  schema,
  name,
  displayName,
  getComponent,
  getConfigs,
  depth,
  expanded,
  specPath,
  jsonldContext,
  ...otherProps
}) => {
  const { specSelectors, includeReadOnly, includeWriteOnly } = otherProps;
  const { showExtensions } = getConfigs();

  const specPathArray = Array.from(specPath);
  const propertyName = specPathArray[specPathArray.length - 1] as string;
  const title = (schema?.get('title') as string) || displayName || name || '';
  const properties = schema.get('properties');
  const additionalProperties = schema.get('additionalProperties');
  const requiredProperties = schema.get('required');
  const infoProperties = schema.filter((v, key) => ['maxProperties', 'minProperties', 'nullable'].indexOf(key) !== -1);
  const extensions = schema.entrySeq().filter(([key]) => key.startsWith('x-'));

  const isOAS3 = specSelectors.isOAS3();
  const allOf = isOAS3 ? schema.get('allOf') : null;
  const anyOf = isOAS3 ? schema.get('anyOf') : null;
  const oneOf = isOAS3 ? schema.get('oneOf') : null;
  const not = isOAS3 ? schema.get('not') : null;

  const Model = getComponent('Model');
  const ModelCollapse: typeof ModelCollapseComponent = getComponent('ModelCollapse', true);

  return (
    <div className="modello object-model">
      {depth > 1 && (
        <div>
          <RDFOntologicalClassPropertyBlock jsonldContext={jsonldContext} propertyName={propertyName} />
        </div>
      )}

      <ModelCollapse title={title} specPath={specPath} expanded={expanded} schema={schema}>
        {depth === 1 && (
          <HeadingBlock
            title={title}
            specPath={specPath}
            jsonldContext={jsonldContext}
            propertyName={propertyName}
            getComponent={getComponent}
          >
            <OntoScoreBlock schema={schema} jsonldContext={jsonldContext} />
          </HeadingBlock>
        )}

        <TypeFormatVocabularyBlock jsonldContext={jsonldContext} propertyName={propertyName} />

        <DeprecatedBlock schema={schema} />

        <DescriptionBlock schema={schema} getComponent={getComponent} />

        <ExternalDocsBlock schema={schema} getComponent={getComponent} />

        <PropertiesBlock properties={infoProperties} getComponent={getComponent} />

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
                            <Model
                              key={`object-${name}-${key}_${value}`}
                              {...otherProps}
                              name={key}
                              required={isRequired}
                              getComponent={getComponent}
                              specPath={specPath.push('properties', key)}
                              getConfigs={getConfigs}
                              schema={value}
                              depth={depth + 1}
                              jsonldContext={jsonldContext}
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
                        jsonldContext={jsonldContext}
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
                            jsonldContext={jsonldContext}
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
                            jsonldContext={jsonldContext}
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
                            jsonldContext={jsonldContext}
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
                          jsonldContext={jsonldContext}
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

        <ExampleBlock schema={schema} jsonldContext={jsonldContext} depth={depth} getConfigs={getConfigs} />

        <JsonLdContextBlock jsonldContext={jsonldContext} depth={depth} />
      </ModelCollapse>
    </div>
  );
};

export default ObjectModel;
