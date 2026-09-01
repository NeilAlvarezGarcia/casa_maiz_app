import React, {useEffect, useMemo, useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {useBootstrap} from '../../state/bootstrap';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';
import {AlertBanner} from '../shared/AlertBanner';
import {AppUpdateBanner} from '../shared/AppUpdateBanner';
import {
  handleDestination,
  type NavigatorRootParamList,
} from '../../navigation/destinationResolver';
import {useActiveRoute} from '../../navigation/activeRoute';
import {asyncStorageAdapter} from '../../cache/storage';
import {getAppVersion} from '../../core/context/queryContext';
import {
  alertDelayMs,
  cooldownAllows,
  isTopBarPlacement,
  pageTargets,
} from '../shared/alertBehavior';

const ALERT_SHOWN_PREFIX = 'cms:v1:alertShown:';

/**
 * Renders bootstrap-driven chrome above the tab navigator: operational
 * notices, alerts, and the app-update presentation. All copy comes from the
 * CMS. Alerts honor placement, trigger delay, frequency/cooldown, page
 * targeting, dismissal, and actions. Cooldown state persists in AsyncStorage
 * so a repeated alert respects its frequency across sessions.
 */
export function TopBar(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<NavigatorRootParamList>>();
  const {data} = useBootstrap();
  const activeRoute = useActiveRoute();
  const ops = data.operationalControls;
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Load persisted last-shown timestamps once. Used to throttle repeated
  // alerts per their frequency (cooldownHours/once).
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const ids = data.alerts.map(a => a.id).filter((id): id is string => !!id);
      const entries = await Promise.all(
        ids.map(async id => {
          const raw = await asyncStorageAdapter.getItem(ALERT_SHOWN_PREFIX + id);
          const ts = raw ? Number(raw) : NaN;
          return [id, Number.isFinite(ts) ? ts : 0] as const;
        }),
      );
      if (mounted) {
        setCooldowns(Object.fromEntries(entries));
      }
    };
    load().catch(() => {});
    return () => {
      mounted = false;
    };
  }, [data.alerts]);

  const recordShown = async (id: string | undefined) => {
    if (!id) {
      return;
    }
    const ts = Date.now();
    setCooldowns(prev => ({...prev, [id]: ts}));
    await asyncStorageAdapter.setItem(ALERT_SHOWN_PREFIX + id, String(ts)).catch(() => {});
  };

  // Alerts that match placement, page targeting, and are not dismissed.
  const candidates = useMemo(
    () =>
      data.alerts
        .filter(a => isTopBarPlacement(a))
        .filter(a => !dismissed[a.id ?? ''])
        .filter(a => pageTargets(a, activeRoute))
        .filter(a => cooldownAllows(a, cooldowns[a.id ?? '']))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    [data.alerts, dismissed, activeRoute, cooldowns],
  );

  // Enforce per-alert trigger delays (load/delayMs) before showing.
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  useEffect(() => {
    const pending: Array<ReturnType<typeof setTimeout>> = [];
    candidates.forEach(alert => {
      const delay = alertDelayMs(alert);
      if (delay > 0 && !revealed.has(alert.id ?? '')) {
        pending.push(
          setTimeout(() => {
            setRevealed(prev => {
              const next = new Set(prev);
              const id = alert.id ?? '';
              if (id) {
                next.add(id);
              }
              return next;
            });
          }, delay),
        );
      }
    });
    timers.current.push(...pending);
    return () => {
      pending.forEach(clearTimeout);
    };
    // Running on revealed changes is safe: unrevealed alerts simply get their
    // timer (re)scheduled, and already-revealed alerts are skipped.
  }, [candidates, revealed]);

  const visibleAlerts = candidates.filter(
    alert => alertDelayMs(alert) === 0 || revealed.has(alert.id ?? ''),
  );

  const showOperational =
    (ops?.mode === 'notice' || ops?.mode === 'maintenance') &&
    ops?.bannerMessage;

  const showUpdate = ops?.appUpdate?.policy;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: theme.colors.background,
        },
      ]}>
      {visibleAlerts.map(alert => (
        <AlertBanner
          key={alert.id}
          alert={alert}
          onAction={href => {
            handleDestination(navigation, href).catch(() => {});
          }}
          onDismiss={() => {
            const id = alert.id;
            setDismissed(prev => ({...prev, [id ?? '']: true}));
            recordShown(id);
          }}
          onShown={() => {
            recordShown(alert.id);
          }}
        />
      ))}
      {showUpdate ? (
        <AppUpdateBanner
          policy={ops.appUpdate?.policy}
          minimumVersion={ops.appUpdate?.minimumVersion}
          recommendedVersion={ops.appUpdate?.recommendedVersion}
          message={ops.appUpdate?.message}
          currentVersion={getAppVersion()}
        />
      ) : null}
      {showOperational ? (
        <View
          testID="operational-notice"
          accessibilityRole="alert"
          style={[
            styles.notice,
            {
              backgroundColor: theme.colors.surfaceAlt,
              borderColor: theme.colors.border,
            },
          ]}>
          <ThemedText variant="caption" color="muted">
            {ops.bannerMessage}
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  notice: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
});
