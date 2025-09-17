import { Map } from 'immutable';
import { resolvePropertyByJsonldContext } from './jsonld-resolver';

export class ResolvedPropertiesGroups {
  valid: string[] = [];
  unknown: string[] = [];
}

export async function determinePropertiesToValidate(jsonldContext: Map<any, any>, propertiesPaths: string[][]) {
  const resolvedProperties = await Promise.all(
    propertiesPaths.map((propertyPath) => resolvePropertyByJsonldContext(jsonldContext, propertyPath)),
  );
  const resolvedPropertiesFieldUris = resolvedProperties.map((x) => x.fieldUri as string);
  const resolvedPropertiesGroups: ResolvedPropertiesGroups = resolvedPropertiesFieldUris.reduce((groups, fieldUri) => {
    if (fieldUri?.startsWith('@')) {
      groups.valid = [...groups.valid.filter((x) => x !== fieldUri), fieldUri];
    } else if (fieldUri) {
      groups.unknown = [...groups.unknown.filter((x) => x !== fieldUri), fieldUri];
    }
    return groups;
  }, new ResolvedPropertiesGroups());

  return resolvedPropertiesGroups;
}

export function buildOntoScoreSparqlQuery(properties: string[]) {
  return `
    SELECT (COUNT(DISTINCT  ?fieldUri) as ?count) WHERE {
      VALUES ?fieldUri { ${properties.map((propertyName) => `<${propertyName}>`).join(' ')} }

      FILTER EXISTS {
        ?fieldUri rdf:type ?validType .
        FILTER(?validType IN (rdf:Property, owl:ObjectProperty, owl:DatatypeProperty, owl:FunctionalProperty))
      }
    }
  `;
}

export async function fetchValidOntoScorePropertiesCount(properties: string[], options: { sparqlUrl: string }) {
  const sparqlQuery = buildOntoScoreSparqlQuery(properties);
  const endpoint = `${options.sparqlUrl?.trim()}?format=json&query=${encodeURIComponent(sparqlQuery)}`;
  const response = await fetch(endpoint, { cache: 'force-cache' });
  if (!response.ok) {
    return 0;
  }
  const sparqlData = await response.json();
  return parseInt(sparqlData?.results?.bindings?.[0]?.count?.value || '0');
}
