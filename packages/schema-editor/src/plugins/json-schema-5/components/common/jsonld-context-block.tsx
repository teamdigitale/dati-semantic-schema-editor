import { Accordion, AccordionItem, AccordionHeader, AccordionBody, Icon } from 'design-react-kit';
import { useState } from 'react';
import { copyToClipboard } from '../../utils';

export function JsonLdContextBlock({ jsonldContext, depth }) {
  const [isOpenedJsonLd, setIsOpenedJsonLd] = useState(false);

  return depth === 1 ? (
    <Accordion background="active">
      <AccordionItem className="mt-3">
        <AccordionHeader active={isOpenedJsonLd} onToggle={() => setIsOpenedJsonLd(!isOpenedJsonLd)}>
          JSON+LD Context
          {jsonldContext ? (
            <Icon
              icon="it-copy"
              size="sm"
              fill="currentColor"
              className="ms-2 mb-1"
              title="Copy to clipboard"
              onClick={(evt) => {
                copyToClipboard(JSON.stringify(jsonldContext, null, 2));
                evt.stopPropagation();
              }}
            />
          ) : (
            <Icon
              icon="it-warning-circle"
              size="sm"
              fill="currentColor"
              className="ms-2 mb-1"
              title="x-jsonld-context is not set."
            />
          )}
        </AccordionHeader>
        <AccordionBody active={isOpenedJsonLd}>
          <small>
            <pre className="m-0">{JSON.stringify(jsonldContext, null, 2)}</pre>
          </small>
        </AccordionBody>
      </AccordionItem>
    </Accordion>
  ) : null;
}
