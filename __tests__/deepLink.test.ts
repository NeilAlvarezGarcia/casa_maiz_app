import { linking } from '../src/navigation/deepLink';
import { DEEP_LINK_SCHEME, WEB_PREFIX_URL } from '../src/config';
import { ROUTE_MAP } from '../src/navigation/destinationResolver';
import { RouteNames } from '../src/navigation/routes';

describe('deep link configuration', () => {
  it('prefers the custom scheme and the published CMS host', () => {
    expect(linking.prefixes).toContain(`${DEEP_LINK_SCHEME}://`);
    expect(linking.prefixes).toContain(WEB_PREFIX_URL);
  });

  it('exposes every ROUTE_MAP route as a deep-link path', () => {
    const screens = linking.config?.screens;
    expect(screens).toBeTruthy();

    for (const name in RouteNames) {
      expect(screens).toHaveProperty(name);
    }
  });

  it('covers every CMS path through the routing map', () => {
    const paths = new Set<string>();
    const screens = linking.config?.screens as Record<
      string,
      { path?: string; alias?: string[] } | string
    >;
    for (const entry of Object.values(screens)) {
      if (typeof entry === 'string') {
        paths.add(entry.replace(/^\/+/, ''));
        continue;
      }
      const configured = entry?.path ?? '';
      paths.add(configured.replace(/^\/+/, ''));
      for (const alias of entry?.alias ?? []) {
        paths.add(alias.replace(/^\/+/, ''));
      }
    }

    for (const cmsPath of Object.keys(ROUTE_MAP)) {
      const normalized = cmsPath.replace(/^\/+/, '');
      expect(paths).toContain(normalized);
    }
  });
});
