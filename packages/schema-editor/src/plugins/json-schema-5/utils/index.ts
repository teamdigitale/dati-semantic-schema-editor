export function basename(path) {
  return path.split('/').reverse()[0];
}

export const getExtensions = (defObj) => defObj.filter((v, k) => /^x-/.test(k));
