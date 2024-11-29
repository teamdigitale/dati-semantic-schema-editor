import { AsyncState } from '../models';
import { useJsonLDResolver } from './use-jsonld-resolver';
import { useRDFPropertyResolver } from './use-rdf-ontologies-resolver';

export function useOntologicalClassResolver(
  jsonldContext: Map<any, any>,
  jsonldType: string | undefined,
  path: string[],
): AsyncState<{ ontologicalClassUri: string | undefined; inferred: boolean }> {
  const resolutionPath = jsonldType ? [...path.slice(0, -1), jsonldType] : path;

  const {
    data: jsonldResolverData,
    status: jsonldResolverStatus,
    error: jsonldResolverError,
  } = useJsonLDResolver(jsonldContext, resolutionPath);

  const {
    data: rdfPropertyResolverData,
    status: rdfPropertyResolverStatus,
    error: rdfPropertyResolverError,
  } = useRDFPropertyResolver(jsonldResolverData?.fieldUri);

  // If no jsonld context, return jsonld type or undefined
  if (!jsonldContext) {
    return {
      status: 'fulfilled',
      data: {
        ontologicalClassUri: jsonldType || undefined,
        inferred: false,
      },
    };
  }

  // If x-jsonld-type exists try to resolve it with jsonld context
  else if (jsonldType) {
    return {
      status: jsonldResolverStatus,
      error: jsonldResolverError,
      data: {
        ontologicalClassUri: jsonldResolverData?.fieldUri,
        inferred: false,
      },
    };
  }
  // If parent jsonld context exists, but no x-jsonld-type use context + propertyName
  return {
    status:
      jsonldResolverStatus === 'fulfilled' && rdfPropertyResolverStatus === 'fulfilled'
        ? 'fulfilled'
        : jsonldResolverStatus === 'pending' || rdfPropertyResolverStatus === 'pending'
          ? 'pending'
          : jsonldResolverStatus === 'error' || rdfPropertyResolverStatus === 'error'
            ? 'error'
            : 'idle',
    error: rdfPropertyResolverError || jsonldResolverError,
    data: {
      ontologicalClassUri: rdfPropertyResolverData?.ontologicalClass,
      inferred: true,
    },
  };
}
