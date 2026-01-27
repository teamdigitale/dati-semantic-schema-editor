export const getExtensions = (defObj) => defObj.filter((v, k) => /^x-/.test(k));

export const isUri = (uri: string) => {
  try {
    new URL(uri);
    return true;
  } catch (e) {
    return false;
  }
};

export const getParentType = (specSelectors, specPathArray) => {
  try {
    return specSelectors.specResolvedSubtree(specPathArray.slice(0, -1)).get('type');
  } catch (e) {
    return null;
  }
};

export const copyToClipboard = (content: string) => {
  const el = document.createElement('textarea');
  el.value = content;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};
