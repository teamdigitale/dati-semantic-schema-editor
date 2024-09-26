import { Icon, Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'design-react-kit';
import type { Map } from 'immutable';
import { useState } from 'react';

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
  if (!example) {
    return null;
  }
  const exampleString: string = JSON.stringify(example, null, 2);

  const OpenInPlaygroundButton = () =>
    jsonldPlaygroundUrl && jsonldContext ? (
      <a
        target="_blank"
        rel="noreferrer"
        style={{ color: 'inherit' }}
        onClick={(evt) => evt.stopPropagation()}
        href={
          jsonldPlaygroundUrl +
          encodeURIComponent(
            JSON.stringify({
              '@context': jsonldContext.toJSON(),
              ...(schema?.get('x-jsonld-type') ? { '@type': schema.get('x-jsonld-type') } : {}),
              ...example.toJSON(),
            }),
          )
        }
      >
        <Icon icon="it-external-link" size="sm" title="Open in playground" fill="currentColor" className="ms-2 mb-1" />
      </a>
    ) : null;

  return depth <= 1 ? (
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
  ) : (
    <div className="json-schema-2020-12-keyword json-schema-2020-12-keyword--example">
      <span className="json-schema-2020-12-keyword__name json-schema-2020-12-keyword__name--secondary m-0">
        Example:
      </span>
      <span className="json-schema-2020-12-keyword__value json-schema-2020-12-keyword__value--const ms-2">
        {exampleString}
      </span>
    </div>
  );
}
