export interface CacheEntry {
  data: unknown;
  nextChangeAt?: string;
  contractVersion?: string;
  fetchedAt: string;
}

export interface CacheRead {
  entry: CacheEntry | null;
  stale: boolean;
  reason?: string;
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  keys?(): Promise<readonly string[]>;
}

const DEFAULT_TTL_MS = 30 * 60 * 1000;

export class ContentCache {
  private readonly memory = new Map<string, CacheEntry>();
  private readonly storage?: StorageAdapter;
  private readonly ttlMs: number;
  private readonly prefix: string;

  constructor(
    options: {
      storage?: StorageAdapter;
      ttlMs?: number;
      prefix?: string;
    } = {},
  ) {
    this.storage = options.storage;
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
    this.prefix = options.prefix ?? 'cms:v1:';
  }

  private isStale(
    entry: CacheEntry,
    now: number,
  ): { stale: boolean; reason?: string } {
    if (entry.nextChangeAt) {
      const boundary = Date.parse(entry.nextChangeAt);
      if (!Number.isNaN(boundary) && now >= boundary) {
        return { stale: true, reason: 'nextChangeAt-exceeded' };
      }
    } else if (now - Date.parse(entry.fetchedAt) > this.ttlMs) {
      return { stale: true, reason: 'ttl-exceeded' };
    }
    return { stale: false };
  }

  async get(key: string): Promise<CacheRead> {
    const memoryHit = this.memory.get(key);
    if (memoryHit) {
      return { entry: memoryHit, ...this.isStale(memoryHit, Date.now()) };
    }

    if (!this.storage) {
      return { entry: null, stale: false };
    }

    try {
      const raw = await this.storage.getItem(this.prefix + key);
      if (!raw) {
        return { entry: null, stale: false };
      }
      const entry = JSON.parse(raw) as CacheEntry;

      this.memory.set(key, entry);
      return { entry, ...this.isStale(entry, Date.now()) };
    } catch {
      return { entry: null, stale: false };
    }
  }

  async getValid(key: string): Promise<CacheRead> {
    const read = await this.get(key);
    if (read.stale) {
      return { entry: null, stale: true, reason: read.reason };
    }
    return read;
  }

  async set(key: string, entry: CacheEntry): Promise<void> {
    this.memory.set(key, entry);
    if (this.storage) {
      await this.storage.setItem(this.prefix + key, JSON.stringify(entry));
    }
  }

  async invalidate(key: string): Promise<void> {
    this.memory.delete(key);
    if (this.storage) {
      await this.storage.removeItem(this.prefix + key);
    }
  }

  async clear(): Promise<void> {
    this.memory.clear();
    if (this.storage?.keys) {
      const keys = await this.storage.keys();
      const matching = keys.filter(k => k.startsWith(this.prefix));
      await Promise.all(matching.map(k => this.storage!.removeItem(k)));
    }
  }
}
