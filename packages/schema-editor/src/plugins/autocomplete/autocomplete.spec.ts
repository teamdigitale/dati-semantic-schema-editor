import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorAutosuggestCustomPlugin } from './index';

describe('EditorAutosuggestCustomPlugin', () => {
  const mockEditor = { getValue: () => 'x-jsonld-type: ' };
  const mockSession = {};
  const mockPos = { row: 0, column: 0 };
  const mockPrefix = '';
  const mockContext = {};

  function createSystemMock(config: { sparqlAutocompleteEnabled: boolean; sparqlUrl?: string }, path: string[]) {
    return {
      getConfigs: vi.fn(() => config),
      fn: {
        getPathForPosition: vi.fn(() => path),
        AST: null,
      },
    };
  }

  function getCompleter(system: ReturnType<typeof createSystemMock>) {
    const plugin = EditorAutosuggestCustomPlugin();
    const ori = vi.fn(() => []);
    const wrap = plugin.statePlugins.editor.wrapActions.addAutosuggestionCompleters(ori, system);
    const completers = wrap(mockContext);
    return completers[0];
  }

  function runGetCompletions(completer: {
    getCompletions: (
      a: unknown,
      b: unknown,
      c: unknown,
      d: unknown,
      cb: (err: null, list: unknown[]) => void,
    ) => Promise<void>;
  }) {
    return new Promise<[null, unknown[]]>((resolve) => {
      completer.getCompletions(mockEditor, mockSession, mockPos, mockPrefix, (err, list) => {
        resolve([err as null, list as unknown[]]);
      });
    });
  }

  describe('prefetch after plugin load', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            results: { bindings: [] },
          }),
      });
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('does not call fetch when sparqlAutocompleteEnabled is false', async () => {
      const system = createSystemMock({ sparqlAutocompleteEnabled: false }, []);
      const plugin = EditorAutosuggestCustomPlugin();
      plugin.afterLoad(system);

      await new Promise((r) => setTimeout(r, 50));

      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('calls fetch when sparqlAutocompleteEnabled is true (prefetch triggers network)', async () => {
      const system = createSystemMock({ sparqlAutocompleteEnabled: true }, []);
      const plugin = EditorAutosuggestCustomPlugin();
      plugin.afterLoad(system);

      await new Promise((r) => setTimeout(r, 200));

      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('offline (sparqlAutocompleteEnabled: false)', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns static suggestions for @vocab and does not call fetch', async () => {
      const system = createSystemMock({ sparqlAutocompleteEnabled: false }, ['a', 'b', '@vocab']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'onto:CPV')).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'onto:RPO')).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns static suggestions for x-jsonld-type and does not call fetch', async () => {
      const system = createSystemMock({ sparqlAutocompleteEnabled: false }, ['a', 'b', 'x-jsonld-type']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'CPV:Person')).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'CPV:Alive')).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns static suggestions for @base and does not call fetch', async () => {
      const system = createSystemMock({ sparqlAutocompleteEnabled: false }, ['a', 'b', '@base']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'Country')).toBe(true);
      expect((suggestions as { caption: string }[]).some((s) => s.caption === 'Vehicle Code')).toBe(true);
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe('online (sparqlAutocompleteEnabled: true, mocked SPARQL)', () => {
    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('calls fetch and returns suggestions from mocked SPARQL for @vocab', async () => {
      const sparqlJson = {
        results: {
          bindings: [
            {
              ontologyUri: { value: 'https://example.org/onto/' },
              label: { value: 'Example Ontology' },
              description: { value: 'Example description' },
            },
          ],
        },
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sparqlJson),
      });

      const system = createSystemMock({ sparqlAutocompleteEnabled: true }, ['a', 'b', '@vocab']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(fetchMock).toHaveBeenCalled();
      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      const fromMock = (suggestions as { snippet: string; caption: string; meta: string }[]).find(
        (s) => s.snippet === 'https://example.org/onto/',
      );
      expect(fromMock).toBeDefined();
      expect(fromMock?.meta).toBe('onto');
    });

    it('calls fetch and returns suggestions from mocked SPARQL for x-jsonld-type', async () => {
      const sparqlJson = {
        results: {
          bindings: [
            {
              class: { value: 'https://example.org/onto/Foo' },
              label: { value: 'Foo' },
              description: { value: 'A class' },
              ontologyUri: { value: 'https://example.org/onto/Foo' },
            },
          ],
        },
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sparqlJson),
      });

      const system = createSystemMock({ sparqlAutocompleteEnabled: true }, ['a', 'b', 'x-jsonld-type']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(fetchMock).toHaveBeenCalled();
      expect(suggestions).toBeDefined();
      const fromMock = (suggestions as { snippet: string; caption: string; meta: string }[]).find(
        (s) => s.snippet === 'https://example.org/onto/Foo',
      );
      expect(fromMock).toBeDefined();
      expect(fromMock?.meta).toBe('class');
    });

    it('calls fetch and returns suggestions from mocked SPARQL for @base', async () => {
      const sparqlJson = {
        results: {
          bindings: [
            {
              controlledVocabularyUri: { value: 'https://example.org/vocab/' },
              label: { value: 'Example Vocab' },
              description: { value: 'Vocab description' },
              ontologyUri: { value: 'https://example.org/vocab/' },
            },
          ],
        },
      };
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sparqlJson),
      });

      const system = createSystemMock({ sparqlAutocompleteEnabled: true }, ['a', 'b', '@base']);
      const completer = getCompleter(system);
      const [, suggestions] = await runGetCompletions(completer);

      expect(fetchMock).toHaveBeenCalled();
      expect(suggestions).toBeDefined();
      const fromMock = (suggestions as { snippet: string; meta: string }[]).find(
        (s) => s.snippet === 'https://example.org/vocab/',
      );
      expect(fromMock).toBeDefined();
      expect(fromMock?.meta).toBe('vocab');
    });
  });
});
