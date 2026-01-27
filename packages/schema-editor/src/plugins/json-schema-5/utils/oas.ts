import LZString from 'lz-string';

export function encodeOAS(txt: string) {
  return LZString.compressToEncodedURIComponent(txt);
}

export function decodeOAS(txt: string) {
  return LZString.decompressFromEncodedURIComponent(txt);
}
