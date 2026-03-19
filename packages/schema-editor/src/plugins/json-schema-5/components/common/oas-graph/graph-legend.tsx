import './graph-legend.scss';

import { Button, Callout, CalloutText, CalloutTitle, Collapse, Icon } from 'design-react-kit';
import { useState } from 'react';

interface LegendItem {
  label: string;
  indicator: React.CSSProperties;
}

interface LegendSection {
  title: string;
  items: LegendItem[];
}

// Legend configuration for models
const LEGEND_ITEMS: LegendSection[] = [
  {
    title: 'Node Colors',
    items: [
      {
        label: 'Schema nodes',
        indicator: {
          width: '16px',
          height: '16px',
          backgroundColor: '#11479e',
          borderRadius: '50%',
        },
      },
      {
        label: 'RDF nodes',
        indicator: {
          width: '16px',
          height: '16px',
          backgroundColor: '#008055',
          borderRadius: '50%',
        },
      },
      {
        label: 'L0 classes',
        indicator: {
          width: '16px',
          height: '16px',
          backgroundColor: '#ffffff',
          border: '3px dotted #008055',
          borderRadius: '50%',
        },
      },
      {
        label: 'Blank nodes',
        indicator: {
          width: '16px',
          height: '16px',
          backgroundColor: '#768593',
          borderRadius: '50%',
        },
      },
    ],
  },
  {
    title: 'Node Shapes',
    items: [
      {
        label: 'Connected nodes',
        indicator: {
          width: '16px',
          height: '16px',
          backgroundColor: '#11479e',
          borderRadius: '50%',
        },
      },
      {
        label: 'Leaf nodes',
        indicator: {
          width: '16px',
          height: '12px',
          backgroundColor: '#11479e',
          borderRadius: '2px',
        },
      },
    ],
  },
  {
    title: 'Edges',
    items: [
      {
        label: 'Model relation',
        indicator: {
          width: '24px',
          height: '2px',
          backgroundColor: '#9dbaea',
        },
      },
      {
        label: 'RDF relation',
        indicator: {
          width: '24px',
          height: '2px',
          background: 'repeating-linear-gradient(to right, #9dbaea 0, #9dbaea 4px, transparent 4px, transparent 8px)',
        },
      },
      {
        label: 'Equivalent class',
        indicator: {
          width: '24px',
          height: '3px',
          backgroundColor: '#ff6b35',
        },
      },
    ],
  },
];

export const GraphLegend = () => {
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  return (
    <div className="position-absolute top-0 end-0 p-2" style={{ zIndex: 10 }}>
      <Callout detailed className="p-4">
        <CalloutTitle className="mb-0">
          <Button
            color="link"
            size="xs"
            onClick={() => setIsLegendOpen(!isLegendOpen)}
            aria-expanded={isLegendOpen}
            aria-label={isLegendOpen ? 'Collapse legend' : 'Expand legend'}
            icon={true}
            className="d-flex align-items-center justify-content-start p-0"
            style={{ fontSize: 'inherit', zIndex: 10 }}
            block
          >
            <Icon icon={isLegendOpen ? 'it-minus-circle' : 'it-plus-circle'} size="sm" />
            Legenda
          </Button>
        </CalloutTitle>

        <Collapse isOpen={isLegendOpen} className="mt-4">
          {LEGEND_ITEMS.map((section, sectionIndex) => (
            <CalloutText key={sectionIndex}>
              <strong className="text-uppercase">{section.title}:</strong>

              <ul className="list-unstyled ms-2 mt-1 mb-0">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="d-flex align-items-center mb-1">
                    <span className="d-inline-block me-2" style={item.indicator} />
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            </CalloutText>
          ))}
        </Collapse>
      </Callout>
    </div>
  );
};
