import {Linking} from 'react-native';
import {Platform} from 'react-native';
import type {NavigationProp} from '@react-navigation/native';



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


export function isValidExternalUrl(url: string): boolean {
  if (!HTTPS_PREFIXES.some(prefix => url.startsWith(prefix))) {
    return false;
  }

  return !PROTOCOL_REGEX.test(url.replace(/^https?:\/\//i, '').split('/')[0]);
}


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


  if (HTTPS_PREFIXES.some(prefix => trimmed.startsWith(prefix))) {
    if (isValidExternalUrl(trimmed)) {
      return {kind: 'external', url: trimmed};
    }
    return {kind: 'unsupported'};
  }


  const mapped = ROUTE_MAP[trimmed];
  if (mapped) {
    return {kind: 'internal', route: mapped.route};
  }

  return {kind: 'unsupported'};
}

type Navigator = NavigationProp<NavigatorRootParamList>;


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
