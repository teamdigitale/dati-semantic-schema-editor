import { Spinner } from 'design-react-kit';
import { useState } from 'react';
import { useRDFClassPropertiesResolver } from '../../../hooks';
import { uri2shortUri } from '../../../utils';
import { RDFOntologicalClassBlock } from '../rdf-ontological-class-block';
import { ClassPropertiesFilteredTable } from './rdf-helper-class-properties-filtered-table';
import { RDFHelperClassVocabulariesBlock } from './rdf-helper-class-vocabularies-block';

interface Props {
  classUri: string;
}

export function RDFOntologicalClassHelperBlock({ classUri }: Props) {
  const { data, status } = useRDFClassPropertiesResolver(classUri);
  const superClasses = data?.classProperties
    ?.map((property) => property.baseClass)
    .filter((value, index, self) => self.indexOf(value) === index);
  const [selectedSuperClass, setSelectedSuperClass] = useState('');

  const handleSuperClassChange = (event) => {
    setSelectedSuperClass(event.target.value);
  };

  if (status === 'pending') {
    return (
      <span className="d-inline-block align-middle">
        <Spinner active small />
      </span>
    );
  }
  if (!data?.classProperties || !data?.classUri) {
    return null;
  }
  return (
    <span className="modelli">
      <div className="d-flex justify-content-between mb-4">
        <h6>
          Class: <RDFOntologicalClassBlock classUri={classUri} />
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
