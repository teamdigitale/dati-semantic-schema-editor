import './models.scss';

import { useSchemaNavigation } from '../../overview/components/Navigation';

export function Models({ getComponent, specSelectors, getConfigs }) {
  const { history } = useSchemaNavigation();
  const currentHistoryItem = history[history.length - 1];

  const definitions = specSelectors.definitions();
  const { defaultModelsExpandDepth } = getConfigs();
  if (!definitions.size || defaultModelsExpandDepth < 0) {
    return null;
  }

  const ModelsBreadcrumb = getComponent('ModelsBreadcrumb', true);
  const ModelCollapse = getComponent('ModelCollapse', true);
  const ModelRoot = getComponent('ModelRoot', true);

  return (
    <div className="modelli">
      <ModelsBreadcrumb />

      {/* Root */}
      {history.length === 0 &&
        definitions
          .entrySeq()
          .map(([name]) => (
            <div key={name} className="d-block neutral-2-bg p-3 mb-3">
              <ModelCollapse modelName={name} />
            </div>
          ))
          .toArray()}

      {/* Schema model */}
      {currentHistoryItem && (
        <ModelRoot name={currentHistoryItem.title} jsonldContext={currentHistoryItem.jsonldContext} />
      )}
    </div>
  );
}
