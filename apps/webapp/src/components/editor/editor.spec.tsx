import * as schemaEditor from '@teamdigitale/schema-editor';
import { SchemaEditor } from '@teamdigitale/schema-editor';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, MockInstance, test, vi } from 'vitest';
import * as configuration from '../../features/configuration';
import { Editor } from './editor';

describe('<Editor />', () => {
  let schemaEditorSpy: MockInstance<typeof SchemaEditor>;

  beforeEach(() => {
    schemaEditorSpy = vi.spyOn(schemaEditor, 'SchemaEditor').mockReturnValue(<div>Test</div>);

    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      config: { oasCheckerUrl: 'https://test.com' },
      setConfig: () => ({}),
    });
  });

  test('it should render', async () => {
    render(<Editor />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  test('it should use the URL from search parameters if present', async () => {
    const testUrl = 'https://example.com/schema.yaml';
    const originalLocation = window.location;
    window.location = { ...originalLocation, search: `?url=${encodeURIComponent(testUrl)}` };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: testUrl, spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });

  test('it should use the fragment from hash if URL is not present', async () => {
    const testFragment = '#oas:MYSwhg9gUEA';
    const originalLocation = window.location;
    window.location = {
      ...originalLocation,
      hash: testFragment,
      search: '',
    };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: undefined, spec: 'ciao\n', oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });

  test('it should default to the starter schema URL if neither URL nor fragment is present', async () => {
    const originalLocation = window.location;
    window.location = {
      ...originalLocation,
      search: '',
      hash: '',
    };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: 'schemas/starter-schema.oas3.yaml', spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });

  test('it should prioritize URL from search parameters over fragment from hash', async () => {
    const testUrl = 'https://example.com/schema.yaml';
    const testFragment = '#oas:MYSwhg9gUEA';
    const originalLocation = window.location;
    window.location = {
      ...originalLocation,
      search: `?url=${encodeURIComponent(testUrl)}`,
      hash: testFragment,
    };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: testUrl, spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });
});
