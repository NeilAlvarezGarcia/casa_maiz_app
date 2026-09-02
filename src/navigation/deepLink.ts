import type { LinkingOptions } from '@react-navigation/native';
import { DEEP_LINK_SCHEME, WEB_PREFIX_URL } from '../config';
import { ROUTE_MAP } from './destinationResolver';
import type { NavigatorRootParamList } from './destinationResolver';

function pathToRoute(
  route: keyof NavigatorRootParamList,
): { path: string; alias?: string[] } {
  const paths = Object.keys(ROUTE_MAP).filter(
    p => ROUTE_MAP[p].route === route,
  );
  const canonical = paths
    .map(p => p.replace(/^\/+/, ''))
    .filter(Boolean);
  const [head, ...rest] = canonical;
  if (!head) {
    return { path: '' };
  }
  return rest.length ? { path: head, alias: rest } : { path: head };
}

export const linking: LinkingOptions<NavigatorRootParamList> = {
  prefixes: [`${DEEP_LINK_SCHEME}://`, WEB_PREFIX_URL],
  config: {
    screens: {
      Home: pathToRoute('Home'),
      Menu: pathToRoute('Menu'),
      Reservations: pathToRoute('Reservations'),
      Privacy: pathToRoute('Privacy'),
    },
  },
};
