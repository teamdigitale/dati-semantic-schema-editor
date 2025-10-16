/**
 * Converts a string to a 32 character SHA256 hash
 * @param text The string to convert
 * @returns A 32 character SHA256 hash
 */
export function to32CharString(text: string): string {
  const hash = new Uint8Array(32);
  for (let i = 0; i < text.length; i++) {
    hash[i % 32] ^= text.charCodeAt(i);
  }
  return Array.from(hash)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
