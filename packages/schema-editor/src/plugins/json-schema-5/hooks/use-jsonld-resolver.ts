import { Map } from 'immutable';
import { useEffect, useState } from 'react';
import { AsyncState } from '../models';
import { JsonLDResolverResult, resolvePropertyByJsonldContext } from '@teamdigitale/schema-editor-utils';

export const useJsonLDResolver = (jsonldContext: Map<any, any> | any, keysPath: string[]) => {
  const [state, setState] = useState<AsyncState<JsonLDResolverResult>>({ status: 'pending' });

  useEffect(() => {
    const properties = keysPath?.filter((x) => x) || [];
    if (!jsonldContext || !properties.length) {
      return setState({ status: 'fulfilled', data: undefined });
    }
    setState({ status: 'pending' });
    resolvePropertyByJsonldContext(jsonldContext, properties)
      .then((result) => setState({ status: 'fulfilled', data: result }))
      .catch((e) => setState({ status: 'error', error: e?.message || 'Exception' }));
  }, [jsonldContext, JSON.stringify(keysPath)]);

  return state;
};
