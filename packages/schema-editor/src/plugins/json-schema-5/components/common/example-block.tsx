import { Callout, CalloutTitle, Icon, CalloutText } from 'design-react-kit';
import type { Map } from 'immutable';

interface Props {
  depth: number;
  schema: Map<any, Map<any, any>>;
  jsonldContext: Map<any, any>;
  getConfigs: () => any;
}

export function ExampleBlock({ depth, schema, jsonldContext, getConfigs }: Props) {
  const { jsonldPlaygroundUrl } = getConfigs();

  const example = schema.get('example');
  if (!example) {
    return null;
  }
  const exampleString: string = JSON.stringify(example, null, 2);

  const OpenInPlaygroundButton = ({ className }) =>
    jsonldPlaygroundUrl && jsonldContext ? (
      <a
        className={className}
        target="_blank"
        rel="noreferrer"
        href={
          jsonldPlaygroundUrl +
          encodeURIComponent(JSON.stringify(
            {
              '@context': jsonldContext.toJSON(),
              ...(schema?.get('x-jsonld-type') ? {'@type': schema.get('x-jsonld-type')} : {}),
              ...example.toJSON()
            }
          ))
        }
      >
        <Icon icon="it-external-link" size="sm" title="Open in playground" />
      </a>
    ) : null;

  return depth <= 1 ? (
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
