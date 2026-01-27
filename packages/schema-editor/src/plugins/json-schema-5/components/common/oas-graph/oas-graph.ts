import { resolveIri, uri2shortUri } from '../../../utils/curie';

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
  leaf?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'solid' | 'dashed' | 'equivalent';
}

export type GraphElement = GraphNode | GraphEdge;

interface OasMap {
  label: string;
  refs: string[];
  type?: string;
}

function lastpath(s: string) {
  return s.split('/').slice(-1)[0];
}

export function oasToMap(oas: any) {
  // A state variable to store the result.
  const result: Record<string, OasMap> = {};

  function collectRefs(schema: any, path: string, nested: boolean = false) {
    if (!schema || typeof schema !== 'object') return;
    console.log('collectRefs', schema, path);

    if (schema?.properties) {
      schema.type = 'object';
    }

    for (const [key, value] of Object.entries(schema || {})) {
      if (!value) continue;
      if (['description', 'title', 'default', 'example', 'examples'].includes(key)) {
        continue;
      }

      console.log('processing key', key, value);
      if (key === 'type' && value !== 'object' && value !== 'array') {
        if (!result[path]) {
          result[path] = { label: lastpath(path), refs: [], type: 'blank' };
        } else if (!nested) {
          console.log('setting blank type for', path, result[path], key, value);
          result[path].type = 'blank';
        }
      } else if (key === 'x-jsonld-type') {
        if (!result[path]) {
          result[path] = { label: lastpath(path), refs: [] };
        }

        result[path].type = '@typed';

        const valueStr = value as string;
        const jsonldTypeUri = resolveIri(valueStr, schema['x-jsonld-context'] || {});
        const jsonldType = /^(https?:\/\/|#\/)/.test(valueStr) ? uri2shortUri(valueStr) : valueStr;
        result[jsonldTypeUri] = { label: jsonldType, refs: [], type: 'rdf' };
        result[path].refs.push(jsonldTypeUri);
      }
      // A remote reference.
      else if (key === '$ref' && typeof value === 'string') {
        if (!result[path]) {
          result[path] = { label: lastpath(path), refs: [] };
        }
        result[path].refs.push(value);

        if (!result[path].type && !nested) {
          result[path].type = 'ref';
        }

        // Push the remote reference to the result.
        if (!result[value]) {
          result[value] = { label: lastpath(value), refs: [] };
        }
      }
      // Recurse into object.
      else if (typeof value === 'object') {
        collectRefs(value, path, true);
        console.log('after recursion', path, result[path], key, value);
        if (result[path]) {
          result[path].type = result[path]?.type || 'nonscalar';
        }
      } else if (value === 'array') {
        if (result[path]) {
          result[path].type = result[path]?.type || 'nonscalar';
        }
      }
    }
  }

  for (const [schemaName, schema] of Object.entries(oas?.components?.schemas || {})) {
    if (schema) {
      const schemaPath = `#/components/schemas/${schemaName}`;
      const schema = oas.components.schemas[schemaName];
      collectRefs(schema, schemaPath);
    }
  }

  return { result };
}

export function insertSpaceInCamelCase(label: string): string {
  return label.replace(/([a-z])([A-Z])/g, '$1 $2');
}

export function mapToGraph(oasMap: Record<string, OasMap>) {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const [source, { label, refs: targets, type }] of Object.entries(oasMap)) {
    // Create nodes
    nodes.push({
      id: source,
      label: insertSpaceInCamelCase(label),
      leaf: targets.length === 0 && type !== 'rdf' ? 1 : 0,
      ...(type !== undefined && { type }),
    });

    // Create edges
    for (const target of targets) {
      const targetType = oasMap[target].type;
      edges.push({
        id: `${source}->${target}`,
        source,
        target,
        type: targetType === 'rdf' ? 'dashed' : 'solid',
      });
    }
  }

  return {
    graph: {
      nodes,
      edges,
      elements: [...nodes, ...edges] satisfies GraphElement[],
    },
  };
}

export function oasToGraph(oas: any) {
  const { result } = oasToMap(oas);
  return mapToGraph(result);
}
