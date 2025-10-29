import { render, waitFor } from '@testing-library/react';
import { Map } from 'immutable';
import yaml from 'js-yaml';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration/hooks';
import { ActionsMenu, createBundle } from './actions-menu';

describe('ActionsMenu', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      oasCheckerUrl: 'https://test.com',
      schemaEditorUrl: 'https://test.com',
      sparqlUrl,
    });
  });

  it('should createBundle', async () => {
    const specYaml = `openapi: 3.0.3
components:
  schemas:
    Country:
      x-jsonld-type: Country
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: '@id'
        '@base': 'https://publications.europa.eu/resource/authority/country/'
      type: object
      properties:
        country:
          type: string
      example:
        country: ITA
    Location:
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: hasCountry
      type: object
      properties:
        hasCity:
          type: string
        country:
          $ref: '#/components/schemas/Country'
      example:
        hasCity: Rome
        country:
          country: ITA`;
    const specJson = yaml.load(specYaml) as any;
    const bundledSpecJson = await createBundle(specJson, { sparqlUrl });
    expect(bundledSpecJson).toBeTruthy();
    expect(bundledSpecJson['info']['x-semantic-score']).toEqual(1);
  });

  it('should download bundle when clicking download button', async () => {
    const specYaml = `openapi: 3.0.3
components:
  schemas:
    Country:
      x-jsonld-type: Country
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: '@id'
        '@base': 'https://publications.europa.eu/resource/authority/country/'
      type: object
      properties:
        country:
          type: string
      example:
        country: ITA
    Location:
      x-jsonld-context:
        '@vocab': https://w3id.org/italia/onto/CLV/
        country: hasCountry
      type: object
      properties:
        hasCity:
          type: string
        country:
          $ref: '#/components/schemas/Country'
      example:
        hasCity: Rome
        country:
          country: ITA`;
    const specJson = yaml.load(specYaml) as any;
    const specJsonMap = Map(specJson);
    const specSelectors = {
      specJson: () => specJsonMap,
    };

    const mockDump = vi.spyOn(yaml, 'dump');

    const { getByText } = render(<ActionsMenu specSelectors={specSelectors} url={''} specActions={{}} />);

    const downloadButton = getByText('Download bundle');
    downloadButton.click();
    await waitFor(() => {
      expect(mockDump).toHaveBeenCalledWith(expect.objectContaining({ info: { 'x-semantic-score': 1 } }));
    });
  });
});
