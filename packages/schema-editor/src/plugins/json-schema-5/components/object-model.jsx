import React from 'react';
import { List } from 'immutable';
import { sanitizeUrl } from '../../../utils';

const braceOpen = '{';
const braceClose = '}';
const propClass = 'property';

const ObjectModel = ({
  schema,
  name,
  displayName,
  isRef,
  getComponent,
  getConfigs,
  depth,
  onToggle,
  expanded,
  specPath,
  ...otherProps
}) => {
  const { specSelectors, expandDepth, includeReadOnly, includeWriteOnly } = otherProps;
  const { isOAS3 } = specSelectors;

  if (!schema) {
    return null;
  }

  const { showExtensions } = getConfigs();

  let description = schema.get('description');
  let properties = schema.get('properties');
  let additionalProperties = schema.get('additionalProperties');
  let title = schema.get('title') || displayName || name;
  let requiredProperties = schema.get('required');
  let infoProperties = schema.filter(
    (v, key) => ['maxProperties', 'minProperties', 'nullable', 'example'].indexOf(key) !== -1,
  );
  let deprecated = schema.get('deprecated');
  let externalDocsUrl = schema.getIn(['externalDocs', 'url']);
  let externalDocsDescription = schema.getIn(['externalDocs', 'description']);

  const JumpToPath = getComponent('JumpToPath', true);
  const Markdown = getComponent('Markdown', true);
  const Model = getComponent('Model');
  const ModelCollapse = getComponent('ModelCollapse');
  const Property = getComponent('Property');
  const Link = getComponent('Link');

  const JumpToPathSection = () => (
    <span className="model-jump-to-path">
      <JumpToPath specPath={specPath} />
    </span>
  );

  const collapsedContent = (
    <span>
      <span>{braceOpen}</span>...<span>{braceClose}</span>
      {isRef ? <JumpToPathSection /> : ''}
    </span>
  );

  const allOf = specSelectors.isOAS3() ? schema.get('allOf') : null;
  const anyOf = specSelectors.isOAS3() ? schema.get('anyOf') : null;
  const oneOf = specSelectors.isOAS3() ? schema.get('oneOf') : null;
  const not = specSelectors.isOAS3() ? schema.get('not') : null;

  const titleEl = title && (
    <span className="model-title">
      {isRef && schema.get('$$ref') && <span className="model-hint">{schema.get('$$ref')}</span>}
      <span className="model-title__text">{title}</span>
    </span>
  );

  return (
    <span className="model">
      <ModelCollapse
        modelName={name}
        title={titleEl}
        onToggle={onToggle}
        expanded={expanded ? true : depth <= expandDepth}
        collapsedContent={collapsedContent}
      >
        {!description ? null : <Markdown source={description} />}

        <span className="brace-open object">{braceOpen}</span>
        {!isRef ? null : <JumpToPathSection />}
        <span className="inner-object">
          <table className="model">
            <tbody>
              {externalDocsUrl && (
                <tr className="external-docs">
                  <td>externalDocs:</td>
                  <td>
                    <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
                      {externalDocsDescription || externalDocsUrl}
                    </Link>
                  </td>
                </tr>
              )}
              {!deprecated ? null : (
                <tr className="property">
                  <td>deprecated:</td>
                  <td>true</td>
                </tr>
              )}
              {properties &&
                properties.size &&
                properties
                  .entrySeq()
                  .filter(([key, value]) => {
                    return (!value.get('readOnly') || includeReadOnly) && (!value.get('writeOnly') || includeWriteOnly);
                  })
                  .map(([key, value]) => {
                    let isDeprecated = isOAS3() && value.get('deprecated');
                    let isRequired = List.isList(requiredProperties) && requiredProperties.contains(key);

                    let classNames = ['property-row'];

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
              {!showExtensions ? null : (
                <tr>
                  <td>&nbsp;</td>
                </tr>
              )}
              {showExtensions &&
                schema
                  .entrySeq()
                  .map(([key, value]) => {
                    if (key.slice(0, 2) !== 'x-') {
                      return null;
                    }

                    const normalizedValue = !value ? null : value.toJS ? value.toJS() : value;

                    return (
                      <tr key={key} className="extension">
                        <td>{key}</td>
                        <td>{JSON.stringify(normalizedValue)}</td>
                      </tr>
                    );
                  })
                  .toArray()}
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
      </ModelCollapse>
      {infoProperties.size
        ? infoProperties
            .entrySeq()
            .map(([key, v]) => <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass={propClass} />)
        : null}
    </span>
  );
};

export default ObjectModel;
