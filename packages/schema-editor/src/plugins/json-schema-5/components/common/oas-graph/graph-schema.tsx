import { Core } from 'cytoscape';
import { Col, Row } from 'design-react-kit';
import { List } from 'immutable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useRDFClassResolver } from '../../../hooks';
import { LAYOUTS, LAYOUTS_MAP, LayoutTypes } from './cytoscape-layouts';
import { oasToGraph, Node } from './oas-graph';

export const GraphSchema = ({ specSelectors, editorActions }) => {
  const specJson = specSelectors?.spec().toJSON();
  const initialElements = useMemo(() => oasToGraph(specJson).graph.elements, [JSON.stringify(specJson)]);
  const [elements, setElements] = useState(initialElements);

  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  console.log('Elements', elements);

  const cyRef = useRef<Core | null>(null);
  const [showSemanticRelations, setShowSemanticRelations] = useState(false);
  const [layout, setLayout] = useState<LayoutTypes>('fcose');
  const [tooltipContent, setTooltipContent] = useState<string | null>(null);
  const [selectedClassUri, setSelectedClassUri] = useState<string | undefined>(undefined);

  const { data: classData, status: classStatus } = useRDFClassResolver(selectedClassUri);

  // Add superclasses to graph when loaded
  useEffect(() => {
    if (classStatus === 'fulfilled' && classData.ontologicalClassSuperClasses && selectedClassUri) {
      const newElements: Node[] = [];

      classData.ontologicalClassSuperClasses.forEach((superClass) => {
        // Add superclass node if it doesn't exist
        if (!elements.find((el) => el.data?.id === superClass)) {
          const label = superClass.split('/').pop() || superClass;
          newElements.push({
            data: {
              id: superClass,
              label,
              type: 'rdf'
            }
          });
        }

        // Add edge from selected class to superclass
        const edgeId = `${selectedClassUri}->${superClass}`;
        if (!elements.find((el) => el.data?.id === edgeId)) {
          newElements.push({
            data: {
              id: edgeId,
              source: selectedClassUri,
              target: superClass,
              type: 'dashed'
            }
          });
        }
      });

      if (newElements.length > 0) {
        setElements((els) => [...els, ...newElements]);
      }
    }
  }, [classStatus, classData, selectedClassUri]);

  // Update layout when layout state changes
  useEffect(() => {
    if (!cyRef.current || !LAYOUTS_MAP[layout]) {
      return;
    }
    cyRef.current.layout(LAYOUTS_MAP[layout]).run();
  }, [layout, elements]);

  // Centra il grafico al load
  useEffect(() => {
    setTimeout(() => {
      cyRef.current?.center();
    }, 100);
  }, [cyRef.current]);

  // Click sui nodi
  const handleNodeClick = useCallback(
    (e) => {
      e.stopPropagation();
      const node = e.target;
      const path: string = node.data('id');
      const type: string = node.data('type');

      // Load RDF hierarchy.
      if (type === 'rdf') {
        const newNodeId = `new-node-${Math.floor(Math.random() * 5) }`;
        setElements((els) => [...els, { data: { id: newNodeId, label: 'New Node', type: 'rdf'} }, { data: { source: path, target: newNodeId } }]);
        return;
      }

      if (path.startsWith('#/')) {
        const specPath = List(path.split('/').slice(1));
        const jumpPath = specSelectors.bestJumpPath({ specPath });
        editorActions.jumpToLine(specSelectors.getSpecLineFromPath(jumpPath));
      }
    },
    [editorActions, specSelectors],
  );

  // Ctrl+Click handler for RDF nodes to show superclasses
  const handleNodeCtrlClick = useCallback(
    (e) => {
      const node = e.target;
      const type: string = node.data('type');

      // Check if Ctrl (or Cmd on Mac) is pressed
      if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && type === 'rdf') {
        e.stopPropagation();
        const id: string = node.data('id');
        setSelectedClassUri(id);
        setTooltipContent(id);
      }
    },
    [],
  );

  useEffect(() => {
    cyRef.current?.on('click', 'node', handleNodeCtrlClick);
    return () => {
      cyRef.current?.off('click', 'node', handleNodeCtrlClick);
    };
  }, [cyRef.current, handleNodeCtrlClick]);

  // Tooltip for RDF nodes
  useEffect(() => {
    const handleMouseOver = (e) => {
      const node = e.target;
      const type: string = node.data('type');

      if (type === 'rdf') {
        const id: string = node.data('id');
        setTooltipContent(id);
      }
    };

    cyRef.current?.on('mouseover', 'node[type="rdf"]', handleMouseOver);

    return () => {
      cyRef.current?.off('mouseover', 'node[type="rdf"]', handleMouseOver);
    };
  }, [cyRef.current]);

  const radius = (node) => {
    const sizePerLink = 2;
    const degree = node.degree();
    const baseSize = node.data('label')?.length * 8;
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
        style={{ width: '100%', height: 'calc(100vh - 210px)' }}
        cy={(cy: Core) => (cyRef.current = cy)}
        elements={elements}
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

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          maxWidth: '400px',
          minHeight: '36px',
          zIndex: 1000,
        }}
      >
        {tooltipContent ? (
          <div>
            <a
              href={tooltipContent}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#4fc3f7',
                textDecoration: 'none',
                wordBreak: 'break-all',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {tooltipContent}
            </a>
            {selectedClassUri && classStatus === 'fulfilled' && classData.ontologicalClassSuperClasses && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#90ee90' }}>
                ✓ Added {classData.ontologicalClassSuperClasses.length} superclass(es) to graph
              </div>
            )}
            {selectedClassUri && classStatus === 'pending' && (
              <div style={{ marginTop: '8px', fontSize: '11px', color: '#aaa' }}>Loading superclasses...</div>
            )}
          </div>
        ) : (
          <span style={{ color: '#999' }}>Hover over an RDF node or Ctrl+click to load superclasses</span>
        )}
      </div>
    </div>
  );
};

export default GraphSchema;
