import './object-model.scss';

import { List, Map } from 'immutable';
import { useJsonLDResolver, useOntologicalClassResolver, useRDFPropertyResolver } from '../hooks';
import { getParentType } from '../utils';
import { DeprecatedBlock } from './common/deprecated-block';
import { DescriptionBlock } from './common/description-block';
import { ExampleAccordion } from './common/example-accordion';
import { ExternalDocsBlock } from './common/external-docs-block';
import { HeadingBlock, HeadingBlockLeft, HeadingBlockRight } from './common/heading-block';
import { RDFHelperButtonWithModal } from './common/helper';
import { JsonLdContextAccordion } from './common/jsonld-context-accordion';
import { ModelTitle } from './common/model-title';
import { NavigateBack } from './common/navigate-back';
import { OntoScoreBlock } from './common/onto-score-block';
import { PropertiesBlock } from './common/properties-block';
import { RDFContentAccordion } from './common/rdf-content-accordion';
import { RDFOntologicalClassBlock } from './common/rdf-ontological-class-block';
import { RDFOntologicalClassPropertyBlock } from './common/rdf-ontological-class-property-block';
import { SemanticDescriptionBlock } from './common/semantic-description-block';
import { TypeFormatVocabularyBlock } from './common/type-format-vocabulary-block';
import type { ModelCollapse as ModelCollapseComponent } from './model-collapse';

const braceOpen = '{';
const braceClose = '}';

export const ObjectModel = ({
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
}: {
  schema: Map<string, any>;
  name: string;
  displayName: string;
  getComponent: (path: string, required?: boolean) => any;
  getConfigs: () => { showExtensions: boolean };
  depth: number;
  expanded: boolean;
  specPath: List<string>;
  jsonldContext: any;
  specSelectors: any;
  includeReadOnly: boolean;
  includeWriteOnly: boolean;
}) => {
  const { specSelectors, includeReadOnly, includeWriteOnly } = otherProps;
  const { showExtensions } = getConfigs();

  const specPathArray = Array.from(specPath) as string[];
  const propertyName = specPathArray[specPathArray.length - 1] as string;
  const isArrayElement = getParentType(specSelectors, specPathArray) === 'array' && propertyName === 'items';
  const jsonldType = schema.get('x-jsonld-type');
  const jsonldContextPathArray = specPathArray
    .slice(3)
    .filter((x) => x !== 'properties')
    .slice(0, isArrayElement ? -1 : undefined);
  const title = (schema?.get('title') as string) || displayName || name || '';
  const properties: Map<string, any> = schema.get('properties');
  const additionalProperties = schema.get('additionalProperties');
  const requiredProperties = schema.get('required');
  const infoProperties = schema.filter((v, key) => ['maxProperties', 'minProperties', 'nullable'].indexOf(key) !== -1);
  const extensions = schema.entrySeq().filter(([key]) => key.startsWith('x-'));

  const isOAS3 = specSelectors.isOAS3();
  const allOf = isOAS3 ? schema.get('allOf') : null;
  const anyOf = isOAS3 ? schema.get('anyOf') : null;
  const oneOf = isOAS3 ? schema.get('oneOf') : null;
  const not = isOAS3 ? schema.get('not') : null;

  // Ontological resolvers.
  const { data: jsonLDResolverResult } = useJsonLDResolver(jsonldContext, jsonldContextPathArray);
  const { data: rdfProperty } = useRDFPropertyResolver(jsonLDResolverResult?.fieldUri);

  // Ontological class
  const { data: ontologicalClassUri } = useOntologicalClassResolver(jsonldContext, jsonldType, jsonldContextPathArray);

  const propertiesPaths = Array.from(properties?.keys() || []).map((x) => [...jsonldContextPathArray, x]);

  // View models
  const Model = getComponent('Model');
  const ModelCollapse: typeof ModelCollapseComponent = getComponent('ModelCollapse', true);
  const JumpToPath = getComponent('JumpToPath', true);

  // Collapsed view
  if (!expanded) {
    return (
      <div className="modello object-model">
        <TypeFormatVocabularyBlock
          type="object"
          jsonldContext={jsonldContext}
          propertyName={propertyName}
          rdfProperty={rdfProperty}
        />
        <SemanticDescriptionBlock getComponent={getComponent} description={rdfProperty?.ontologicalPropertyComment} />
        <ModelCollapse title={title} specPath={specPath} expanded={expanded} schema={schema}></ModelCollapse>
      </div>
    );
  }
  // Expanded view
  return (
    <div className="modello object-model">
      <HeadingBlock>
        <HeadingBlockLeft>
          <NavigateBack />
          <ModelTitle title={title} />
          <RDFOntologicalClassBlock classUri={ontologicalClassUri} />
        </HeadingBlockLeft>
        <HeadingBlockRight>
          <OntoScoreBlock jsonldContext={jsonldContext} propertiesPaths={propertiesPaths} />
          <JumpToPath specPath={specPath} />
        </HeadingBlockRight>
      </HeadingBlock>

      <hr />

      <div className="d-flex justify-content-between">
        <div>
          {depth > 1 && !isArrayElement && (
            <RDFOntologicalClassPropertyBlock fieldUri={jsonLDResolverResult?.fieldUri} />
          )}
          <DeprecatedBlock schema={schema} />
          <DescriptionBlock schema={schema} getComponent={getComponent} />
          <ExternalDocsBlock schema={schema} getComponent={getComponent} />
          <PropertiesBlock properties={infoProperties} getComponent={getComponent} />
        </div>
        <div>
          {depth === 1 && ontologicalClassUri && (
            <RDFHelperButtonWithModal getComponent={getComponent} classUri={ontologicalClassUri} schema={schema} />
          )}
        </div>
      </div>

      <hr />

      <div className="bg-white p-4">
        <span className="brace-open object">{braceOpen}</span>
        <span className="inner-object">
          <table className="modello code">
            <tbody>
              {properties &&
                properties.size &&
                properties
                  .entrySeq()
                  .filter(([key, value]) => value && typeof value.get === 'function')
                  .filter(([key, value]) => {
                    return (!value.get('readOnly') || includeReadOnly) && (!value.get('writeOnly') || includeWriteOnly);
                  })
                  .map(([key, value]) => {
                    const childSpecPath = specPath.push('properties', key);
                    const isDeprecated = isOAS3 && value.get && value.get('deprecated');
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
                          <div className="d-flex align-items-start justify-content-between">
                            <Model
                              key={`object-${name}-${key}_${value}`}
                              {...otherProps}
                              name={key}
                              required={isRequired}
                              getComponent={getComponent}
                              specPath={childSpecPath}
                              getConfigs={getConfigs}
                              schema={value}
                              depth={depth + 1}
                              jsonldContext={jsonldContext}
                            />
                            <JumpToPath specPath={childSpecPath} size="xs" />
                          </div>
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

      <ExampleAccordion schema={schema} jsonldContext={jsonldContext} depth={depth} getConfigs={getConfigs} />
      <RDFContentAccordion schema={schema} jsonldContext={jsonldContext} />
      <JsonLdContextAccordion jsonldContext={jsonldContext} depth={depth} />
    </div>
  );
};
