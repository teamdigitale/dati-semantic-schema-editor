import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InClientCache } from './in-client-cache';

describe('InClientCache', () => {
  let cache: InClientCache<string>;
  const ttl = 1000; // 1 second for testing

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new InClientCache({ ttl });
  });

  afterEach(() => {
    cache.destroy();
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create a cache instance with the specified TTL', () => {
      const newCache = new InClientCache({ ttl: 5000 });
      expect(newCache).toBeInstanceOf(InClientCache);
      newCache.destroy();
    });

    it('should initialize cleanup interval', () => {
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const newCache = new InClientCache({ ttl: 1000 });
      expect(setIntervalSpy).toHaveBeenCalled();
      newCache.destroy();
    });
  });

  describe('set', () => {
    it('should store a value in the cache', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should overwrite existing value', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    it('should store multiple values', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent key', () => {
      expect(cache.get('non-existent')).toBeUndefined();
    });

    it('should return the stored value for existing key', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should return undefined for expired entry', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');

      // Advance time beyond TTL
      vi.advanceTimersByTime(ttl + 1);

      expect(cache.get('key1')).toBeUndefined();
    });

    it('should cleanup expired entries on get', () => {
      cache.set('key1', 'value1');

      // Advance time partially
      vi.advanceTimersByTime(ttl / 2);

      cache.set('key2', 'value2');

      // Advance time beyond TTL for key1, but not for key2
      vi.advanceTimersByTime(ttl / 2 + 1);

      // Getting key2 should cleanup expired key1
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should remove a value from the cache', () => {
      cache.set('key1', 'value1');
      cache.delete('key1');
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should not throw error when deleting non-existent key', () => {
      expect(() => cache.delete('non-existent')).not.toThrow();
    });

    it('should cleanup expired entries on delete', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Advance time beyond TTL for key1
      vi.advanceTimersByTime(ttl + 1);

      // Deleting key2 should cleanup expired key1
      cache.delete('key2');
      expect(cache.get('key1')).toBeUndefined();
    });
  });

  describe('destroy', () => {
    it('should clear all cache entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.destroy();
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should clear the cleanup interval', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      cache.destroy();
      expect(clearIntervalSpy).toHaveBeenCalled();
    });

    it('should be safe to call multiple times', () => {
      expect(() => {
        cache.destroy();
        cache.destroy();
      }).not.toThrow();
    });
  });

  describe('TTL expiration', () => {
    it('should keep entries valid within TTL', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(ttl - 1);
      expect(cache.get('key1')).toBe('value1');
    });

    it('should expire entries after TTL', () => {
      cache.set('key1', 'value1');
      vi.advanceTimersByTime(ttl);
      expect(cache.get('key1')).toBeUndefined();
    });

    it('should cleanup expired entries automatically via interval', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Advance time beyond TTL
      vi.advanceTimersByTime(ttl + 1);

      // Trigger cleanup interval
      vi.advanceTimersByTime(ttl);

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });
  });

  describe('cleanupExpired', () => {
    it('should remove only expired entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Advance time partially
      vi.advanceTimersByTime(ttl / 2);

      // Set a new entry
      cache.set('key3', 'value3');

      // Advance time so key1 and key2 expire, but key3 doesn't
      vi.advanceTimersByTime(ttl / 2 + 1);

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.get('key3')).toBe('value3');
    });
  });

  describe('generic type support', () => {
    it('should work with different types', () => {
      const numberCache = new InClientCache<number>({ ttl: 1000 });
      numberCache.set('num', 42);
      expect(numberCache.get('num')).toBe(42);
      numberCache.destroy();

      const objectCache = new InClientCache<{ name: string }>({ ttl: 1000 });
      objectCache.set('obj', { name: 'test' });
      expect(objectCache.get('obj')).toEqual({ name: 'test' });
      objectCache.destroy();
    });
  });
});
