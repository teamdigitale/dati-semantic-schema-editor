import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration';
import { useRDFPropertyResolver } from './use-rdf-ontologies-resolver';

describe('useRDFOntologiesResolver', () => {
  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      sparqlUrl: 'https://virtuoso-dev-external-service-ndc-dev.apps.cloudpub.testedev.istat.it/sparql',
    });
  });

  describe('useRDFPropertyResolver', () => {
    it('should check real values for https://w3id.org/italia/onto/CPV/taxCode', async () => {
      const ontologicalProperty = 'https://w3id.org/italia/onto/CPV/taxCode';
      const { result } = renderHook(() => useRDFPropertyResolver(ontologicalProperty));
      await waitFor(() => expect(result.current.status).toBe('fulfilled'));
      expect(result.current.data).toEqual({
        controlledVocabulary: undefined,
        ontologicalClass: 'https://w3id.org/italia/onto/CPV/Person',
        ontologicalProperty,
        ontologicalPropertyComment: 'The tax code of a person.',
        ontologicalType: 'http://www.w3.org/2000/01/rdf-schema#Literal',
      });
    });

    it('should check real values for https://w3id.org/italia/social-security/onto/contributions/retribuzioneOrariaEffettiva', async () => {
      const ontologicalProperty =
        'https://w3id.org/italia/social-security/onto/contributions/retribuzioneOrariaEffettiva';
      const { result } = renderHook(() => useRDFPropertyResolver(ontologicalProperty));
      await waitFor(() => expect(result.current.status).toBe('fulfilled'));
      expect(result.current.data).toEqual({
        controlledVocabulary: undefined,
        ontologicalClass: 'https://w3id.org/italia/social-security/onto/contributions/LavoratoreDomestico',
        ontologicalProperty,
        ontologicalPropertyComment:
          'It is the hourly wage stipulated in the Employment Contract. The minimum hourly wage allowed must not be lower than that established by the regulations of the current year. It may vary in the field of the employment relationship giving rise to different role -playing requests for the same person.',
        ontologicalType: undefined,
      });
    });
  });
});
