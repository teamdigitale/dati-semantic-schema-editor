import { useEffect, useState } from 'react';
import { GraphElement, insertSpaceInCamelCase } from './oas-graph';

export function useSuperclassDataToNodes(superclassData: { parent: string; child: string }[]): GraphElement[] {
  const [allNodes, setAllNodes] = useState<GraphElement[]>([]); // Keeps older nodes too

  useEffect(() => {
    if (!superclassData?.length) {
      return;
    }

    const newElements: GraphElement[] = [];

    for (const { child, parent } of superclassData) {
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
      // Add edges
      if (child && parent) {
        newElements.push({
          id: `${child}->${parent}`,
          source: child,
          target: parent,
          type: 'dashed',
        });
      }
    }

    setAllNodes((existingElements) => [
      ...existingElements,
      ...newElements.filter((ne) => !existingElements.some((ee) => ee?.id === ne?.id)), // Avoid duplicates
    ]);
  }, [JSON.stringify(superclassData)]);

  return allNodes;
}
