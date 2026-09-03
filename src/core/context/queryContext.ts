import { getVersion } from 'react-native-device-info';
import { APP_VERSION, AUDIENCE, CONTRACT_VERSION, MARKET } from '../../config';
import { platform, type MobileOS } from '../platform';

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

export interface DeliveryQuery {
  platform: MobileOS;
  market: string;
  audience: string;
  appVersion: string;
}

export function buildDeliveryQuery(): DeliveryQuery {
  return {
    platform,
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
