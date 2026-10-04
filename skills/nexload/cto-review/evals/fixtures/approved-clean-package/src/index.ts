export interface LruCacheOptions {
  readonly maxSize: number;
  readonly ttlMs?: number;
}

export interface CacheEntry<T> {
  readonly value: T;
  readonly expiresAt?: number;
}

export class LruCache<K, V> {
  private readonly items = new Map<K, CacheEntry<V>>();
  private readonly maxSize: number;
  private readonly ttlMs?: number;

  constructor(options: LruCacheOptions) {
    if (options.maxSize <= 0) {
      throw new Error("maxSize must be greater than 0");
    }
    this.maxSize = options.maxSize;
    this.ttlMs = options.ttlMs;
  }

  get(key: K): V | undefined {
    const entry = this.items.get(key);
    if (!entry) return undefined;

    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.items.delete(key);
      return undefined;
    }

    // Refresh LRU order
    this.items.delete(key);
    this.items.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.items.has(key)) {
      this.items.delete(key);
    } else if (this.items.size >= this.maxSize) {
      const oldestKey = this.items.keys().next().value;
      if (oldestKey !== undefined) {
        this.items.delete(oldestKey);
      }
    }

    const expiresAt = this.ttlMs ? Date.now() + this.ttlMs : undefined;
    this.items.set(key, { value, expiresAt });
  }

  clear(): void {
    this.items.clear();
  }

  get size(): number {
    return this.items.size;
  }
}
