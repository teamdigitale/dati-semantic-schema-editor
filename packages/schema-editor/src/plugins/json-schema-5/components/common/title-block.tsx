export function TitleBlock({ title, specPath, depth, getComponent }) {
  const JumpToPath = getComponent('JumpToPath', true);

  return depth === 1 ? (
    <h4 className="d-flex">
      {title}
      <span className="ms-auto">
        <span className="model-jump-to-path">
          <JumpToPath specPath={specPath} content={'#'} />
        </span>
      </span>
    </h4>
  ) : null;
}
