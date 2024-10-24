export const ViewLayout = ({ getComponent }) => {
  const ConfigurationProvider = getComponent('ConfigurationProvider', true);
  const OverviewContainer = getComponent('OverviewContainer', true);

  return (
    <ConfigurationProvider>
      <div className="schema-editor">
        <OverviewContainer />
      </div>
    </ConfigurationProvider>
  );
};
