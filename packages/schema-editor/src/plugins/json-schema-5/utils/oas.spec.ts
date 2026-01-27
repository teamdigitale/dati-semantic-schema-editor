import { describe, it, expect } from 'vitest';
import { encodeOAS, decodeOAS } from './oas';

describe('OAS', () => {
  describe('encodeOAS', () => {
    it('should encode a string', () => {
      const input = 'test string';
      const encoded = encodeOAS(input);
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
      expect(encoded).not.toBe(input);
    });

    it('should encode an empty string', () => {
      const encoded = encodeOAS('');
      expect(encoded).toBeTruthy();
      expect(typeof encoded).toBe('string');
    });
  });

  describe('decodeOAS', () => {
    it('should decode an encoded string', () => {
      const input = 'test string';
      const encoded = encodeOAS(input);
      const decoded = decodeOAS(encoded);
      expect(decoded).toBe(input);
    });

    it('should handle round-trip encoding/decoding', () => {
      const input = 'complex string with special chars: !@#$%^&*()';
      const encoded = encodeOAS(input);
      const decoded = decodeOAS(encoded);
      expect(decoded).toBe(input);
    });

    it('should return null for invalid encoded string', () => {
      const decoded = decodeOAS('invalid-encoded-string');
      expect(decoded).toBeNull();
    });
  });
});
