import { Accordion, AccordionBody, AccordionItem, Button, Icon } from 'design-react-kit';
import { useState } from 'react';
import { copyToClipboard } from '../../utils';

export function JsonLdContextAccordion({ jsonldContext, depth }) {
  const [isOpened, setIsOpened] = useState(false);
  const hasContentToShow = !!jsonldContext;

  return depth === 1 ? (
    <>
      <hr />
      <Accordion className="border-0">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <strong className="text-primary">JSON+LD Context</strong>
          </div>
          <div>
            <Button
              color="primary"
              size="xs"
              outline
              title={hasContentToShow ? 'Copy to clipboard' : 'No x-jsonld-context provided'}
              disabled={!hasContentToShow}
              onClick={(evt) => {
                copyToClipboard(JSON.stringify(jsonldContext, null, 2));
                evt.stopPropagation();
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
            {hasContentToShow ? (
              <small>
                <pre className="m-0">{JSON.stringify(jsonldContext, null, 2)}</pre>
              </small>
            ) : (
              <small>No x-jsonld-context provided</small>
            )}
          </AccordionBody>
        </AccordionItem>
      </Accordion>
    </>
  ) : null;
}
