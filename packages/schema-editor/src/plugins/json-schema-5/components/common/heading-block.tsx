import { ReferenceBlock } from './reference-block';

interface Props {
  title: string;
  specPath: any;
  jsonldContext: any;
  propertyName: string;
  getComponent: any;
  children?: JSX.Element;
}

export function HeadingBlock({ title, specPath, jsonldContext, propertyName, getComponent, children }: Props) {
  const JumpToPath = getComponent('JumpToPath', true);

  return (
    <div className="d-flex">
      <h4>
        {title} <ReferenceBlock jsonldContext={jsonldContext} propertyName={propertyName} />
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
