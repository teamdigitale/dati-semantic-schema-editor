import { fromJS } from 'immutable';
import { describe, expect, it } from 'vitest';

import { useRDFConverter } from './use-rdf-converter';
import { renderHook, waitFor } from '@testing-library/react';
import { JsonLdDocument } from 'jsonld';

describe('useSearch', () => {
  const schema = getSchema();

  it('should render a simple js', async () => {
    const input = schema.get('Person')?.toJS();
    const { result } = renderHook(() => useRDFConverter(input as JsonLdDocument));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));

    expect(result.current.error).toBeUndefined();

    expect(result.current.data)
      .toEqual(`_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/italia/onto/CPV/Person> .
_:b0 <https://w3id.org/italia/onto/CPV/givenName> "Roberto" .
`);
  });

  it('should render an id', async () => {
    const input = schema.get('EducationLevel')?.toJS();
    console.log('input', input);
    const { result } = renderHook(() => useRDFConverter(input as JsonLdDocument));
    await waitFor(() => expect(result.current.status).toBe('fulfilled'));
    expect(result.current.error).toBeUndefined();

    expect(result.current.data).toEqual(
      `<https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/NED> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://w3id.org/italia/onto/CPV/EducationLevel> .
<https://w3id.org/italia/controlled-vocabulary/classifications-for-people/education-level/NED> <http://www.w3.org/2000/01/rdf-schema#label> "No Education" .
`,
    );
  });
});

const getSchema = () => {
  return fromJS({
    Person: {
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
