import { useSchemaNavigation } from "../Navigation";

export const TabModels = ({ getComponent, specSelectors, getConfigs }) => {
  const { history } = useSchemaNavigation();
  const currentHistoryItem = history[history.length - 1];

  const definitions = specSelectors.definitions();
  const { defaultModelsExpandDepth } = getConfigs();
  if (!definitions.size || defaultModelsExpandDepth < 0) {
    return null;
  }

  const ModelContainer = getComponent("ModelContainer", true);
  const TabModelsBreadcrumb = getComponent("TabModelsBreadcrumb", true);

  return (
    <>
      <TabModelsBreadcrumb />

      {/* Root */}
      {history.length === 0 &&
        definitions
          .entrySeq()
          .map(([name]) => <ModelContainer key={name} name={name} />)
          .toArray()}

      {/* Schema model */}
      {currentHistoryItem && (
        <ModelContainer name={currentHistoryItem.title} expanded />
      )}
    </>
  );
};
