import { Accordion, AccordionBody, AccordionItem, Button, Icon } from 'design-react-kit';
import { Map } from 'immutable';
import { useMemo, useState } from 'react';
import { useRDFConverter } from '../../hooks';
import { copyToClipboard, shortenRDF } from '../../utils';

interface Props {
  schema: Map<any, Map<any, any>>;
  jsonldContext: Map<any, any>;
}

export function RDFContentAccordion({ schema, jsonldContext }: Props) {
  const [isOpened, setIsOpened] = useState(false);
  const jsonld = useMemo(() => {
    const example = schema.get('example');
    return example && jsonldContext
      ? {
          '@context': jsonldContext.toJSON(),
          ...(schema?.get('x-jsonld-type') ? { '@type': schema.get('x-jsonld-type') } : {}),
          ...(example.toJSON ? example.toJSON() : example),
        }
      : {};
  }, [schema, jsonldContext]);

  const { data, status } = useRDFConverter(jsonld);
  const { namespaces, shortenedTurtle } = useMemo(() => shortenRDF(data), [data]);
  const prefixes = namespaces
    ? Object.entries(namespaces)
        .map(([key, ns]) => `@prefix ${key}: <${ns}> .\n`)
        .join('')
    : '';

  return (
    <>
      <hr />
      <Accordion className="border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong className="text-primary">RDF</strong>
          </div>
          <div>
            <Button
              color="primary"
              size="xs"
              outline
              className="ms-2"
              title="Copy to clipboard"
              disabled={!jsonld?.['@context']}
              onClick={(evt) => {
                evt.stopPropagation();
                copyToClipboard(prefixes + '\n' + shortenedTurtle);
              }}
            >
              Copy
              <Icon icon="it-copy" size="xs" color="primary" className="ms-2" />
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
            {status === 'error' ? (
              <span>Error converting to text/turtle</span>
            ) : namespaces && shortenedTurtle ? (
              <small>
                <span title={prefixes}># Hover to show prefixes</span>
                <pre className="m-0">{shortenedTurtle}</pre>
              </small>
            ) : (
              <small>No valid JSON+LD data</small>
            )}
          </AccordionBody>
        </AccordionItem>
      </Accordion>
    </>
  );
}
