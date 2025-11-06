export function TabGraph({ ...props }) {
  const { getComponent } = props;

  const GraphSchema = getComponent('GraphSchema', true);

  return <GraphSchema {...props} />;
}
