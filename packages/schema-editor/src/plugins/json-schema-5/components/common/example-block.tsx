import { Icon, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'design-react-kit';
import type { Map } from 'immutable';
import { useState } from 'react';
import { RDFContentBlock } from './rdf-content-block';

interface Props {
  depth: number;
  schema: Map<any, Map<any, any>>;
  jsonldContext: Map<any, any>;
  getConfigs: () => any;
}

export function ExampleBlock({ depth, schema, jsonldContext, getConfigs }: Props) {
  const { jsonldPlaygroundUrl } = getConfigs();
  const [isOpened, setIsOpened] = useState(false);

  const example = schema.get('example');
  const exampleString: string = JSON.stringify(example, null, 2);

  const jsonldExample =
    example && jsonldContext
      ? {
          '@context': jsonldContext.toJSON(),
          ...(schema?.get('x-jsonld-type') ? { '@type': schema.get('x-jsonld-type') } : {}),
          ...(example.toJSON ? example.toJSON() : example),
        }
      : null;

  const OpenInPlaygroundButton = () =>
    jsonldPlaygroundUrl && jsonldContext && example ? (
      <a
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
        onClick={(evt) => evt.stopPropagation()}
        href={jsonldPlaygroundUrl + encodeURIComponent(JSON.stringify(jsonldExample, null, 2))}
      >
        <Icon icon="it-external-link" size="sm" title="Open in playground" fill="currentColor" className="ms-2 mb-1" />
      </a>
    ) : (
      <Icon
        icon="it-warning-circle"
        size="sm"
        fill="currentColor"
        className="ms-2 mb-1"
        title="You need both an example and a x-jsonld-context to open in playground"
      />
    );

  return depth <= 1 ? (
    <>
      <Accordion background="active">
        <AccordionItem className="mt-3">
          <AccordionHeader active={isOpened} onToggle={() => setIsOpened(!isOpened)}>
            Example
            <OpenInPlaygroundButton />
          </AccordionHeader>
          <AccordionBody active={isOpened}>
            <small>
              <pre className="m-0">{exampleString}</pre>
            </small>
          </AccordionBody>
        </AccordionItem>
      </Accordion>
      <RDFContentBlock jsonld={jsonldExample || {}} />
    </>
  ) : exampleString ? ( // Show nested types example only if it's not empty.
    <div className="json-schema-2020-12-keyword json-schema-2020-12-keyword--example">
      <span className="json-schema-2020-12-keyword__name json-schema-2020-12-keyword__name--secondary m-0">
        Example:
      </span>
      <span className="json-schema-2020-12-keyword__value json-schema-2020-12-keyword__value--const ms-2">
        {exampleString}
      </span>
    </div>
  ) : null;
}
