import * as schemaEditor from '@teamdigitale/schema-editor';
import { SchemaEditor } from '@teamdigitale/schema-editor';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
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

  it('should render', async () => {
    render(<Editor />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('should use the URL from hash fragment if present', async () => {
    const testUrl = 'https://example.com/schema.yaml';
    const originalLocation = window.location;
    window.location = { ...originalLocation, hash: `#url=${encodeURIComponent(testUrl)}` };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: testUrl, spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });

  it('should use the OAS spec from hash if URL is not present', async () => {
    const testFragment = '#oas:MYSwhg9gUEA';
    const originalLocation = window.location;
    window.location = {
      ...originalLocation,
      hash: testFragment,
    };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: undefined, spec: 'ciao\n', oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });

  it('should default to the starter schema URL if no hash is present', async () => {
    const originalLocation = window.location;
    window.location = {
      ...originalLocation,
      hash: '',
    };
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: 'schemas/starter-schema.oas3.yaml', spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
    window.location = originalLocation;
  });
});
