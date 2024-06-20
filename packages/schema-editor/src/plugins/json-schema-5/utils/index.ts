export const getExtensions = (defObj) => defObj.filter((v, k) => /^x-/.test(k));
