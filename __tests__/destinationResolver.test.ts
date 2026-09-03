/**
 * @format
 *
 * Bootstrap-driven navigation: destinations coming from the CMS bootstrap
 * (navigation items, alerts, promotions) route through the centralized
 * resolver. Tests assert the mapping is stable so a new content-level
 * destination can't silently break navigation.
 */
import {
  ROUTE_MAP,
  handleDestination,
  resolveDestination,
} from '../src/navigation/destinationResolver';
import { RouteNames } from '../src/navigation/routes';

describe('destinationResolver', () => {
  it('maps every known CMS path to an internal route', () => {
    expect(resolveDestination('/')).toEqual({
      kind: 'internal',
      route: RouteNames.Home,
    });
    expect(resolveDestination('/menu')).toEqual({
      kind: 'internal',
      route: RouteNames.Menu,
    });
    expect(resolveDestination('/reservation')).toEqual({
      kind: 'internal',
      route: RouteNames.Reservations,
    });
    expect(resolveDestination('/legal/privacy_policy')).toEqual({
      kind: 'internal',
      route: RouteNames.Privacy,
    });
  });

  it('accepts destinations expressed as objects (path or href)', () => {
    expect(resolveDestination({ path: '/menu' })).toEqual({
      kind: 'internal',
      route: RouteNames.Menu,
    });
    expect(resolveDestination({ href: '/menu' })).toEqual({
      kind: 'internal',
      route: RouteNames.Menu,
    });
  });

  it('resolves external links as external URLs', () => {
    expect(
      resolveDestination('https://casa-maiz.example/reservations'),
    ).toEqual({
      kind: 'external',
      url: 'https://casa-maiz.example/reservations',
    });
  });

  it('flags unsupported or malicious destinations safely', () => {
    expect(resolveDestination('tel://+525500000000')).toEqual({
      kind: 'unsupported',
    });
    expect(resolveDestination('')).toEqual({ kind: 'unsupported' });
    expect(resolveDestination(undefined)).toEqual({ kind: 'unsupported' });
    expect(resolveDestination('https://user:pass@example.com/x')).toEqual({
      kind: 'unsupported',
    });
    expect(resolveDestination('not-a-known-path')).toEqual({
      kind: 'unsupported',
    });
  });

  it('navigates to the mapped route for internal destinations', async () => {
    const navigation = { navigate: jest.fn() };
    await handleDestination(navigation as never, '/menu');
    expect(navigation.navigate).toHaveBeenCalledWith(RouteNames.Menu);
  });

  it('requires every ROUTE_MAP key to be a slash-prefixed path', () => {
    for (const path of Object.keys(ROUTE_MAP)) {
      expect(path.startsWith('/')).toBe(true);
    }
  });
});
