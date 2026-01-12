import * as schemaEditor from '@teamdigitale/schema-editor';
import { SchemaEditor } from '@teamdigitale/schema-editor';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import * as configuration from '../../features/configuration';
import * as navigation from '../../features/navigation';
import { Editor } from './editor';

describe('<Editor />', () => {
  let schemaEditorSpy: MockInstance<typeof SchemaEditor>;
  let useNavigationSpy: MockInstance<typeof navigation.useNavigation>;

  beforeEach(() => {
    schemaEditorSpy = vi.spyOn(schemaEditor, 'SchemaEditor').mockReturnValue(<div>Test</div>);

    vi.spyOn(configuration, 'useConfiguration').mockReturnValue({
      config: { oasCheckerUrl: 'https://test.com' },
      setConfig: () => ({}),
    });

    useNavigationSpy = vi.spyOn(navigation, 'useNavigation').mockReturnValue({
      query: new URLSearchParams(),
      hash: '',
    });
  });

  it('should render', async () => {
    render(<Editor />);
    expect(screen.getByText('Test')).toBeTruthy();
  });

  it('should use the URL from hash fragment if present', async () => {
    const testUrl = 'https://example.com/schema.yaml';
    useNavigationSpy.mockReturnValue({
      query: new URLSearchParams(),
      hash: `url=${encodeURIComponent(testUrl)}`,
    });
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: testUrl, spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
  });

  it('should use the OAS spec from hash if URL is not present', async () => {
    useNavigationSpy.mockReturnValue({
      query: new URLSearchParams(),
      hash: 'oas:MYSwhg9gUEA',
    });
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: undefined, spec: 'ciao\n', oasCheckerUrl: 'https://test.com' },
      {},
    );
  });

  it('should default to the starter schema URL if no hash is present', async () => {
    useNavigationSpy.mockReturnValue({
      query: new URLSearchParams(),
      hash: '',
    });
    render(<Editor />);
    expect(schemaEditorSpy).toHaveBeenCalledWith(
      { url: 'schemas/starter-schema.oas3.yaml', spec: undefined, oasCheckerUrl: 'https://test.com' },
      {},
    );
  });
});
