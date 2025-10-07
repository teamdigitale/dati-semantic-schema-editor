import { GraphSchema } from '../../../json-schema-5/components/common/oas-graph/graph-schema';

export function TabGraph({ specSelectors }) {
  return <GraphSchema spec={specSelectors?.spec().toJSON()} />;
}
