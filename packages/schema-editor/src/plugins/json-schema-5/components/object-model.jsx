import './object-model.scss';

import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
  Alert,
  Callout,
  CalloutText,
  CalloutTitle,
  Icon,
} from 'design-react-kit';
import { List } from 'immutable';
import { useState } from 'react';
import { sanitizeUrl } from '../../../utils';
import { ContextModel } from './context-model';

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
  jsonldContext: rootJsonldContext,
  ...otherProps
}) => {
  if (!schema) {
    return null;
  }

  const { specSelectors, expandDepth, includeReadOnly, includeWriteOnly } = otherProps;
  const { showExtensions, jsonldPlaygroundUrl } = getConfigs();

  const [isOpenedJsonLd, setIsOpenedJsonLd] = useState(false);
  const jsonldContext = schema.get('x-jsonld-context') || rootJsonldContext;
  const example = schema.get('example');
  let description = schema.get('description');
  let properties = schema.get('properties');
  let additionalProperties = schema.get('additionalProperties');
  let title = schema.get('title') || displayName || name;
  let requiredProperties = schema.get('required');
  let infoProperties = schema.filter((v, key) => ['maxProperties', 'minProperties', 'nullable'].indexOf(key) !== -1);
  let deprecated = schema.get('deprecated');
  let externalDocsUrl = schema.getIn(['externalDocs', 'url']);
  let externalDocsDescription = schema.getIn(['externalDocs', 'description']);
  const extensions = schema
    .entrySeq()
    .filter(([key]) => key.startsWith('x-'))
    .filter(([key]) => !['x-jsonld-context', 'x-jsonld-type'].includes(key));

  const isOAS3 = specSelectors.isOAS3();
  const allOf = isOAS3 ? schema.get('allOf') : null;
  const anyOf = isOAS3 ? schema.get('anyOf') : null;
  const oneOf = isOAS3 ? schema.get('oneOf') : null;
  const not = isOAS3 ? schema.get('not') : null;

  const JumpToPath = getComponent('JumpToPath', true);
  const Markdown = getComponent('Markdown', true);
  const Model = getComponent('Model');
  const ModelCollapse = getComponent('ModelCollapse');
  const Property = getComponent('Property');
  const Link = getComponent('Link');

  return (
    <ModelCollapse
      modelName={name}
      title={
        title && (
          <span className="model-title">
            {isRef && schema.get('$$ref') && <span className="model-hint">{schema.get('$$ref')}</span>}
            <span className="model-title__text">{title}</span>
          </span>
        )
      }
      onToggle={onToggle}
      expanded={expanded ? true : depth <= expandDepth}
      collapsedContent={
        <span>
          <span>{braceOpen}</span>...<span>{braceClose}</span>
          {isRef && (
            <span className="model-jump-to-path">
              <JumpToPath specPath={specPath} />
            </span>
          )}
        </span>
      }
    >
      <h4 className="d-flex">
        {title}
        <span className="ms-auto">
          {externalDocsUrl && (
            <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
              <Icon icon="it-external-link" size="sm" title={externalDocsDescription || externalDocsUrl} />
            </Link>
          )}
          <span className="model-jump-to-path">
            <JumpToPath specPath={specPath} content={'#'} />
          </span>
        </span>
      </h4>

      {!!deprecated && <Alert color="warning">This definition is deprecated</Alert>}

      {!!description && (
        <i>
          <Markdown source={description} />
        </i>
      )}

      <div className="neutral-2-bg p-4">
        <span className="brace-open object">{braceOpen}</span>
        <span className="inner-object">
          <table className="model code">
            <tbody>
              {properties &&
                properties.size &&
                properties
                  .entrySeq()
                  .filter(([key, value]) => {
                    return (!value.get('readOnly') || includeReadOnly) && (!value.get('writeOnly') || includeWriteOnly);
                  })
                  .map(([key, value]) => {
                    let isDeprecated = isOAS3 && value.get('deprecated');
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
                          {jsonldContext && (
                            <ContextModel
                              propertyName={key}
                              jsonldContext={jsonldContext}
                              getComponent={getComponent}
                            />
                          )}
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
        <Callout color="note" detailed className="p-4 mt-3">
          <CalloutTitle>
            Example:
            {jsonldPlaygroundUrl && jsonldContext && example && (
              <a
                className="ms-auto me-4 z-1"
                target="_blank"
                rel="noreferrer"
                href={
                  jsonldPlaygroundUrl + encodeURIComponent(JSON.stringify({ '@context': jsonldContext, ...example }))
                }
              >
                <Icon icon="it-external-link" size="sm" title="Open in playground" />
              </a>
            )}
          </CalloutTitle>
          <CalloutText>
            <pre className="m-0">{JSON.stringify(example, null, 2)}</pre>
          </CalloutText>
        </Callout>
      )}

      {!!jsonldContext && (
        <Accordion background="active">
          <AccordionItem className="mt-3">
            <AccordionHeader active={isOpenedJsonLd} onToggle={() => setIsOpenedJsonLd(!isOpenedJsonLd)}>
              JSON+LD Context
            </AccordionHeader>
            <AccordionBody active={isOpenedJsonLd}>
              <small>
                <pre className="m-0">{JSON.stringify(jsonldContext, null, 2)}</pre>
              </small>
            </AccordionBody>
          </AccordionItem>
        </Accordion>
      )}

      {infoProperties.size
        ? infoProperties
            .entrySeq()
            .map(([key, v]) => <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass={propClass} />)
        : null}
    </ModelCollapse>

    // <span className="model">
    //   <ModelCollapse
    //     modelName={name}
    //     title={titleEl}
    //     onToggle={onToggle}
    //     expanded={expanded ? true : depth <= expandDepth}
    //     collapsedContent={collapsedContent}
    //   >
    //     {!description ? null : <Markdown source={description} />}

    //     <span className="brace-open object">{braceOpen}</span>
    //     {!isRef ? null : <JumpToPathSection />}
    //     <span className="inner-object">
    //       <table className="model">
    //         <tbody>
    //           {externalDocsUrl && (
    //             <tr className="external-docs">
    //               <td>externalDocs:</td>
    //               <td>
    //                 <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
    //                   {externalDocsDescription || externalDocsUrl}
    //                 </Link>
    //               </td>
    //             </tr>
    //           )}
    //           {!deprecated ? null : (
    //             <tr className="property">
    //               <td>deprecated:</td>
    //               <td>true</td>
    //             </tr>
    //           )}
    //           {properties &&
    //             properties.size &&
    //             properties
    //               .entrySeq()
    //               .filter(([key, value]) => {
    //                 return (!value.get('readOnly') || includeReadOnly) && (!value.get('writeOnly') || includeWriteOnly);
    //               })
    //               .map(([key, value]) => {
    //                 let isDeprecated = isOAS3() && value.get('deprecated');
    //                 let isRequired = List.isList(requiredProperties) && requiredProperties.contains(key);

    //                 let classNames = ['property-row'];

    //                 if (isDeprecated) {
    //                   classNames.push('deprecated');
    //                 }

    //                 if (isRequired) {
    //                   classNames.push('required');
    //                 }

    //                 return (
    //                   <tr key={key} className={classNames.join(' ')}>
    //                     <td>
    //                       {key}
    //                       {isRequired && <span className="star">*</span>}
    //                     </td>
    //                     <td>
    //                       <Model
    //                         key={`object-${name}-${key}_${value}`}
    //                         {...otherProps}
    //                         required={isRequired}
    //                         getComponent={getComponent}
    //                         specPath={specPath.push('properties', key)}
    //                         getConfigs={getConfigs}
    //                         schema={value}
    //                         depth={depth + 1}
    //                       />
    //                     </td>
    //                   </tr>
    //                 );
    //               })
    //               .toArray()}
    //           {!showExtensions ? null : (
    //             <tr>
    //               <td>&nbsp;</td>
    //             </tr>
    //           )}
    //           {showExtensions &&
    //             schema
    //               .entrySeq()
    //               .map(([key, value]) => {
    //                 if (key.slice(0, 2) !== 'x-') {
    //                   return null;
    //                 }

    //                 const normalizedValue = !value ? null : value.toJS ? value.toJS() : value;

    //                 return (
    //                   <tr key={key} className="extension">
    //                     <td>{key}</td>
    //                     <td>{JSON.stringify(normalizedValue)}</td>
    //                   </tr>
    //                 );
    //               })
    //               .toArray()}
    //           {!additionalProperties || !additionalProperties.size ? null : (
    //             <tr>
    //               <td>{'< * >:'}</td>
    //               <td>
    //                 <Model
    //                   {...otherProps}
    //                   required={false}
    //                   getComponent={getComponent}
    //                   specPath={specPath.push('additionalProperties')}
    //                   getConfigs={getConfigs}
    //                   schema={additionalProperties}
    //                   depth={depth + 1}
    //                 />
    //               </td>
    //             </tr>
    //           )}
    //           {!allOf ? null : (
    //             <tr>
    //               <td>{'allOf ->'}</td>
    //               <td>
    //                 {allOf.map((schema, k) => (
    //                   <div key={k}>
    //                     <Model
    //                       {...otherProps}
    //                       required={false}
    //                       getComponent={getComponent}
    //                       specPath={specPath.push('allOf', k)}
    //                       getConfigs={getConfigs}
    //                       schema={schema}
    //                       depth={depth + 1}
    //                     />
    //                   </div>
    //                 ))}
    //               </td>
    //             </tr>
    //           )}
    //           {!anyOf ? null : (
    //             <tr>
    //               <td>{'anyOf ->'}</td>
    //               <td>
    //                 {anyOf.map((schema, k) => (
    //                   <div key={k}>
    //                     <Model
    //                       {...otherProps}
    //                       required={false}
    //                       getComponent={getComponent}
    //                       specPath={specPath.push('anyOf', k)}
    //                       getConfigs={getConfigs}
    //                       schema={schema}
    //                       depth={depth + 1}
    //                     />
    //                   </div>
    //                 ))}
    //               </td>
    //             </tr>
    //           )}
    //           {!oneOf ? null : (
    //             <tr>
    //               <td>{'oneOf ->'}</td>
    //               <td>
    //                 {oneOf.map((schema, k) => (
    //                   <div key={k}>
    //                     <Model
    //                       {...otherProps}
    //                       required={false}
    //                       getComponent={getComponent}
    //                       specPath={specPath.push('oneOf', k)}
    //                       getConfigs={getConfigs}
    //                       schema={schema}
    //                       depth={depth + 1}
    //                     />
    //                   </div>
    //                 ))}
    //               </td>
    //             </tr>
    //           )}
    //           {!not ? null : (
    //             <tr>
    //               <td>{'not ->'}</td>
    //               <td>
    //                 <div>
    //                   <Model
    //                     {...otherProps}
    //                     required={false}
    //                     getComponent={getComponent}
    //                     specPath={specPath.push('not')}
    //                     getConfigs={getConfigs}
    //                     schema={not}
    //                     depth={depth + 1}
    //                   />
    //                 </div>
    //               </td>
    //             </tr>
    //           )}
    //         </tbody>
    //       </table>
    //     </span>
    //     <span className="brace-close">{braceClose}</span>
    //   </ModelCollapse>

    //     <hr />

    // </span>
  );
};

export default ObjectModel;
