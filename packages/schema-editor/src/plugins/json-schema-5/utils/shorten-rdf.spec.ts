import { renderHook, waitFor } from '@testing-library/react';
import { fromJS } from 'immutable';
import { JsonLdDocument } from 'jsonld';
import { describe, expect, it } from 'vitest';
import { useRDFConverter } from '../hooks/use-rdf-converter';
import { shortenRDF } from './shorten-rdf';

describe('useSearch', () => {
  const schema = getSchema();

  it('should shorten a simple js', async () => {
    const example = schema.get('Place')?.toJS();
    const { result } = renderHook(() => useRDFConverter(example as JsonLdDocument));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    const { shortenedTurtle } = shortenRDF(result.current.data);
    expect(shortenedTurtle).toEqual(`_:b0 rdf:type CPV:Person .
_:b0 CPV:givenName "Roberto" .
`);
  });

  it('should shorten an id', async () => {
    const example = schema.get('EducationLevel')?.toJS();
    const { result } = renderHook(() => useRDFConverter(example as JsonLdDocument));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    const { shortenedTurtle } = shortenRDF(result.current.data);
    expect(shortenedTurtle).toEqual(`education-level:NED rdf:type CPV:EducationLevel .
education-level:NED rdfs:label "No Education" .
`);
  });

  it('should ignore simpe ns', async () => {
    const data = `<mailto:a@b.c> a foaf:Person .`;
    const { shortenedTurtle } = shortenRDF(data);
    expect(shortenedTurtle).toEqual(`<mailto:a@b.c> a foaf:Person .`);
  });
});

const getSchema = () => {
  return fromJS({
    Place: {
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',
      },
      '@type': 'Person',
      givenName: 'Roberto',
    },
    EducationLevel: {
      '@context': {
        '@vocab': 'https://w3id.org/italia/onto/CPV/',

        '@base': 'https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/',
        id: '@id',
        name: 'http://www.w3.org/2000/01/rdf-schema#label',
      },
      '@type': 'EducationLevel',
      id: 'NED',
      name: 'No Education',
    },
    // EOC
  });
};
