import LZString from 'lz-string';

export const getExtensions = (defObj) => defObj.filter((v, k) => /^x-/.test(k));

export const compressAndBase64UrlSafe = (txt: string) => LZString.compressToEncodedURIComponent(txt);
export const decompressAndBase64UrlSafe = (txt: string) => LZString.decompressFromEncodedURIComponent(txt);
