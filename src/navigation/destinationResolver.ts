import {Linking} from 'react-native';
import {Platform} from 'react-native';
import type {NavigationProp} from '@react-navigation/native';

/**
 * Centralized destination resolution. Every CMS action/destination (from
 * bootstrap navigation, blocks, alerts, promotions) routes through here so the
 * app knows the full universe of destinations and how to navigate to each one.
 */

export type NavigatorRootParamList = {
  Home: undefined;
  Menu: undefined;
  Reservations: undefined;
  Privacy: undefined;
};

export const ROUTE_MAP: Record<
  string,
  {route: keyof NavigatorRootParamList; supportedPlatforms?: string[]}
> = {
  '/': {route: 'Home'},
  '/menu': {route: 'Menu'},
  '/reservas': {route: 'Reservations'},
  '/reservation': {route: 'Reservations'},
  '/legal/privacy_policy': {route: 'Privacy'},
};

export interface ResolutionResult {
  kind: 'internal' | 'external' | 'unsupported';
  route?: keyof NavigatorRootParamList;
  url?: string;
}

const HTTPS_PREFIXES = ['http://', 'https://'];
const PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/i;

/** Validates an external URL before it is opened. */
export function isValidExternalUrl(url: string): boolean {
  if (!HTTPS_PREFIXES.some(prefix => url.startsWith(prefix))) {
    return false;
  }
  // Reject URLs that attempt scheme confusion or include credentials.
  return !PROTOCOL_REGEX.test(url.replace(/^https?:\/\//i, '').split('/')[0]);
}

/**
 * Resolves a CMS destination (may be a path string, a destination object with
 * `path`, or a link with `href`) into a navigation action.
 */
export function resolveDestination(
  rawDestination: string | {path?: string; href?: string; key?: string} | undefined,
): ResolutionResult {
  const path =
    (typeof rawDestination === 'string'
      ? rawDestination
      : rawDestination?.path ?? rawDestination?.href) ?? '';

  const trimmed = path.trim();
  if (!trimmed) {
    return {kind: 'unsupported'};
  }

  // External URLs.
  if (HTTPS_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
    if (isValidExternalUrl(trimmed)) {
      return {kind: 'external', url: trimmed};
    }
    return {kind: 'unsupported'};
  }

  // Internal destination keyed by path.
  const mapped = ROUTE_MAP[trimmed];
  if (mapped) {
    return {kind: 'internal', route: mapped.route};
  }

  return {kind: 'unsupported'};
}

type Navigator = NavigationProp<NavigatorRootParamList>;

/**
 * Perform the resolution for the given destination and navigate accordingly.
 * Never throws: navigation and link failures fail safely.
 */
export async function handleDestination(
  navigation: Navigator,
  rawDestination: string | {path?: string; href?: string; key?: string} | undefined,
): Promise<void> {
  try {
    const resolved = resolveDestination(rawDestination);
    if (resolved.kind === 'internal' && resolved.route) {
      navigation.navigate(resolved.route);
    } else if (resolved.kind === 'external' && resolved.url) {
      const supported = await Linking.canOpenURL(resolved.url);
      if (supported) {
        await Linking.openURL(resolved.url);
      }
    }
  } catch {
    // Unsupported or failing destinations fail safely: no-op.
  }
}

export function currentPlatformSupported(destination?: {
  supportedPlatforms?: string[];
}): boolean {
  if (!destination?.supportedPlatforms?.length) {
    return true;
  }
  const os = Platform.OS === 'android' ? 'android' : 'ios';
  return destination.supportedPlatforms.includes(os) || destination.supportedPlatforms.includes('all');
}
