import { Accordion, AccordionItem, AccordionHeader, AccordionBody } from 'design-react-kit';
import { useState } from 'react';

export function JsonLdContextBlock({ jsonldContext, depth }) {
  const [isOpenedJsonLd, setIsOpenedJsonLd] = useState(false);

  return jsonldContext && depth === 1 ? (
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
  ) : null;
}
