import { Callout, CalloutTitle, Icon, CalloutText } from 'design-react-kit';

export function ExampleBlock({ depth, schema, jsonldContext, getConfigs }) {
  const { jsonldPlaygroundUrl } = getConfigs();
  const example: object = schema.get('example');
  const exampleString: string = example ? JSON.stringify(example, null, 2) : '';

  const OpenInPlaygroundButton = ({ className }) =>
    jsonldPlaygroundUrl && jsonldContext && example ? (
      <a
        className={className}
        target="_blank"
        rel="noreferrer"
        href={jsonldPlaygroundUrl + encodeURIComponent(JSON.stringify({ '@context': jsonldContext, ...example }))}
      >
        <Icon icon="it-external-link" size="sm" title="Open in playground" />
      </a>
    ) : null;

  return !example ? null : depth <= 1 ? (
    <Callout color="note" detailed className="p-4 mt-3">
      <CalloutTitle>
        Example:
        <OpenInPlaygroundButton className="ms-auto me-4 z-1" />
      </CalloutTitle>
      <CalloutText>
        <pre className="m-0">{exampleString}</pre>
      </CalloutText>
    </Callout>
  ) : (
    <div className="json-schema-2020-12-keyword json-schema-2020-12-keyword--example">
      <span className="json-schema-2020-12-keyword__name json-schema-2020-12-keyword__name--secondary m-0">
        Example:
      </span>
      <span className="json-schema-2020-12-keyword__value json-schema-2020-12-keyword__value--const ms-2">
        {exampleString}
      </span>
    </div>
  );
}
