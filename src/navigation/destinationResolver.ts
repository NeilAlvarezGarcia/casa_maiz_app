import { Linking } from 'react-native';
import type { NavigationProp } from '@react-navigation/native';
import { RouteNames, type NavigatorRootParamList, type RouteName } from './routes';

export type { NavigatorRootParamList, RouteName };
export { RouteNames };

export const ROUTE_MAP: Record<string, { route: RouteName }> = {
  '/': { route: RouteNames.Home },
  '/menu': { route: RouteNames.Menu },
  '/reservas': { route: RouteNames.Reservations },
  '/reservation': { route: RouteNames.Reservations },
  '/legal/privacy_policy': { route: RouteNames.Privacy },
};

export interface ResolutionResult {
  kind: 'internal' | 'external' | 'unsupported';
  route?: keyof NavigatorRootParamList;
  url?: string;
}

export function pathForRoute(route: RouteName): string {
  const canonical = Object.keys(ROUTE_MAP).find(
    p => ROUTE_MAP[p].route === route,
  );
  return canonical ?? '';
}

const HTTPS_PREFIXES = ['http://', 'https://'];
const PROTOCOL_REGEX = /^[a-z][a-z0-9+.-]*:/i;

export function isValidExternalUrl(url: string): boolean {
  if (!HTTPS_PREFIXES.some(prefix => url.startsWith(prefix))) {
    return false;
  }

  return !PROTOCOL_REGEX.test(url.replace(/^https?:\/\//i, '').split('/')[0]);
}

export function resolveDestination(
  rawDestination:
    | string
    | { path?: string; href?: string; key?: string }
    | undefined,
): ResolutionResult {
  const path =
    (typeof rawDestination === 'string'
      ? rawDestination
      : rawDestination?.path ?? rawDestination?.href) ?? '';

  const trimmed = path.trim();
  if (!trimmed) {
    return { kind: 'unsupported' };
  }

  if (HTTPS_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
    if (isValidExternalUrl(trimmed)) {
      return { kind: 'external', url: trimmed };
    }
    return { kind: 'unsupported' };
  }

  const mapped = ROUTE_MAP[trimmed];
  if (mapped) {
    return { kind: 'internal', route: mapped.route };
  }

  return { kind: 'unsupported' };
}

type Navigator = NavigationProp<NavigatorRootParamList>;

export async function handleDestination(
  navigation: Navigator,
  rawDestination:
    | string
    | { path?: string; href?: string; key?: string }
    | undefined,
): Promise<void> {
  const resolved = resolveDestination(rawDestination);
  if (resolved.kind === 'internal' && resolved.route) {
    navigation.navigate(resolved.route);
  } else if (resolved.kind === 'external' && resolved.url) {
    const supported = await Linking.canOpenURL(resolved.url);
    if (supported) {
      await Linking.openURL(resolved.url);
    }
  }
}

