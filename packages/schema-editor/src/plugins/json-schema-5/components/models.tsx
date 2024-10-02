import './models.scss';

import { useSchemaNavigation } from '../../overview/components/Navigation';
import type { ModelCollapse as ModelCollapseComponent } from './model-collapse';
import type { ModelRoot as ModelRootComponent } from './model-root';
import type { ModelsBreadcrumb as ModelsBreadcrumbComponent } from './models-breadcrumb';
import { Button } from 'design-react-kit';
import { compressAndBase64UrlSafe } from '../utils';

export function Models({ getComponent, specSelectors, getConfigs }) {
  const { history, jsonldContextFullPath } = useSchemaNavigation();
  const currentHistoryItem = history[history.length - 1];

  const isOAS3 = specSelectors.isOAS3();
  const specPathBase = isOAS3 ? ['components', 'schemas'] : ['definitions'];

  const definitions = specSelectors.definitions();
  const { defaultModelsExpandDepth, oasCheckerUrl } = getConfigs();
  if (!definitions.size || defaultModelsExpandDepth < 0) {
    return null;
  }

  const ModelsBreadcrumb: typeof ModelsBreadcrumbComponent = getComponent('ModelsBreadcrumb', true);
  const ModelCollapse: typeof ModelCollapseComponent = getComponent('ModelCollapse', true);
  const ModelRoot: typeof ModelRootComponent = getComponent('ModelRoot', true);

  const copyToClipboard = (text: string, prefix: string = "") => {
    const el = document.createElement('textarea');
    el.value = `${prefix}${compressAndBase64UrlSafe(text)}`;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  };

  return (
    <div className="modelli">
      <Button color="primary"
        title='Copy the editor content as a shareable URL.'
        onClick={() => copyToClipboard(specSelectors.specStr(), `${window.location.origin}${window.location.pathname}#oas:`)}
        >
        Copy as URL
      </Button>

      {
        oasCheckerUrl &&
          <Button color="primary"
          title='Copy the editor content as an URL that opens in OAS Checker.'
          onClick={() => copyToClipboard(specSelectors.specStr(), `${oasCheckerUrl}?text=`)}>
            Copy as OAS Checker URL
          </Button>
      }

      <ModelsBreadcrumb specPathBase={specPathBase} />

      {/* Root */}
      {history.length === 0 &&
        definitions
          .entrySeq()
          .map(([key, schema]) => (
            <div key={key} className="d-block neutral-2-bg p-3 mb-3">
              <ModelCollapse title={key} specPath={[...specPathBase, key]} schema={schema} />
            </div>
          ))
          .toArray()}

      {/* Schema model */}
      {currentHistoryItem && (
        <ModelRoot
          name={currentHistoryItem.title}
          fullPath={currentHistoryItem.fullPath}
          jsonldContextFullPath={jsonldContextFullPath}
        />
      )}
    </div>
  );
}
