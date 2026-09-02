import { Platform } from 'react-native';
import { getVersion } from 'react-native-device-info';
import { APP_VERSION, AUDIENCE, CONTRACT_VERSION, MARKET } from '../../config';

export function getAppVersion(): string {
  const native = getVersion();
  if (typeof native === 'string' && native.length > 0) {
    return normalizeVersion(native);
  }
  return normalizeVersion(APP_VERSION);
}

export function normalizeVersion(value: string): string {
  const match = /^\D*([0-9]+)(?:\.([0-9]+))?(?:\.([0-9]+))?/.exec(value);
  if (!match) {
    return '1.0.0';
  }
  const major = match[1] ?? '0';
  const minor = match[2] ?? '0';
  const patch = match[3] ?? '0';
  return `${major}.${minor}.${patch}`;
}

export function getPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' || Platform.OS === 'android'
    ? Platform.OS
    : 'ios';
}

export interface DeliveryQuery {
  platform: 'ios' | 'android';
  market: string;
  audience: string;
  appVersion: string;
}

export function buildDeliveryQuery(): DeliveryQuery {
  return {
    platform: getPlatform(),
    market: MARKET,
    audience: AUDIENCE,
    appVersion: getAppVersion(),
  };
}

export function deliveryQueryToSearchParams(query: DeliveryQuery): string {
  const parts = [
    ['platform', query.platform],
    ['market', query.market],
    ['audience', query.audience],
    ['appVersion', query.appVersion],
  ] as const;
  return parts
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
}

export { CONTRACT_VERSION };
