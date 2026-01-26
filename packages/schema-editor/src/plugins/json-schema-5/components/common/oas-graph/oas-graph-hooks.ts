import { useEffect, useState } from 'react';
import { RDFClassTreeData } from '../../../hooks';
import { GraphElement, insertSpaceInCamelCase } from './oas-graph';

export function useSuperclassDataToNodes(superclassData: RDFClassTreeData[]): GraphElement[] {
  const [allNodes, setAllNodes] = useState<GraphElement[]>([]); // Keeps older nodes too

  useEffect(() => {
    if (!superclassData?.length) {
      return;
    }

    const newElements: GraphElement[] = [];

    for (const { child, parent, equivalent } of superclassData) {
      // Add child nodes
      if (child) {
        newElements.push({
          id: child,
          label: insertSpaceInCamelCase(child.split('/').pop() ?? child),
          type: 'rdf',
        });
      }
      // Add parent nodes
      if (parent) {
        newElements.push({
          id: parent,
          label: insertSpaceInCamelCase(parent.split('/').pop() ?? parent),
          type: 'rdf',
        });
      }
      // Add equivalent nodes
      if (equivalent) {
        // If this is an equivalentClass relationship, use 'equivalent' type, otherwise 'dashed' for subClassOf
        newElements.push({
          id: equivalent,
          label: insertSpaceInCamelCase(equivalent.split('/').pop() ?? equivalent),
          type: 'rdf',
        });
      }
      // Add child-parent edges
      if (child && parent) {
        newElements.push({
          id: `${child}->${parent}`,
          source: child,
          target: parent,
          type: 'dashed',
        });
      }
      // Add equivalent edges
      if (child && equivalent) {
        newElements.push({
          id: `${child}->${equivalent}`,
          source: child,
          target: equivalent,
          type: 'equivalent',
        });
      }
    }

    const filteredNewElements = newElements.filter((ne) => !allNodes.some((an) => an?.id === ne?.id)); // Avoid duplicates
    if (filteredNewElements.length === 0) {
      return;
    }
    setAllNodes((existingElements) => [...existingElements, ...filteredNewElements]);
  }, [JSON.stringify(superclassData)]);

  return allNodes;
}
