import './models.scss';

import { useSchemaNavigation } from '../../overview/components/Navigation';
import { ActionsMenu } from './actions-menu';
import { ModelCollapseRoot } from './model-collapse-root';
import type { ModelRoot as ModelRootComponent } from './model-root';
import type { ModelsBreadcrumb as ModelsBreadcrumbComponent } from './models-breadcrumb';

export function Models({ getComponent, specSelectors, getConfigs, specActions }) {
  const { history, jsonldContextFullPath } = useSchemaNavigation();
  const currentHistoryItem = history[history.length - 1];

  const isOAS3 = specSelectors.isOAS3();
  const specPathBase = isOAS3 ? ['components', 'schemas'] : ['definitions'];

  const definitions = specSelectors.definitions();
  const { defaultModelsExpandDepth, url } = getConfigs();
  if (!definitions.size || defaultModelsExpandDepth < 0) {
    return null;
  }

  const ModelsBreadcrumb: typeof ModelsBreadcrumbComponent = getComponent('ModelsBreadcrumb', true);
  const ModelRoot: typeof ModelRootComponent = getComponent('ModelRoot', true);

  return (
    <div className="modelli">
      <div className="d-flex flex-row justify-content-between">
        <ModelsBreadcrumb specPathBase={specPathBase} />
        <ActionsMenu specSelectors={specSelectors} url={url} specActions={specActions} />
      </div>

      {/* Root */}
      {history.length === 0 &&
        definitions
          .entrySeq()
          .map(([key, schema]) => (
            <ModelCollapseRoot key={key} title={key} specPath={[...specPathBase, key]} schema={schema} />
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
