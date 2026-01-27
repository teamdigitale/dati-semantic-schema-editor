import * as utils from '@teamdigitale/schema-editor-utils';
import { render, waitFor } from '@testing-library/react';
import { Map } from 'immutable';
import yaml from 'js-yaml';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as configuration from '../../configuration/hooks';
import { LayoutTypes } from '../../layout';
import { ActionsMenu, createBundle } from './actions-menu';

describe('ActionsMenu', () => {
  const sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql';

  beforeEach(() => {
    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      oasCheckerUrl: 'https://test.com',
      schemaEditorUrl: 'https://test.com',
      sparqlUrl,
    });

    vi.spyOn(utils, 'calculateSchemaSemanticScore').mockResolvedValue({
      resolvedSpecJson: { info: { 'x-semantic-score': 1 } },
      schemaSemanticScore: 0.5,
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

    const system = {
      specSelectors,
      specActions: {},
      getConfigs: () => ({ layout: LayoutTypes.EDITOR }),
    };

    const { getByText } = render(<ActionsMenu url={''} {...system} />);

    const downloadButton = getByText('Download bundle');
    downloadButton.click();
    await waitFor(() => {
      expect(mockDump).toHaveBeenCalledWith(expect.objectContaining({ info: { 'x-semantic-score': 1 } }));
    });
  });

  describe('layout-based actions visibility', () => {
    const specSelectors = {
      specJson: () => Map({}),
      specStr: () => '',
    };

    it('must show all editor actions when layout is EDITOR', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        oasCheckerUrl: 'https://test.com',
        schemaEditorUrl: 'https://test.com',
        sparqlUrl,
      });

      const system = {
        specSelectors,
        specActions: {},
        getConfigs: () => ({ layout: LayoutTypes.EDITOR }),
      };

      const { getByText, queryByText } = render(<ActionsMenu url={''} {...system} />);

      // Check that all editor actions are present
      expect(getByText('New from template')).toBeTruthy();
      expect(getByText('Download editor content')).toBeTruthy();
      expect(getByText('Download as JSON')).toBeTruthy();
      expect(getByText('Download bundle')).toBeTruthy();
      expect(getByText('Copy as URL')).toBeTruthy();
      expect(getByText('Copy as OAS Checker URL')).toBeTruthy();

      // Check that "Open in Schema Editor" is NOT present in editor layout
      expect(queryByText('Open in Schema Editor')).toBeNull();
    });

    it('must show only "Open in Schema Editor" when layout is not EDITOR and schemaEditorUrl is provided', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        oasCheckerUrl: 'https://test.com',
        schemaEditorUrl: 'https://test.com',
        sparqlUrl,
      });

      const system = {
        specSelectors,
        specActions: {},
        getConfigs: () => ({ layout: LayoutTypes.VIEWER }),
      };

      const { getByText, queryByText } = render(<ActionsMenu url={''} {...system} />);

      // Check that only "Open in Schema Editor" is present
      expect(getByText('Open in Schema Editor')).toBeTruthy();

      // Check that editor actions are not present
      expect(queryByText('New from template')).toBeNull();
      expect(queryByText('Download editor content')).toBeNull();
      expect(queryByText('Download as JSON')).toBeNull();
      expect(queryByText('Download bundle')).toBeNull();
      expect(queryByText('Copy as URL')).toBeNull();
      expect(queryByText('Copy as OAS Checker URL')).toBeNull();
    });

    it('must not show anything when layout is not EDITOR and schemaEditorUrl is not provided', () => {
      vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
        oasCheckerUrl: 'https://test.com',
        schemaEditorUrl: undefined,
        sparqlUrl,
      });

      const system = {
        specSelectors,
        specActions: {},
        getConfigs: () => ({ layout: LayoutTypes.VIEWER }),
      };

      const { container, queryByText } = render(<ActionsMenu url={''} {...system} />);

      // Component should return false (nothing rendered) when actions.length === 0
      expect(container.firstChild).toBeNull();
      // Verify no action items are rendered
      expect(queryByText('Open in Schema Editor')).toBeNull();
      expect(queryByText('New from template')).toBeNull();
    });
  });
});
