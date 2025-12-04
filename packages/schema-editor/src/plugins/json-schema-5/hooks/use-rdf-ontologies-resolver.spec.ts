import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import {
  useRDFPropertyResolver,
  useRDFClassTreeResolver,
  useRDFClassResolver,
  useRDFClassPropertiesResolver,
  useRDFClassVocabulariesResolver,
} from './use-rdf-ontologies-resolver';

describe('useRDFPropertyResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.example.com' });
  });

  it('should resolve RDF property with domain, range and comment', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            domain: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            class: { value: 'https://w3id.org/italia/onto/CPV/Text' },
            comment: { value: 'The given name of a person' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFPropertyResolver('https://w3id.org/italia/onto/CPV/givenName'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data).toEqual({
      isFound: true,
      ontologicalClass: 'https://w3id.org/italia/onto/CPV/Person',
      ontologicalProperty: 'https://w3id.org/italia/onto/CPV/givenName',
      ontologicalType: 'https://w3id.org/italia/onto/CPV/Text',
      ontologicalPropertyComment: 'The given name of a person',
      controlledVocabulary: undefined,
    });
  });

  it('should skip query when fieldUri is undefined', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderHook(() => useRDFPropertyResolver(undefined));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should resolve controlled vocabulary when available', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            domain: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            class: { value: 'https://w3id.org/italia/onto/CPV/EducationLevel' },
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
            },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFPropertyResolver('https://w3id.org/italia/onto/CPV/hasEducationLevel'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.controlledVocabulary).toBe(
      'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
    );
  });
});

describe('useRDFClassTreeResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.example.com' });
  });

  it('should resolve class hierarchy excluding blank nodes', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            parent: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Entity' },
            child: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Agent' },
          },
          {
            parent: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Object' },
            child: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Agent' },
          },
          {
            parent: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Entity' },
            child: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Object' },
          },
          {
            parent: { type: 'uri', value: 'https://w3id.org/italia/onto/CPV/Person' },
            child: { type: 'uri', value: 'https://w3id.org/italia/onto/CPV/Alive' },
          },
          {
            parent: { type: 'uri', value: 'https://w3id.org/italia/onto/l0/Agent' },
            child: { type: 'uri', value: 'https://w3id.org/italia/onto/CPV/Person' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassTreeResolver('https://w3id.org/italia/onto/CPV/Alive'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data).toHaveLength(5);
    expect(result.current.data).toEqual([
      {
        parent: 'https://w3id.org/italia/onto/l0/Entity',
        child: 'https://w3id.org/italia/onto/l0/Agent',
      },
      {
        parent: 'https://w3id.org/italia/onto/l0/Object',
        child: 'https://w3id.org/italia/onto/l0/Agent',
      },
      {
        parent: 'https://w3id.org/italia/onto/l0/Entity',
        child: 'https://w3id.org/italia/onto/l0/Object',
      },
      {
        parent: 'https://w3id.org/italia/onto/CPV/Person',
        child: 'https://w3id.org/italia/onto/CPV/Alive',
      },
      {
        parent: 'https://w3id.org/italia/onto/l0/Agent',
        child: 'https://w3id.org/italia/onto/CPV/Person',
      },
    ]);
  });

  it('should skip query when classUri is undefined', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderHook(() => useRDFClassTreeResolver(undefined));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should handle empty responses', async () => {
    const mockResponse = {
      results: {
        bindings: [],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassTreeResolver('https://w3id.org/italia/onto/CPV/NonExistentClass'));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.data).toEqual([]);
  });
});

describe('useRDFClassResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.example.com' });
  });

  it('should resolve class with label, comment and superclasses', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            classUri: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            label: { value: 'Person' },
            comment: { value: 'A human being' },
            superClasses: { value: 'https://w3id.org/italia/onto/CPV/Agent,http://www.w3.org/2002/07/owl#Thing' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassResolver('https://w3id.org/italia/onto/CPV/Person'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data).toEqual({
      ontologicalClass: 'https://w3id.org/italia/onto/CPV/Person',
      ontologicalClassLabel: 'Person',
      ontologicalClassComment: 'A human being',
      ontologicalClassSuperClasses: ['https://w3id.org/italia/onto/CPV/Agent', 'http://www.w3.org/2002/07/owl#Thing'],
    });
  });

  it('should skip query when classUri is not a valid URI', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderHook(() => useRDFClassResolver('not-a-uri'));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should filter out blank nodes from superclasses', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            classUri: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            label: { value: 'Person' },
            superClasses: { value: 'https://w3id.org/italia/onto/CPV/Agent' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassResolver('https://w3id.org/italia/onto/CPV/Person'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.ontologicalClassSuperClasses).toEqual(['https://w3id.org/italia/onto/CPV/Agent']);
  });
});

describe('useRDFClassPropertiesResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.example.com' });
  });

  it('should resolve all properties for a class including inherited ones', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            baseClass: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            fieldUri: { value: 'https://w3id.org/italia/onto/CPV/givenName' },
            range: { value: 'https://w3id.org/italia/onto/CPV/Text' },
            label: { value: 'given name' },
            comment: { value: 'The given name of a person' },
            controlledVocabulary: { value: '' },
          },
          {
            baseClass: { value: 'https://w3id.org/italia/onto/CPV/Agent' },
            fieldUri: { value: 'https://w3id.org/italia/onto/CPV/identifier' },
            range: { value: 'https://w3id.org/italia/onto/CPV/Identifier' },
            label: { value: 'identifier' },
            comment: { value: 'An identifier for the agent' },
            controlledVocabulary: { value: '' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassPropertiesResolver('https://w3id.org/italia/onto/CPV/Person'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.classUri).toBe('https://w3id.org/italia/onto/CPV/Person');
    expect(result.current.data?.classProperties).toHaveLength(2);
    expect(result.current.data?.classProperties?.[0].fieldUri).toBe('https://w3id.org/italia/onto/CPV/givenName');
    expect(result.current.data?.classProperties?.[1].baseClass).toBe('https://w3id.org/italia/onto/CPV/Agent');
  });

  it('should skip query when classUri is undefined', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderHook(() => useRDFClassPropertiesResolver(undefined));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should handle properties with controlled vocabularies', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            baseClass: { value: 'https://w3id.org/italia/onto/CPV/Person' },
            fieldUri: { value: 'https://w3id.org/italia/onto/CPV/hasEducationLevel' },
            range: { value: 'https://w3id.org/italia/onto/CPV/EducationLevel' },
            label: { value: 'has education level' },
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
            },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassPropertiesResolver('https://w3id.org/italia/onto/CPV/Person'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.classProperties?.[0].controlledVocabulary).toBe(
      'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
    );
  });
});

describe('useRDFClassVocabulariesResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({ sparqlUrl: 'https://sparql.example.com' });
  });

  it('should resolve vocabularies for a class and its subclasses', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/provinces',
            },
            label: { value: 'Provinces' },
            subclass: { value: 'https://w3id.org/italia/onto/CLV/Province' },
            api: { value: 'https://api.example.com/provinces' },
          },
          {
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/regions',
            },
            label: { value: 'Regions' },
            subclass: { value: 'https://w3id.org/italia/onto/CLV/Region' },
            api: { value: 'https://api.example.com/regions' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassVocabulariesResolver('https://w3id.org/italia/onto/CLV/Feature'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].controlledVocabulary).toBe(
      'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/provinces',
    );
    expect(result.current.data?.[1].label).toBe('Regions');
  });

  it('should skip query when classUri is undefined', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch');

    renderHook(() => useRDFClassVocabulariesResolver(undefined));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should handle vocabularies without API endpoints', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level',
            },
            label: { value: 'Education Levels' },
            subclass: { value: 'https://w3id.org/italia/onto/CPV/EducationLevel' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() =>
      useRDFClassVocabulariesResolver('https://w3id.org/italia/onto/CPV/EducationLevel'),
    );

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.[0].api).toBeUndefined();
  });

  it('should prefer English labels over Italian when available', async () => {
    const mockResponse = {
      results: {
        bindings: [
          {
            controlledVocabulary: {
              value: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/provinces',
            },
            label: { value: 'Provinces' },
            subclass: { value: 'https://w3id.org/italia/onto/CLV/Province' },
          },
        ],
      },
    };

    vi.spyOn(global, 'fetch').mockResolvedValue(new Response(JSON.stringify(mockResponse)));

    const { result } = renderHook(() => useRDFClassVocabulariesResolver('https://w3id.org/italia/onto/CLV/Feature'));

    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.data?.[0].label).toBe('Provinces');
  });
});
