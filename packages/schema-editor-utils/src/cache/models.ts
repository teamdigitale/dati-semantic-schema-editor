export interface CacheEntity<T = unknown> {
  timestamp: number;
  entry: T;
}

export interface ICacheService<V = unknown> {
  destroy(): void;
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  delete(key: string): void;
  clear(): void;
}
