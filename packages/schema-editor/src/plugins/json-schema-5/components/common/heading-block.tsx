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
        {title} <RDFOntologicalClassBlock classUri={jsonldType} />
      </h4>

      <div className="d-flex align-items-center ms-auto">
        {children}
        <h4 className="model-jump-to-path m-0 ms-2">
          <JumpToPath specPath={specPath} content={'#'} />
        </h4>
      </div>
    </div>
  );
}
