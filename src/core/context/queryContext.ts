import {Platform} from 'react-native';
import {APP_VERSION, AUDIENCE, CONTRACT_VERSION, MARKET} from '../../config';

/**
 * The application version reported to the CMS, normalized to semantic x.y.z.
 * `APP_VERSION` comes from the environment (.env) and is validated at startup.
 */
export function getAppVersion(): string {
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

/**
 * The platform string the CMS expects: `ios` or `android`, derived from
 * Platform.OS. Anything unexpected is rejected by the CMS client.
 */
export function getPlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' || Platform.OS === 'android'
    ? Platform.OS
    : 'ios';
}

/**
 * Central construction of the delivery context appended as query parameters
 * to every content request. Screens never build query strings themselves.
 */
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

/**
 * Builds the delivery-context query string. Avoids `URLSearchParams` because
 * some RN runtimes (Hermes on Android with a partial URL polyfill) do not
 * implement every method (`set`), which would throw before any request is made.
 */
export function deliveryQueryToSearchParams(
  query: DeliveryQuery,
): string {
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

export {CONTRACT_VERSION};
