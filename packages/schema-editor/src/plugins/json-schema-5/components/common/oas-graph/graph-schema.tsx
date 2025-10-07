import React, { useRef, useEffect, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import Cytoscape from 'cytoscape';
import elk from 'cytoscape-fcose';
import oasToGraph from './oas-graph';

Cytoscape.use(elk);
// cola represents aggregations using clusters
// breadthfirst has a good representation for layered graphs
// dagre is better than cose with many trees
// cose is ok for small graphs
const layout = 'fcose';

export const GraphSchema = ({ spec }) => {
  const { graph } = oasToGraph(spec);

  return <Graph elements={graph?.elements || []} />;
};

export const Graph = ({ elements }) => {
  console.log('Graph nodes', elements);
  const cyRef = useRef<Cytoscape.Core | null>(null);
  const [rotation, setRotation] = useState(0);
  const fontSize = 8;

  useEffect(() => {
    const cy = cyRef.current;

    if (cy) {
      cy.on('dblclick', 'node', (event) => {
        const nodeId = event.target.id();
        alert(`Node ID: ${nodeId}`);
      });
    }
  }, [elements]);

  const handleRotate = () => {
    setRotation((prevRotation) => prevRotation + 90);
  };

  return elements ? (
    <>
      <button
        onClick={handleRotate}
        //style={{ position: 'absolute', top: '-10px', right: '-10px' }}
      >
        Rotate
      </button>
      <div
        className="info"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          border: '2px solid',
          height: '100vh',
          width: '100%',
          transform: `rotate(${rotation}deg)`,
          transition: 'transform 0.5s ease',
        }}
      >
        <CytoscapeComponent
          cy={(cy) => {
            cyRef.current = cy;
            // Iterate over all nodes and update their size based on the label length
            cy.nodes().forEach((node) => {
              let label = node.data('label') || '';

              // If a label is longer than 10 chars, split on uppercase letters
              if (label.length > 10) {
                label = label.split(/(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|(?<=:)(?=[A-Za-z])/).join('\n');
                node.data('label', label);
              }

              const lines = label.split('\n');
              const longestLineLength = Math.max(...lines.map((line) => line.length));
              const numberOfLines = lines.length;

              // Adjust size for multi-line labels to maintain a circle shape
              const newWidth = Math.max(20, longestLineLength * fontSize * 0.8);
              const newHeight = Math.max(20, numberOfLines * fontSize * 1.8);
              const circleSize = Math.max(newWidth, newHeight);

              node.style({
                width: `${circleSize}px`,
                height: `${circleSize}px`,
              });
            });
            // Re-run the layout after updating node sizes to prevent overlap.
            cy.layout({
              name: layout,
              spacingFactor: 1,
              avoidOverlap: true,
              nodeDimensionsIncludeLabels: true,
            }).run();

            cy.edges().forEach((edge) => {
              if (edge.target().data('type') === 'rdf') {
                edge.data('target_is_rdf', true);
              }
            });
          }}
          elements={elements}
          style={{ width: '100%', height: '100%' }}
          layout={{
            name: layout,
            spacingFactor: 1,
            avoidOverlap: true, // Prevents node overlap
            // nodeRepulsion: 4000,
            nodeDimensionsIncludeLabels: true,
          }}
          stylesheet={[
            {
              selector: 'node',
              style: {
                label: 'data(label)',
                'background-color': '#11479e',
                width: '10px',
                height: '10px',
                'font-size': `${fontSize}px`,
                'font-family': 'Titillium Web, sans-serif',
                'text-valign': 'center', // Center the label vertically
                'text-halign': 'center', // Center the label horizontally
                color: '#ffffff', // Optional: Set the label color to white for better contrast
                'text-wrap': 'wrap',
                'text-max-width': '80px',
                'white-space': 'pre-wrap',
                'text-overflow': 'ellipsis',
                shape: 'circle',
              },
            },
            {
              selector: 'edge',
              style: {
                width: 1,
                'line-color': '#9dbaea',
                'target-arrow-color': '#9dbaea',
                'target-arrow-shape': 'triangle',
              },
            },
            {
              selector: 'edge[target_is_rdf]',
              style: {
                'line-style': 'dashed',
              },
            },
            {
              selector: 'node[type="rdf"]',
              style: {
                'background-color': '#008055', // success
              },
            },
            {
              selector: 'node[type="blank"]',
              style: {
                'background-color': '#768593',
                // 'font-size': '4px',
                // 'border-color': '#11479e',
                // 'border-width': 1,
              },
            },
            {
              selector: 'node[type="@typed"]',
              style: {
                //  shape: 'rectangle',
              },
            },
          ]}
        />
      </div>
    </>
  ) : (
    <pre>{JSON.stringify(Object.keys(elements))}</pre>
  );
};

export default GraphSchema;
