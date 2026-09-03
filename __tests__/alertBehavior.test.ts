import {
  alertDelayMs,
  cooldownAllows,
  isTopBarPlacement,
  pageTargets,
} from '../src/features/shared/alertBehavior';
import type { Alert } from '../src/api/schemas/bootstrap';
import { RouteNames } from '../src/navigation/routes';

function makeAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alp-1',
    title: 'Test',
    placement: 'topBar',
    priority: 1,
    dismissible: true,
    actions: [],
    ...overrides,
  };
}

describe('isTopBarPlacement', () => {
  it('defaults to topBar when placement is missing', () => {
    expect(isTopBarPlacement(makeAlert())).toBe(true);
    expect(isTopBarPlacement(makeAlert({ placement: undefined }))).toBe(true);
  });

  it('accepts topBar and rejects other placements', () => {
    expect(isTopBarPlacement(makeAlert({ placement: 'topBar' }))).toBe(true);
    expect(isTopBarPlacement(makeAlert({ placement: 'banner' }))).toBe(false);
    expect(isTopBarPlacement(makeAlert({ placement: 'modal' }))).toBe(false);
  });
});

describe('alertDelayMs', () => {
  it('returns 0 for load/scroll triggers without a delay', () => {
    expect(alertDelayMs(makeAlert({ trigger: { type: 'load' } }))).toBe(0);
    expect(
      alertDelayMs(
        makeAlert({ trigger: { type: 'scroll', scrollPercent: 30 } }),
      ),
    ).toBe(0);
    expect(alertDelayMs(makeAlert())).toBe(0);
  });

  it('returns the delayed duration for a load trigger', () => {
    expect(
      alertDelayMs(makeAlert({ trigger: { type: 'load', delayMs: 3000 } })),
    ).toBe(3000);
  });
});

describe('cooldownAllows', () => {
  const now = 1_000_000_000_000;

  it('shows always-frequency alerts regardless of prior show', () => {
    expect(
      cooldownAllows(
        makeAlert({ frequency: { type: 'always' } }),
        undefined,
        now,
      ),
    ).toBe(true);
    expect(
      cooldownAllows(
        makeAlert({ frequency: { type: 'always' } }),
        now - 1000,
        now,
      ),
    ).toBe(true);
  });

  it('never repeats a once-frequency alert once shown', () => {
    expect(
      cooldownAllows(
        makeAlert({ frequency: { type: 'once' } }),
        undefined,
        now,
      ),
    ).toBe(true);
    expect(
      cooldownAllows(makeAlert({ frequency: { type: 'once' } }), now, now),
    ).toBe(false);
  });

  it('honors cooldownHours before allowing a repeat', () => {
    const alert = makeAlert({
      frequency: { type: 'always', cooldownHours: 24 },
    });
    expect(cooldownAllows(alert, undefined, now)).toBe(true);
    expect(cooldownAllows(alert, now - 1_000, now)).toBe(false);
    expect(cooldownAllows(alert, now - 24 * 60 * 60 * 1000, now)).toBe(true);
  });

  it('shows a once-frequency alert absent frequency config (global default)', () => {
    expect(cooldownAllows(makeAlert(), undefined, now)).toBe(true);
  });
});

describe('pageTargets', () => {
  it('targets all pages when pageSlugs is empty or absent', () => {
    expect(pageTargets(makeAlert(), RouteNames.Home)).toBe(true);
    expect(pageTargets(makeAlert({ pageSlugs: [] }), RouteNames.Menu)).toBe(true);
  });

  it('matches the active route by its name', () => {
    const alert = makeAlert({ pageSlugs: ['menu'] });
    expect(pageTargets(alert, RouteNames.Menu)).toBe(true);
    expect(pageTargets(alert, RouteNames.Home)).toBe(false);
  });

  it('tolerates leading slashes and case differences in slugs', () => {
    const alert = makeAlert({ pageSlugs: ['/LEGAL/Privacy_Policy'] });
    expect(pageTargets(alert, RouteNames.Privacy)).toBe(true);
    expect(pageTargets(alert, RouteNames.Home)).toBe(false);
  });
});
