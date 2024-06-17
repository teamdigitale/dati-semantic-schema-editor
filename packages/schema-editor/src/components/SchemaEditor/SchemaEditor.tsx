import './SchemaEditor.scss';

import { useEffect, useRef } from 'react';
import type SwaggerUI from 'swagger-ui';
import { EditorThemePlugin, ErrorsPlugin, JSONSchema5Plugin, LayoutPlugin, OverviewPlugin } from '../../plugins';

interface Props {
  spec?: string | object;
  url?: string;
}

export function SchemaEditor({ spec, url }: Props) {
  const instance = useRef<typeof SwaggerUI>(null);
  const prevSpec = usePrevious(spec);
  const prevUrl = usePrevious(url);

  useEffect(() => {
    async function loadInstance() {
      const SwaggerEditor = await import('swagger-editor').then((x) => x.default);
      const SwaggerUI = await import('swagger-ui').then((x) => x.default);

      instance.current = new SwaggerUI({
        ...(spec ? { spec } : {}),
        ...(url ? { url } : {}),
        dom_id: '#schema-editor',
        layout: 'ItaliaSchemaEditorLayout',
        presets: [SwaggerUI.presets.apis],
        plugins: [
          ...Object.values(SwaggerEditor.plugins),
          EditorThemePlugin,
          ErrorsPlugin,
          JSONSchema5Plugin,
          OverviewPlugin,
          LayoutPlugin,
          SwaggerUI.plugins.SafeRender({
            fullOverride: true,
            componentList: ['ItaliaSchemaEditorLayout', 'Topbar', 'EditorContainer'],
          }),
        ],
        showExtensions: true,
        swagger2GeneratorUrl: 'https://generator.swagger.io/api/swagger.json',
        oas3GeneratorUrl: 'https://generator3.swagger.io/openapi.json',
        swagger2ConverterUrl: 'https://converter.swagger.io/api/convert',
        jsonldPlaygroundUrl: 'https://json-ld.org/playground/#startTab=tab-expand&json-ld=',
      });
    }
    if (document.readyState === 'complete') loadInstance();
    else window.onload = () => loadInstance();
  }, []);

  useEffect(() => {
    if (instance.current) {
      const prevStateUrl = instance.current?.specSelectors.url();
      if (url !== prevStateUrl || url !== prevUrl) {
        instance.current?.specActions.updateSpec('');
        if (url) {
          instance.current?.specActions.updateUrl(url);
          instance.current?.specActions.download(url);
        }
      }
    }
  }, [instance.current, url]);

  useEffect(() => {
    if (instance.current) {
      const prevStateSpec = instance.current?.specSelectors.specStr();
      if (spec && spec !== SwaggerUI.config.defaults.spec && (spec !== prevStateSpec || spec !== prevSpec)) {
        const updatedSpec = typeof spec === 'object' ? JSON.stringify(spec) : spec;
        instance.current?.specActions.updateSpec(updatedSpec);
      }
    }
  }, [instance.current, spec]);

  return <div id="schema-editor" className="schema-editor" />;
}

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
