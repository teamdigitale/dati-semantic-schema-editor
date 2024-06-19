import { sanitizeUrl as braintreeSanitizeUrl } from '@braintree/sanitize-url';

export function ExternalDocsBlock({ schema, getComponent }) {
  const externalDocsUrl: string = schema.getIn(['externalDocs', 'url']);
  const externalDocsDescription: string | undefined = schema.getIn(['externalDocs', 'description']);

  const Link = getComponent('Link');

  return externalDocsUrl ? (
    <div className="external-docs">
      <Link target="_blank" href={sanitizeUrl(externalDocsUrl)}>
        {externalDocsDescription || externalDocsUrl}
      </Link>
    </div>
  ) : null;
}

function sanitizeUrl(url) {
  if (typeof url !== 'string' || url === '') {
    return '';
  }
  return braintreeSanitizeUrl(url);
}
