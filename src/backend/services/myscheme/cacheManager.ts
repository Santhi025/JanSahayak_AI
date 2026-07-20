interface CacheEntry<T> {
  data: T;
  expiry: number;
}

export class CacheManager {
  private static cache = new Map<string, CacheEntry<any>>();

  static get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  static set<T>(key: string, data: T, ttlMs: number = 3600 * 1000): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlMs,
    });
  }

  static clear(): void {
    this.cache.clear();
  }
}
