import './semantic-description-block.scss';

export function SemanticDescriptionBlock({ getComponent, description }) {
  const Markdown = getComponent('Markdown', true);

  // Truncate the description to 64 characters
  const truncatedDescription = description?.length > 64 ? description.substring(0, 64) + '...' : description;

  return (
    <span>
      <Markdown source={truncatedDescription} />
    </span>
  );
}
