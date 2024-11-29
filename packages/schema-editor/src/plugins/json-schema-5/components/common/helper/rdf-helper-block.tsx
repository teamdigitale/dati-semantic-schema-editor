import { Alert, Spinner } from 'design-react-kit';
import { useState } from 'react';
import { useRDFClassPropertiesResolver } from '../../../hooks';
import { uri2shortUri } from '../../../utils';
import { RDFOntologicalClassBlock } from '../rdf-ontological-class-block';
import { ClassPropertiesFilteredTable } from './rdf-helper-class-properties-filtered-table';
import { RDFHelperClassVocabulariesBlock } from './rdf-helper-class-vocabularies-block';

interface Props {
  classUri: string;
  inferred: boolean;
}

export function RDFOntologicalClassHelperBlock({ classUri, inferred }: Props) {
  const { data, status } = useRDFClassPropertiesResolver(classUri);
  const superClasses = data?.classProperties
    ?.map((property) => property.baseClass)
    .filter((value, index, self) => self.indexOf(value) === index);
  const [selectedSuperClass, setSelectedSuperClass] = useState('');

  const handleSuperClassChange = (event) => {
    setSelectedSuperClass(event.target.value);
  };

  return status === 'pending' ? (
    <div className="d-flex justify-content-center mb-4">
      <Spinner active small />
    </div>
  ) : status === 'error' ? (
    <div className="mb-4">
      <Alert color="danger">There was an error fetching RDF properties</Alert>
    </div>
  ) : !data?.classProperties || !data?.classUri ? (
    <div className="mb-4">No RDF properties to display</div>
  ) : (
    <span className="modelli">
      <div className="d-flex justify-content-between mb-4">
        <h6>
          Class: <RDFOntologicalClassBlock classUri={classUri} inferred={inferred} />
        </h6>

        {superClasses?.length && (
          <div className="ms-2">
            <select
              value={selectedSuperClass}
              onChange={handleSuperClassChange}
              title="Select a superclass to filter out the rdf:Properties accordingly."
            >
              <option value="">All</option>
              {superClasses.map((superClass) => (
                <option key={superClass} value={superClass}>
                  {uri2shortUri(superClass)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <RDFHelperClassVocabulariesBlock classUri={classUri} />

      <ClassPropertiesFilteredTable properties={data?.classProperties || []} superClass={selectedSuperClass} />
    </span>
  );
}
