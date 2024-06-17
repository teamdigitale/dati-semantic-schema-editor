import { Spinner } from 'design-react-kit';
import { useSparqlQuery } from '../hooks/use-sparql';

export const DictModel = ({ vocabularyUri }) => {
  const { data, status } = useSparqlQuery(
    `
      prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#>

      select distinct * where {
        <${vocabularyUri}>
          skos:hasTopConcept ?hasTopConcept
        .
      }
    `,
  );
  const values = data?.results?.bindings?.map((x) => x.hasTopConcept.value.replace(`${vocabularyUri}/`, ''));

  return status === 'pending' ? (
    <Spinner active small />
  ) : values?.length ? (
    <span>Values: [ {values.join(', ')} ]</span>
  ) : null;
};
