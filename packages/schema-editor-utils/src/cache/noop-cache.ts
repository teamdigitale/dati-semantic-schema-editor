import { ICacheService } from './models';

export class NoopCache<T = unknown> implements ICacheService<T> {
  public destroy(): void {}

  public get(key: string): T | undefined {
    return undefined;
  }

  public set(key: string, value: T): void {}

  public delete(key: string): void {}

  public clear(): void {}
}
