import { uri2shortUri } from '../../../utils/curie';

interface OasMap {
  [key: string]: {
    label: string;
    refs: string[];
    type?: string;
  };
}

export interface Node {
  data: {
    id?: string;
    source?: string;
    target?: string;
    label?: string;
    type?: string;
    leaf?: number;
  };
}

function lastpath(s: string) {
  return s.split('/').slice(-1)[0];
}

export function oasToMap(oas: any) {
  // A state variable to store the result.
  const result: OasMap = {};

  function collectRefs(schema: any, path: string, nested : boolean = false) {
    if (!schema || typeof schema !== 'object') return;
    console.log('collectRefs', schema, path);
    for (const [key, value] of Object.entries(schema || {})) {
      if (!value) continue;
      if (['description', 'x-jsonld-context', 'title', 'default', 'example', 'examples'].includes(key)) {
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
      }
      else if (key === 'x-jsonld-type') {
        if (!result[path]) {
          result[path] = { label: lastpath(path), refs: [] };
        }

        result[path].type = '@typed';

        const valueStr = value as string;
        const jsonldType = /^(https?:\/\/|#\/)/.test(valueStr) ? uri2shortUri(valueStr) : valueStr;
        result[jsonldType] = { label: jsonldType, refs: [], type: 'rdf' };
        result[path].refs.push(jsonldType);
      }
      // A remote reference.
      else if (key === '$ref' && typeof value === 'string') {
        if (!result[path]) {
          result[path] = { label: lastpath(path), refs: [] };
        }
        result[path].refs.push(value);

        // Push the remote reference to the result.
        if (!result[value]) {
          result[value] = { label: lastpath(value), refs: [] };
        }
      }
      else if (typeof value === 'object') {
        collectRefs(value, path, true);
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

export function mapToGraph(oasMap: OasMap) {
  const element_ids: Node[] = [];
  const element_links: Node[] = [];

  for (const [source, { label, refs: targets, type }] of Object.entries(oasMap)) {
    element_ids.push({
      data: {
        id: source,
        label,
        leaf: (targets.length === 0 && type !== 'rdf') ? 1 : 0,
        ...(type !== undefined && { type })
      }
    });
    // Create edges
    for (const target of targets) {
      const targetType = oasMap[target].type;
      element_links.push({ data: { source, target, ...(targetType === 'rdf' ? { type: 'dashed' } : {}) } });
    }
  }
  const elements = [...element_ids, ...element_links];
  return { graph: { elements } };
}

export function oasToGraph(oas: any) {
  const { result } = oasToMap(oas);
  return mapToGraph(result);
}
