import type {Alert} from '../../api/schemas/bootstrap';
import {ROUTE_MAP} from '../../navigation/destinationResolver';

/**
 * Pure helpers that implement the CMS alert lifecycle (placement, trigger,
 * frequency/cooldown, page targeting) so the decision logic is deterministic
 * and unit-testable. The TopBar wires them to timers and persisted state.
 */

/** Alerts rendered in the app's top chrome use the `topBar` placement. */
export function isTopBarPlacement(alert: Alert): boolean {
  return (alert.placement ?? 'topBar') === 'topBar';
}

/** Milliseconds to wait before surfacing the alert, from its trigger config. */
export function alertDelayMs(alert: Alert): number {
  const trigger = alert.trigger;
  // Scroll-based triggers are approximated as load in the global chrome;
  // an explicit delay still applies once the alert becomes eligible.
  if (!trigger || trigger.type === 'scroll') {
    return trigger?.delayMs ?? 0;
  }
  return trigger.delayMs ?? 0;
}

/** Cooldown window (ms) that must elapse before the alert can show again. */
function cooldownMs(alert: Alert): number {
  const hours = alert.frequency?.cooldownHours;
  return (hours ?? 0) * 60 * 60 * 1000;
}

/**
 * Whether the alert may be shown given the last time it was surfaced or
 * dismissed. `once` never repeats; `cooldownHours` throttles repeats; an
 * `always` frequency without a cooldown always shows.
 */
export function cooldownAllows(
  alert: Alert,
  lastShownAtMs: number | undefined,
  now: number = Date.now(),
): boolean {
  const type = alert.frequency?.type;
  if (type === 'once') {
    return lastShownAtMs == null;
  }
  const cooldown = cooldownMs(alert);
  if (cooldown > 0) {
    return lastShownAtMs == null || now - lastShownAtMs >= cooldown;
  }
  return true;
}

/**
 * Whether the alert targets the currently active page. An empty pageSlugs list
 * means the alert applies everywhere ("global"). Matching is tolerant of
 * leading slashes and case so CMS slugs like `menu`, `/menu`, or `Menu`
 * resolve to the same page.
 */
export function pageTargets(alert: Alert, activeRouteName: string): boolean {
  const slugs = alert.pageSlugs ?? [];
  if (!slugs.length) {
    return true;
  }

  const normalize = (value: string) =>
    value.trim().replace(/^\/+/, '').toLowerCase();

  const routeAliases = [normalize(activeRouteName)];
  for (const [path, mapping] of Object.entries(ROUTE_MAP)) {
    if (mapping.route === activeRouteName) {
      routeAliases.push(normalize(path));
    }
  }

  const targets = new Set(slugs.map(normalize).filter(Boolean));
  return routeAliases.some(alias => alias && targets.has(alias));
}
