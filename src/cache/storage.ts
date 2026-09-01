import AsyncStorage from '@react-native-async-storage/async-storage';
import type {StorageAdapter} from './contentCache';

/**
 * AsyncStorage-backed persistence for the content cache. Kept behind a small
 * interface so tests can substitute an in-memory implementation.
 */
export const asyncStorageAdapter: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },
  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

/** In-memory adapter useful for tests. */
export function createMemoryStorageAdapter(): StorageAdapter & {
  snapshot(): Record<string, string>;
} {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
    snapshot: () => Object.fromEntries(store),
  };
}
