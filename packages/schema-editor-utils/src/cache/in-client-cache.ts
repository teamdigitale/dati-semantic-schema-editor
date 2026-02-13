import { CacheEntity, ICacheService } from './models';

export class InClientCache<T = unknown> implements ICacheService<T> {
  private cacheEntries: Map<string, CacheEntity<T>> = new Map();
  private readonly cleanupInterval: ReturnType<typeof setInterval> | undefined;

  constructor(private readonly options: { ttl: number }) {
    if (options.ttl) {
      this.cleanupInterval = setInterval(() => this.cleanupExpired(), options.ttl);
    }
  }

  public destroy(): void {
    this.cacheEntries.clear();
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  public get(key: string): T | undefined {
    this.cleanupExpired();
    return this.cacheEntries.get(key)?.entry;
  }

  public set(key: string, value: T): void {
    this.cacheEntries.set(key, { timestamp: Date.now(), entry: value });
    this.cleanupExpired();
  }

  public delete(key: string): void {
    this.cacheEntries.delete(key);
    this.cleanupExpired();
  }

  private isExpired({ timestamp }: CacheEntity<T>): boolean {
    return Date.now() - timestamp >= this.options.ttl;
  }

  private cleanupExpired(): void {
    for (const [key, entry] of this.cacheEntries.entries()) {
      if (this.isExpired(entry)) {
        this.cacheEntries.delete(key);
      }
    }
  }
}
