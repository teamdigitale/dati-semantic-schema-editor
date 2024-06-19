import { Badge } from 'design-react-kit';
import { RDFVocabulary } from '../rdf-vocabulary';

interface Props {
  jsonldContext: any;
  propertyName: string;
  type?: string;
  format?: string;
}

export function TypeFormatBlock({ type, format, jsonldContext, propertyName }: Props) {
  return (
    <div className="prop-type-container">
      <span className="prop-type">{type}</span>
      {format && (
        <Badge color="primary" className="ms-2">
          {format}
        </Badge>
      )}
      <RDFVocabulary jsonldContext={jsonldContext} propertyName={propertyName} className="ms-2" />
    </div>
  );
}
