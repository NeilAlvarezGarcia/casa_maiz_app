import type {Alert} from '../../api/schemas/bootstrap';
import {ROUTE_MAP} from '../../navigation/destinationResolver';




export function isTopBarPlacement(alert: Alert): boolean {
  return (alert.placement ?? 'topBar') === 'topBar';
}


export function alertDelayMs(alert: Alert): number {
  const trigger = alert.trigger;


  if (!trigger || trigger.type === 'scroll') {
    return trigger?.delayMs ?? 0;
  }
  return trigger.delayMs ?? 0;
}


function cooldownMs(alert: Alert): number {
  const hours = alert.frequency?.cooldownHours;
  return (hours ?? 0) * 60 * 60 * 1000;
}


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
