import './SchemaEditor.scss';

import { useEffect, useRef } from 'react';
import SwaggerEditor from 'swagger-editor';
import SwaggerUI from 'swagger-ui';
import { EditorThemePlugin, ErrorsPlugin, JSONSchema5Plugin, LayoutPlugin, OverviewPlugin } from '../../plugins';

interface Props {
  spec?: string | object;
  url?: string;
}

export function SchemaEditor({ spec, url }: Props) {
  const instance = useRef<typeof SwaggerUI>(null);

  useEffect(() => {
    window.onload = function () {
      instance.current = new SwaggerUI({
        ...(spec ? { spec } : {}),
        ...(url ? { url } : {}),
        dom_id: '#schema-editor',
        layout: 'ItaliaSchemaEditorLayout',
        presets: [SwaggerUI.presets.apis],
        plugins: [
          SwaggerEditor.plugins.EditorPlugin,
          SwaggerEditor.plugins.ValidateBasePlugin,
          SwaggerEditor.plugins.ValidateSemanticPlugin,
          SwaggerEditor.plugins.ValidateJsonSchemaPlugin,
          SwaggerEditor.plugins.LocalStoragePlugin,
          SwaggerEditor.plugins.EditorAutosuggestPlugin,
          SwaggerEditor.plugins.EditorAutosuggestSnippetsPlugin,
          SwaggerEditor.plugins.EditorAutosuggestKeywordsPlugin,
          SwaggerEditor.plugins.EditorAutosuggestRefsPlugin,
          SwaggerEditor.plugins.EditorAutosuggestOAS3KeywordsPlugin,
          SwaggerEditor.plugins.PerformancePlugin,
          SwaggerEditor.plugins.JumpToPathPlugin,
          SwaggerEditor.plugins.ASTPlugin,
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
      });
    };
  }, []);

  return <div id="schema-editor" className="schema-editor" />;
}
