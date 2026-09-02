/**
 * Jest global setup for the CasaMaiz app.
 *
 * Keeps unit tests deterministic and free of native-module dependencies:
 *  - AsyncStorage is swapped for an in-memory adapter (the cache layer's
 *    StorageAdapter contract is exercised with an explicit mock in the cache
 *    tests; this keeps accidental imports from touching native code).
 *  - react-native-screens / safe-area-context run in their JS fallbacks.
 */
import mockAsyncStorage from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

jest.mock('react-native-device-info', () => ({
  getVersion: jest.fn(() => '1.0.0'),
}));

// Silence react-native-screens' native setup in tests.
jest.mock('react-native-screens', () => {
  const Actual = jest.requireActual('react-native-screens');
  return {
    ...Actual,
    enableScreens: jest.fn(),
    enableFreeze: jest.fn(),
  };
});
