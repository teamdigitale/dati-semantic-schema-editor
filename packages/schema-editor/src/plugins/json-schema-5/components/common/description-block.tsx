export function DescriptionBlock({ schema, getComponent }) {
  const description = schema.get('description');

  const Markdown = getComponent('Markdown', true);

  return description ? <Markdown source={description} /> : null;
}
