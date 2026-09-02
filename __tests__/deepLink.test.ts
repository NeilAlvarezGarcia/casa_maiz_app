import { linking, scheme } from '../src/navigation/deepLink';
import { ROUTE_MAP } from '../src/navigation/destinationResolver';

describe('deep link configuration', () => {
  it('prefers the custom scheme and the published CMS host', () => {
    expect(linking.prefixes).toContain(`${scheme}://`);
    expect(linking.prefixes).toContain(
      'https://payload-cms-poc-seven.vercel.app',
    );
  });

  it('exposes every ROUTE_MAP route as a deep-link path', () => {
    const screens = linking.config?.screens;
    expect(screens).toBeTruthy();

    const routeNames = ['Home', 'Menu', 'Reservations', 'Privacy'];
    for (const name of routeNames) {
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
