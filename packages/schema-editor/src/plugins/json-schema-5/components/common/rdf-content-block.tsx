import { Accordion, AccordionBody, AccordionHeader, AccordionItem, Icon } from 'design-react-kit';
import { useMemo, useState } from 'react';
import { useRDFConverter } from '../../hooks';
import { copyToClipboard, shortenRDF } from '../../utils';

export function RDFContentBlock({ jsonld }) {
  const [isOpenedJsonLd, setIsOpenedJsonLd] = useState(false);

  const { data, status } = useRDFConverter(jsonld);
  const { namespaces, shortenedTurtle } = useMemo(() => shortenRDF(data), [data]);

  const prefixes = namespaces
    ? Object.entries(namespaces)
        .map(([key, ns]) => `@prefix ${key}: <${ns}> .\n`)
        .join('')
    : '';

  if (status === 'error') {
    return <div className="alert alert-danger">Error converting to text/turtle</div>;
  }

  return jsonld ? (
    <Accordion background="active">
      <AccordionItem className="mt-3">
        <AccordionHeader active={isOpenedJsonLd} onToggle={() => setIsOpenedJsonLd(!isOpenedJsonLd)}>
          RDF{' '}
          {jsonld['@context'] ? (
            <Icon
              icon="it-copy"
              size="sm"
              fill="currentColor"
              className="ms-2 mb-1"
              title="Copy to clipboard"
              onClick={(evt) => {
                copyToClipboard(prefixes + '\n' + shortenedTurtle);
                evt.stopPropagation();
              }}
            />
          ) : (
            <Icon
              icon="it-warning-circle"
              size="sm"
              fill="currentColor"
              className="ms-2 mb-1"
              title="You need both an example and a x-jsonld-context to show RDF content"
            />
          )}
        </AccordionHeader>
        <AccordionBody active={isOpenedJsonLd}>
          {namespaces && shortenedTurtle && (
            <small>
              <span title={prefixes}># Hover to show prefixes</span>
              <pre className="m-0">{shortenedTurtle}</pre>
            </small>
          )}
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  ) : null;
}
