import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageAdapter } from './contentCache';

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
  async keys(): Promise<readonly string[]> {
    return AsyncStorage.getAllKeys();
  },
};

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
    keys: async () => Array.from(store.keys()),
    snapshot: () => Object.fromEntries(store),
  };
}
