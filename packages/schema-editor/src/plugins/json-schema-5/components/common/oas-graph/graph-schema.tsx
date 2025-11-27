import { Core } from 'cytoscape';
import { Alert, Col, Row } from 'design-react-kit';
import { List } from 'immutable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useRDFClassTreeResolver } from '../../../hooks';
import { LAYOUTS, LAYOUTS_MAP, LayoutTypes } from './cytoscape-layouts';
import { oasToGraph } from './oas-graph';
import { useSuperclassDataToNodes } from './oas-graph-hooks';

export const GraphSchema = ({ specSelectors, editorActions }) => {
  // Cytoscape reference
  const cyRef = useRef<Core | null>(null);

  // Nodes from written spec
  const specNodes = useMemo(
    () => oasToGraph(specSelectors?.spec().toJSON()).graph.elements,
    [JSON.stringify(specSelectors?.spec().toJSON())],
  );

  // Nodes from resolved superclasses
  const [selectedClassUri, setSelectedClassUri] = useState<string | undefined>(undefined);
  const { data: superclassData = [], status: superclassStatus } = useRDFClassTreeResolver(selectedClassUri);
  const superclassNodes = useSuperclassDataToNodes(superclassData);

  // All nodes (merge both spec and superclass nodes)
  const allNodes = useMemo(() => {
    return [...specNodes, ...superclassNodes.filter((node) => !specNodes.some((n) => n?.id === node?.id))]; // Avoid duplicates if already present in specNodes
  }, [specNodes, superclassNodes]);

  // Click handler:
  // - for RDF nodes to load superclasses
  // - for schema nodes to jump to spec location
  const handleNodeCtrlClick = useCallback(
    (e) => {
      e.stopPropagation();
      const node = e.target;
      const path: string = node.data('id');
      const type: string = node.data('type');

      // If pressed Ctrl (or Cmd on Mac) and the node is an RDF node, load superclasses
      if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && type === 'rdf') {
        setSelectedClassUri(path);
      }
      // If the node is a spec node, jump to the spec location in the editor
      else if (path.startsWith('#/')) {
        const specPath = List(path.split('/').slice(1));
        const jumpPath = specSelectors.bestJumpPath({ specPath });
        editorActions.jumpToLine(specSelectors.getSpecLineFromPath(jumpPath));
      }
    },
    [editorActions, specSelectors],
  );

  useEffect(() => {
    cyRef.current?.on('click', 'node', handleNodeCtrlClick);
    return () => {
      cyRef.current?.off('click', 'node', handleNodeCtrlClick);
    };
  }, [cyRef.current, handleNodeCtrlClick]);

  // Update layout when layout state changes
  const [layout, setLayout] = useState<LayoutTypes>('fcose');
  useEffect(() => {
    if (!cyRef.current || !LAYOUTS_MAP[layout]) {
      return;
    }
    cyRef.current.layout(LAYOUTS_MAP[layout]).run();
  }, [layout, allNodes]);

  // Centra il grafico al load
  useEffect(() => {
    setTimeout(() => {
      cyRef.current?.center();
    }, 100);
  }, [cyRef.current]);

  // Balloon radius calculation function
  const radius = (node) => {
    const sizePerLink = 2;
    const degree = node.degree();
    const baseSize = 80; // node.data('label')?.length * 8;
    return baseSize + degree * sizePerLink;
  };

  return (
    <div style={{ position: 'relative' }}>
      <Row>
        <Col xs={12} md={6} lg={4} className="me-auto">
          {/* <FormGroup check>
            <Toggle
              label="Semantic Relations"
              checked={showSemanticRelations}
              onChange={(e) => setShowSemanticRelations(e.target.checked)}
            />
          </FormGroup> */}
        </Col>

        <Col xs={12} md={6}>
          <div className="select-wrapper">
            <select value={layout} onChange={(e) => setLayout(e.target.value as LayoutTypes)}>
              {LAYOUTS.map((x) => (
                <option key={x} value={x}>
                  Layout {LAYOUTS_MAP[x].name}
                </option>
              ))}
            </select>
          </div>
        </Col>
      </Row>

      <CytoscapeComponent
        style={{ width: '100%', height: 'calc(100vh - 230px)' }}
        cy={(cy: Core) => (cyRef.current = cy)}
        elements={allNodes.map((x) => ({ data: x }))}
        layout={LAYOUTS_MAP[layout]}
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
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'text-overflow-wrap': 'break-word',
            },
          },
          {
            selector: 'node[type="rdf"]',
            style: {
              'background-color': '#008055',
            },
          },
          {
            selector: 'node[id^="https://w3id.org/italia/onto/l0"]',
            style: {
              'background-color': '#ffffff',
              color: '#000000',
              shape: 'ellipse',
              'border-width': 3,
              'border-color': '#008055',
              'border-style': 'dotted',
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
              'target-arrow-shape': 'triangle',
            },
          },
        ]}
      />

      {/* Alert superclasses resolver */}
      <div className="position-absolute bottom-0 end-0 p-2">
        <Alert
          color={
            superclassStatus === 'idle' || superclassStatus === 'pending'
              ? 'info'
              : superclassStatus === 'error'
                ? 'error'
                : !superclassData?.length
                  ? 'warning'
                  : 'success'
          }
        >
          {superclassStatus === 'idle'
            ? 'Hold CTRL/CMD + click on an RDF node to load its superclasses'
            : superclassStatus === 'pending'
              ? `Loading superclasses for ${selectedClassUri}...`
              : superclassStatus === 'error'
                ? `Error loading superclasses for ${selectedClassUri}`
                : !superclassData?.length
                  ? `No superclasses found for ${selectedClassUri}`
                  : `Added ${superclassData.length} class relationship(s)`}
        </Alert>
      </div>
    </div>
  );
};

export default GraphSchema;
