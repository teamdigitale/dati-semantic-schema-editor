export const resolveSpecPathRefs = (system, specPath: string[]): string[] => {
  const specJson = system.specSelectors.specJson;

  for (let i = specPath.length; i >= 0; i--) {
    const tryPath = specPath.slice(0, i);
    const $ref = specJson().getIn([...tryPath, '$ref']);
    if ($ref && /^#\//.test($ref)) {
      const pointer = $ref.charAt(0) === '#' ? $ref.substr(1) : $ref;
      return resolveSpecPathRefs(system, [...jsonPointerToArray(pointer), ...specPath.slice(i)]);
    }
  }

  return specPath;
};

function jsonPointerToArray(pointer) {
  if (typeof pointer !== 'string') {
    throw new TypeError(`Expected a string, got a ${typeof pointer}`);
  }

  if (pointer[0] === '/') {
    pointer = pointer.substring(1);
  }

  if (pointer === '') {
    return [];
  }

  return pointer.split('/');
}
