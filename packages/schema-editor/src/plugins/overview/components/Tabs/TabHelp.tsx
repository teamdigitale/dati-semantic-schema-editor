import markdownText from './help.md?raw'; // Import the markdown file as a raw string

export function TabHelp({ getComponent }) {
  const Markdown = getComponent('Markdown', true);

  return (
    <div>
      <Markdown source={markdownText} />
    </div>
  );
}
