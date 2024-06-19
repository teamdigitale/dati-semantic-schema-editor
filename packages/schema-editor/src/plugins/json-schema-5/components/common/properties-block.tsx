export function PropertiesBlock({ properties, getComponent }) {
  const Property = getComponent('Property');

  return properties.size ? (
    <>
      {properties.entrySeq().map(([key, v]) => (
        <Property key={`${key}-${v}`} propKey={key} propVal={v} propClass="property" />
      ))}
    </>
  ) : null;
}
