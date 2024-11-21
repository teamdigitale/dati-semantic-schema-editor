import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as hooks from '../../../hooks';
import { RDFHelperClassVocabulariesBlock } from './rdf-helper-class-vocabularies-block';

describe('<RDFHelperClassVocabulariesBlock />', () => {
  it('should show vocabularies', async () => {
    vi.spyOn(hooks, 'useRDFClassVocabulariesResolver').mockReturnValue({
      status: 'fulfilled',
      data: [
        {
          controlledVocabulary: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/cities',
          label: 'Controlled Vocabulary for Italian Cities',
          subclass:
            'https://w3id.org/italia/onto/CLV/AdminUnitComponent,https://w3id.org/italia/onto/CLV/City,https://w3id.org/italia/onto/CLV/Feature',
          api: 'https://ndc-dev.apps.cloudpub.testedev.istat.it/api/vocabularies/istat/cities',
        },
        {
          controlledVocabulary:
            'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/geographical-distribution',
          subclass:
            'https://w3id.org/italia/onto/CLV/AdminUnitComponent,https://w3id.org/italia/onto/CLV/Feature,https://w3id.org/italia/onto/CLV/GeographicalDistribution',
          api: 'https://ndc-dev.apps.cloudpub.testedev.istat.it/api/vocabularies/istat/geographical-distribution',
        },
        {
          controlledVocabulary: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/regions',
          label: 'Controlled Vocabulary for Italian Regions',
          subclass:
            'https://w3id.org/italia/onto/CLV/AddressComponent,https://w3id.org/italia/onto/CLV/Feature,https://w3id.org/italia/onto/CLV/Region',
          api: 'https://ndc-dev.apps.cloudpub.testedev.istat.it/api/vocabularies/agid/regions',
        },
        {
          controlledVocabulary: 'https://w3id.org/italia/controlled-vocabulary/territorial-classifications/provinces',
          subclass:
            'https://w3id.org/italia/onto/CLV/AdminUnitComponent,https://w3id.org/italia/onto/CLV/Feature,https://w3id.org/italia/onto/CLV/Province',
          api: 'https://ndc-dev.apps.cloudpub.testedev.istat.it/api/vocabularies/agid/provinces',
        },
      ],
    });
    const result = render(<RDFHelperClassVocabulariesBlock classUri={'https://w3id.org/italia/onto/CLV/Feature'} />);
    expect(result.container.querySelectorAll('table tbody tr').length).toEqual(4);
  });
});
