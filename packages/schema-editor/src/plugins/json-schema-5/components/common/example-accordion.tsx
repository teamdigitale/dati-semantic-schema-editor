import { Accordion, AccordionBody, AccordionItem, Button, Icon } from 'design-react-kit';
import type { Map } from 'immutable';
import { useState } from 'react';

interface Props {
  depth: number;
  schema: Map<any, Map<any, any>>;
  jsonldContext: Map<any, any>;
  getConfigs: () => any;
}

export function ExampleAccordion({ depth, schema, jsonldContext, getConfigs }: Props) {
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

  return depth <= 1 ? (
    <>
      <hr />
      <Accordion className="border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong className="text-primary">Example</strong>
          </div>
          <div>
            <Button
              tag="a"
              color="primary"
              size="xs"
              outline
              rel="noreferrer"
              disabled={!jsonldPlaygroundUrl || !jsonldContext || !example}
              href={jsonldPlaygroundUrl + encodeURIComponent(JSON.stringify(jsonldExample, null, 2))}
              title="Open in playground"
            >
              Open example
              <Icon icon="it-external-link" size="xs" color="primary" className="ms-2" />
            </Button>

            <Button
              color="primary"
              size="xs"
              outline={!isOpened}
              title="Toggle example accordion"
              onClick={() => setIsOpened(!isOpened)}
              className="ms-2"
            >
              {isOpened ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        <AccordionItem>
          <AccordionBody active={isOpened} listClassName="p-3" className="mt-3">
            {exampleString ? (
              <small>
                <pre className="m-0">{exampleString}</pre>
              </small>
            ) : (
              <small>
                No example provided. <br /> Please consider that you need both an example and a x-jsonld-context to open
                in playground.
              </small>
            )}
          </AccordionBody>
        </AccordionItem>
      </Accordion>
    </>
  ) : exampleString ? (
    <span className="property">
      Example: &nbsp;
      {exampleString}
    </span>
  ) : null;
}
