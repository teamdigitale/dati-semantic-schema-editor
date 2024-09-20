import './semantic-description-block.scss';

export function SemanticDescriptionBlock({ getComponent, description }) {
  const Markdown = getComponent('Markdown', true);

  return (
    <span className="rdf-ontological-class-property bg-primary badge">
      <Markdown source={description} />
    </span>
  );
}
