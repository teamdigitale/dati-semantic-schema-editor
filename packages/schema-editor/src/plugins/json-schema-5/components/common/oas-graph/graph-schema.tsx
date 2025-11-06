import { Core } from 'cytoscape';
import { Col, FormGroup, Row, Select, Toggle } from 'design-react-kit';
import { List } from 'immutable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { Layouts, LAYOUTS_MAP } from './cytoscape-layouts';
import { oasToGraph } from './oas-graph';

export const GraphSchema = ({ specSelectors, editorActions }) => {
  const { elements } = useMemo(() => oasToGraph(specSelectors?.spec().toJSON()).graph, [specSelectors]);
  const cyRef = useRef<Core | null>(null);
  const [showSemanticRelations, setShowSemanticRelations] = useState(false);
  const [layout, setLayout] = useState<Layouts>('fcose');

  // Update layout when layout state changes
  useEffect(() => {
    if (!cyRef.current || !LAYOUTS_MAP[layout]) {
      return;
    }
    cyRef.current.layout(LAYOUTS_MAP[layout]).run();
  }, [layout]);

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

  const radius = (node) => {
    const sizePerLink = 2;
    const degree = node.degree();
    const baseSize = node.data('label')?.length * 8;
    return baseSize + degree * sizePerLink;
  };

  console.log('elements', elements);
  return (
    <div>
      <Row>
        <Col xs={12} md={6} lg={4} className="me-auto">
          <FormGroup check>
            <Toggle
              label="Semantic Relations"
              checked={showSemanticRelations}
              onChange={(e) => setShowSemanticRelations(e.target.checked)}
            />
          </FormGroup>
        </Col>

        <Col xs={12} md={6}>
          <Select label="Layout" value={layout} onChange={(value) => setLayout(value as Layouts)}>
            <option value={'fcose' satisfies Layouts}>fcose</option>
            <option value={'breadthfirst' satisfies Layouts}>breadthfirst</option>
          </Select>
        </Col>
      </Row>

      <CytoscapeComponent
        style={{ width: '100%', height: 'calc(100vh - 210px)' }}
        cy={(cy: Core) => (cyRef.current = cy)}
        elements={elements}
        layout={LAYOUTS_MAP['fcose']}
        stylesheet={[
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              width: radius,
              height: radius,
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
              width: 'label',
              height: 'label',
            },
          },
          {
            selector: 'node[type="@typed"]',
            style: {},
          },
          {
            selector: 'node[leaf=1]',
            style: {
              shape: 'rectangle',
            },
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
    </div>
  );
};

export default GraphSchema;
