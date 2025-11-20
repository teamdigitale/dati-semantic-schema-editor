import { Core } from 'cytoscape';
import { Col, Row } from 'design-react-kit';
import { List } from 'immutable';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import { useRDFClassTreeResolver } from '../../../hooks';
import { LAYOUTS, LAYOUTS_MAP, LayoutTypes } from './cytoscape-layouts';
import { oasToGraph, Node, insertSpaceInCamelCase } from './oas-graph';



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

  const { data: classData, status: classStatus } = useRDFClassTreeResolver(selectedClassUri);

  // Add superclasses to graph when loaded
  useEffect(() => {
    if (classStatus === 'fulfilled' && classData?.hierarchy && classData.hierarchy.length > 0 && selectedClassUri) {
      const newElements: Node[] = [];
      const hierarchy = classData.hierarchy;
      const seenNodes = new Set<string>();
      const seenEdges = new Set<string>();

      // Add all nodes from hierarchy (both child and parent)
      hierarchy.forEach(({ child, parent }) => {
        if (child && !seenNodes.has(child) && !elements.find((el) => el.data?.id === child)) {
          const label = child.split('/').pop() || child;
          newElements.push({
            data: {
              id: child,
              label: insertSpaceInCamelCase(label),
              type: 'rdf'
            }
          });
          seenNodes.add(child);
        }
        if (parent && !seenNodes.has(parent) && !elements.find((el) => el.data?.id === parent)) {
          const label = parent.split('/').pop() || parent;
          newElements.push({
            data: {
              id: parent,
              label: insertSpaceInCamelCase(label),
              type: 'rdf'
            }
          });
          seenNodes.add(parent);
        }
      });

      // Create edges between child and parent (child -> parent for rdfs:subClassOf)
      hierarchy.forEach(({ child, parent }) => {
        if (child && parent) {
          const edgeId = `${child}->${parent}`;
          if (!seenEdges.has(edgeId) && !elements.find((el) => el.data?.id === edgeId)) {
            newElements.push({
              data: {
                id: edgeId,
                source: child,
                target: parent,
                type: 'dashed'
              }
            });
            seenEdges.add(edgeId);
          }
        }
      });

      if (newElements.length > 0) {
        setElements((els) => [...els, ...newElements]);
      }
    } else if (classStatus === 'fulfilled' && (!classData?.hierarchy || classData.hierarchy.length === 0)) {
      // No superclasses found
      setTooltipContent(`⚠ No superclasses found for ${selectedClassUri}`);
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


  // Click handler:
  // - for RDF nodes to show superclasses
  // - for schema nodes to jump to spec location
  const handleNodeCtrlClick = useCallback(
    (e) => {
      e.stopPropagation();
      const node = e.target;
      const path: string = node.data('id');
      const type: string = node.data('type');

      // Check if Ctrl (or Cmd on Mac) is pressed
      if ((e.originalEvent.ctrlKey || e.originalEvent.metaKey) && type === 'rdf') {
        const id: string = node.data('id');
        setSelectedClassUri(id);
        setTooltipContent(id);
      } else if (path.startsWith('#/')) {
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
    const baseSize = 80 ; // node.data('label')?.length * 8;
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
              'text-wrap': 'wrap',
              'text-max-width': '80px',
              'text-overflow-wrap': 'blank',
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
              'target-arrow-shape': 'triangle-open',
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
            {selectedClassUri && classStatus === 'fulfilled' && classData?.hierarchy && classData.hierarchy.length > 0 && (
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.2)', paddingTop: '8px' }}>
                <div style={{ fontSize: '11px', color: '#90ee90', marginBottom: '4px' }}>
                  ✓ Added {classData.hierarchy.length} class relationship(s):
                </div>
                {classData.hierarchy.map(({ child, parent }, idx) => (
                  <div key={idx} style={{ fontSize: '10px', marginLeft: '8px', marginTop: '2px', color: '#ddd' }}>
                    • {child.split('/').pop()} → {parent.split('/').pop()}
                  </div>
                ))}
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
