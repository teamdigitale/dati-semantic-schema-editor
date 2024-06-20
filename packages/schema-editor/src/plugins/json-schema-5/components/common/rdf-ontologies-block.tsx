import { Icon, LinkList, LinkListItem, Popover, PopoverBody, PopoverHeader, Spinner } from 'design-react-kit';
import { useRef, useState } from 'react';
import { useRDFOntologiesResolver } from '../../hooks';

export function RDFOntologiesBlock({ jsonldContext, propertyName }) {
  const targetRef = useRef(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { data: items = [], status } = useRDFOntologiesResolver(jsonldContext, propertyName);
  const item = items[items.length - 1];

  return status === 'pending' ? (
    <span className="d-inline-block align-middle">
      <Spinner active small />
    </span>
  ) : item ? (
    <span>
      (
      <a href={item.href} ref={targetRef} className="me-1">
        <Icon icon="it-link" size="xs" className="me-1" />
        {item.title}
      </a>
      <Popover
        placement="bottom"
        trigger="hover"
        target={targetRef}
        isOpen={popoverOpen}
        toggle={() => setPopoverOpen(!popoverOpen)}
      >
        <PopoverHeader>
          <Icon icon="it-help-circle" size="xs" />
          Linked resources
        </PopoverHeader>

        <PopoverBody>
          <p>These are the ontology linked resources:</p>

          <LinkList>
            {items.map((x, i) => (
              <LinkListItem
                key={i}
                href={x.href}
                target="_blank"
                rel="noreferrer"
                className="d-flex justify-content-between icon-right"
              >
                <span className="text-truncate">{x.title}</span>
                <Icon aria-hidden color="primary" icon="it-link" size="sm" />
              </LinkListItem>
            ))}
          </LinkList>
        </PopoverBody>
      </Popover>
      )
    </span>
  ) : null;
}
