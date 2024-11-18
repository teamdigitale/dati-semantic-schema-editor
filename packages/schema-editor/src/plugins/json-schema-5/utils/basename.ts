// Extracts fieldName from an URI
export function basename(path: string) {
  try {
    const url = new URL(path);
    // Return the fragment if present
    if (url.hash) {
      return url.hash.substring(1); // Remove the leading '#'
    }
    // Return the last path component
    const pathParts = url.pathname.split('/');
    return pathParts[pathParts.length - 1];
  } catch (e) {
    // Handle invalid URLs
    console.error(`Invalid URL: ${path}`, e);
    return '';
  }
}
