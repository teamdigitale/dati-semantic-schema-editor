import { Callout, CalloutTitle, Icon, CalloutText } from 'design-react-kit';

export function Example({ example, jsonldContext, getConfigs }) {
  const { jsonldPlaygroundUrl } = getConfigs();

  return (
    <Callout color="note" detailed className="p-4 mt-3">
      <CalloutTitle>
        Example:
        {jsonldPlaygroundUrl && jsonldContext && example && (
          <a
            className="ms-auto me-4 z-1"
            target="_blank"
            rel="noreferrer"
            href={jsonldPlaygroundUrl + encodeURIComponent(JSON.stringify({ '@context': jsonldContext, ...example }))}
          >
            <Icon icon="it-external-link" size="sm" title="Open in playground" />
          </a>
        )}
      </CalloutTitle>
      <CalloutText>
        <pre className="m-0">{JSON.stringify(example, null, 2)}</pre>
      </CalloutText>
    </Callout>
  );
}
