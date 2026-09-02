/**
 * @format
 *
 * Unit tests for the content cache's expiration semantics (server-provided
 * nextChangeAt boundary vs. TTL fallback) and its persistence layer.
 */
import { ContentCache, type StorageAdapter } from '../src/cache/contentCache';

class MemoryStorage implements StorageAdapter {
  private store = new Map<string, string>();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }
}

const HOUR_MS = 60 * 60 * 1000;

function entry(nextChangeAt?: string, fetchedAt?: string) {
  return {
    data: { ok: true },
    nextChangeAt,
    fetchedAt: fetchedAt ?? new Date().toISOString(),
  };
}

describe('ContentCache', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T12:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns valid content with no expiry field until the TTL elapses', async () => {
    const cache = new ContentCache({ storage: new MemoryStorage() });
    await cache.set('page:home', entry());

    let read = await cache.get('page:home');
    expect(read.entry).toBeTruthy();
    expect(read.stale).toBe(false);

    jest.advanceTimersByTime(31 * 60 * 1000);
    read = await cache.get('page:home');
    expect(read.entry).toBeTruthy();
    expect(read.stale).toBe(true);
    expect(read.reason).toBe('ttl-exceeded');
  });

  it('stays fresh while nextChangeAt is in the future', async () => {
    const cache = new ContentCache({ storage: new MemoryStorage() });
    const future = new Date(Date.now() + HOUR_MS).toISOString();
    await cache.set('page:home', entry(future));

    const read = await cache.get('page:home');
    expect(read.stale).toBe(false);
  });

  it('flags content stale once the nextChangeAt boundary passes', async () => {
    const cache = new ContentCache({ storage: new MemoryStorage() });
    const past = new Date(Date.now() - 1).toISOString();
    await cache.set('page:home', entry(past));

    const read = await cache.get('page:home');
    expect(read.stale).toBe(true);
    expect(read.reason).toBe('nextChangeAt-exceeded');
  });

  it('getValid treats stale content as a miss (network refresh needed)', async () => {
    const cache = new ContentCache({ storage: new MemoryStorage() });
    const past = new Date(Date.now() - 1).toISOString();
    await cache.set('page:home', entry(past));

    const read = await cache.getValid('page:home');
    expect(read.entry).toBeNull();
    expect(read.stale).toBe(true);
  });

  it('persists entries into storage and restores them across instances', async () => {
    const storage = new MemoryStorage();
    const first = new ContentCache({ storage });
    await first.set('page:menu', entry());

    // A brand-new cache instance (e.g. after app restart) reads from storage.
    const second = new ContentCache({ storage });
    const read = await second.get('page:menu');
    expect(read.entry?.data).toEqual({ ok: true });
    expect(read.stale).toBe(false);
  });

  it('returns a miss when nothing was cached', async () => {
    const cache = new ContentCache();
    const read = await cache.get('page:missing');
    expect(read.entry).toBeNull();
    expect(read.stale).toBe(false);
  });
});
