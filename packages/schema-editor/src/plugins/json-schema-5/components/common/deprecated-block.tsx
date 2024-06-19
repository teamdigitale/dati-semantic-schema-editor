import { Alert } from 'design-react-kit';

export function DeprecatedBlock({ schema }) {
  const deprecated = schema.get('deprecated');

  return deprecated ? <Alert color="warning">This definition is deprecated</Alert> : null;
}
