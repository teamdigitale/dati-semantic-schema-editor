import 'swagger-ui/dist/swagger-ui.css';
import './SchemaEditor.scss';

import { useEffect, useRef, useState } from 'react';
import SwaggerUI from 'swagger-ui';
import SwaggerEditor from 'swagger-editor';
import {
  Config,
  ConfigurationPlugin,
  EditorAutosuggestCustomPlugin,
  EditorThemePlugin,
  ErrorsPlugin,
  JSONLDContextPlugin,
  JSONLDValidatorPlugin,
  JSONSchema5Plugin,
  JumpToPathOverridePlugin,
  LayoutPlugin,
  LayoutTypes,
  OverviewPlugin,
} from '../../plugins';

type Props = Config & {
  spec?: string | object;
  url?: string;
  layout?: LayoutTypes;
};

export function SchemaEditor({
  spec,
  url,
  layout = LayoutTypes.EDITOR,
  sparqlUrl = 'https://virtuoso-test-external-service-ndc-test.apps.cloudpub.testedev.istat.it/sparql',
  oasCheckerUrl,
  schemaEditorUrl,
}: Props) {
  const [system, setSystem] = useState<typeof SwaggerUI>(null);
  const SwaggerUIComponent = system?.getComponent('App', 'root');
  const prevSpec = usePrevious(spec);
  const prevUrl = usePrevious(url);

  useEffect(() => {
    const systemInstance = SwaggerUI({
      ...(url && !spec ? { url } : {}),
      layout,
      presets: [SwaggerUI.presets.apis],
      plugins: [
        ...Object.values(SwaggerEditor.plugins),
        EditorThemePlugin,
        EditorAutosuggestCustomPlugin,
        ErrorsPlugin,
        JSONLDValidatorPlugin,
        JSONLDContextPlugin,
        JSONSchema5Plugin,
        JumpToPathOverridePlugin,
        OverviewPlugin,
        LayoutPlugin,
        ConfigurationPlugin,
        SwaggerUI.plugins.SafeRender({
          fullOverride: true,
          componentList: ['ItaliaSchemaEditorLayout', 'Topbar', 'EditorContainer'],
        }),
      ],
      showExtensions: false, // Avoid showing properties starting with x-
      swagger2GeneratorUrl: 'https://generator.swagger.io/api/swagger.json',
      oas3GeneratorUrl: 'https://generator3.swagger.io/openapi.json',
      swagger2ConverterUrl: 'https://converter.swagger.io/api/convert',
      // Schema editor configs:
      jsonldPlaygroundUrl: 'https://json-ld.org/playground/#startTab=tab-expand&json-ld=',
      sparqlUrl,
      oasCheckerUrl,
      schemaEditorUrl,
    });

    // Update spec text
    if (spec) {
      systemInstance.getSystem().specActions.updateSpec(spec);
    }

    setSystem(systemInstance);
  }, []);

  useEffect(() => {
    if (system) {
      console.log('Updating url');
      const prevStateUrl = system?.specSelectors.url();
      if (url !== prevStateUrl || url !== prevUrl) {
        system.specActions.updateSpec('');
        if (url) {
          system.specActions.updateUrl(url);
          system.specActions.download(url);
        }
      }
    }
  }, [system, url]);

  useEffect(() => {
    if (system) {
      console.log('Updating spec');
      const prevStateSpec = system.specSelectors.specStr();
      if (spec && spec !== SwaggerUI.config.defaults.spec && (spec !== prevStateSpec || spec !== prevSpec)) {
        const updatedSpec = typeof spec === 'object' ? JSON.stringify(spec) : spec;
        system.specActions.updateSpec(updatedSpec);
      }
    }
  }, [system, spec]);

  useEffect(() => {
    if (system) {
      const configs = system.getConfigs();
      configs.sparqlUrl = sparqlUrl;
      configs.oasCheckerUrl = oasCheckerUrl;
      configs.schemaEditorUrl = schemaEditorUrl;
    }
  }, [system, sparqlUrl, oasCheckerUrl, schemaEditorUrl]);

  return SwaggerUIComponent ? <SwaggerUIComponent /> : null;
}

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
