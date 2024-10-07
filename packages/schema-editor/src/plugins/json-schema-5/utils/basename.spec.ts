import { describe, expect, it } from 'vitest';
import { basename } from './basename';

describe('basename', () => {
  it('should return the fragment component if present', () => {
    const path = 'http://example.com/path/to/resource#fragment';
    expect(basename(path)).toBe('fragment');
  });

  it('should return the last path component if no fragment is present', () => {
    const path = 'http://example.com/path/to/resource';
    expect(basename(path)).toBe('resource');
  });

  it('should handle invalid URLs gracefully', () => {
    const path = 'invalid-url';
    expect(basename(path)).toBe('');
  });

  it('should return an empty string for an empty path', () => {
    const path = '';
    expect(basename(path)).toBe('');
  });
});
