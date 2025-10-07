import cytoscape, { Core } from 'cytoscape';
import { List } from 'immutable';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';

// Initialize cytoscape layout
// cola represents aggregations using clusters
// breadthfirst has a good representation for layered graphs
// dagre is better than cose with many trees
// cose is ok for small graphs
import fcose from 'cytoscape-fcose';
import { oasToGraph } from './oas-graph';
cytoscape.use(fcose);

export const GraphSchema = ({ specSelectors, editorActions }) => {
  const { elements } = useMemo(() => oasToGraph(specSelectors?.spec().toJSON()).graph, [specSelectors]);
  const cyRef = useRef<Core | null>(null);

  // Centra il grafico al load
  useEffect(() => {
    cyRef.current?.center();
  }, [cyRef.current]);

  // Click sui nodi
  const handleNodeClick = useCallback((e) => {
    e.stopPropagation();
    const path: string = e.target._private.data.id;
    if (!path.startsWith('#/')) {
      return;
    }
    const specPath = List(path.split('/').slice(1));
    const jumpPath = specSelectors.bestJumpPath({ specPath });
    editorActions.jumpToLine(specSelectors.getSpecLineFromPath(jumpPath));
  }, []);

  useEffect(() => {
    cyRef.current?.on('click', 'node', handleNodeClick);
    return () => {
      cyRef.current?.off('click', 'node', handleNodeClick);
    };
  }, [cyRef.current]);

  return (
    <CytoscapeComponent
      style={{ width: '100%', height: 'calc(100vh - 210px)' }}
      cy={(cy: Core) => (cyRef.current = cy)}
      elements={elements}
      layout={{
        name: 'fcose',
        fit: true,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true,
        spacingFactor: 1,
      }}
      stylesheet={[
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            width: (node) => node.data('label').length * 8,
            height: (node) => node.data('label').length * 8,
            padding: '16px',
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#11479e',
            color: '#ffffff',
          },
        },
        {
          selector: 'node[type="rdf"]',
          style: {
            'background-color': '#008055',
          },
        },
        {
          selector: 'node[type="blank"]',
          style: {
            'background-color': '#768593',
          },
        },
        {
          selector: 'node[type="@typed"]',
          style: {},
        },
        //
        // Edges
        {
          selector: 'edge',
          style: {
            width: 2,
            'curve-style': 'straight',
            'line-color': '#9dbaea',
            'target-arrow-color': '#9dbaea',
            'target-arrow-shape': 'triangle',
          },
        },
        {
          selector: 'edge[type="dashed"]',
          style: {
            'line-style': 'dashed',
            'target-arrow-shape': 'none',
          },
        },
      ]}
    />
  );
};

export default GraphSchema;
