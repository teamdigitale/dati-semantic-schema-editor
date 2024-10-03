import { Icon } from 'design-react-kit';
import { RDFOntologicalClassBlock } from './rdf-ontological-class-block';


interface Props {
  title: string;
  specPath: any;
  jsonldType: string;
  getComponent: any;
  children?: JSX.Element;
}

export function HeadingBlock({ title, specPath, jsonldType, getComponent, children }: Props) {
  const JumpToPath = getComponent('JumpToPath', true);

  return (
    <div className="d-flex">
      <h4>
        <JumpToPath specPath={specPath} content={<Icon icon='it-pencil' size='sm' title='Go to definition'/>} />
        {title} <RDFOntologicalClassBlock classUri={jsonldType} />
      </h4>
      <div className="d-flex align-items-center ms-auto">
        {children}
      </div>
    </div>
  );
}
