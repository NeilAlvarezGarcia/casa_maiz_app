import React from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../features/home/HomeScreen';
import { MenuScreen } from '../features/menu/MenuScreen';
import { ReservationsScreen } from '../features/reservations/ReservationsScreen';
import { PrivacyScreen } from '../features/privacy/PrivacyScreen';
import { useBootstrap } from '../state/bootstrap';
import { useTheme } from '../ui/theme';
import { useReducedTransparency } from '../core/hooks/useReducedTransparency';
import type { CmsClient } from '../api/cmsClient';
import { ROUTE_MAP } from './destinationResolver';

const Tab = createBottomTabNavigator();

type ScreenKey = 'Home' | 'Menu' | 'Reservations' | 'Privacy';

const FALLBACK_TABS: Array<{ route: ScreenKey; label: string }> = [
  { route: 'Home', label: 'Inicio' },
  { route: 'Menu', label: 'Menú' },
  { route: 'Reservations', label: 'Reservar' },
  { route: 'Privacy', label: 'Privacidad' },
];

const GLYPHS: Record<ScreenKey, string> = {
  Home: '\u2302',
  Menu: '\u25C9',
  Reservations: '\u2733',
  Privacy: '\u2139',
};

export function RootNavigator({
  client,
}: {
  client: CmsClient;
}): React.JSX.Element {
  const theme = useTheme();
  const bootstrap = useBootstrap();
  const items = bootstrap.data.navigation?.items ?? [];
  const reducedTransparency = useReducedTransparency();

  const glass = !theme.isAndroid && !reducedTransparency;
  const tabBarBackground = glass
    ? theme.isDark
      ? 'rgba(20,18,16,0.72)'
      : 'rgba(255,255,255,0.72)'
    : theme.colors.surface;

  const cmsTabs = items
    .map(item => {
      const path = item.destination?.path ?? item.destination?.href;
      if (!path) {
        return null;
      }
      const route = ROUTE_MAP[path]?.route as ScreenKey | undefined;
      if (!route) {
        return null;
      }
      return { route, label: item.label ?? route };
    })
    .filter((t): t is { route: ScreenKey; label: string } => t !== null);

  const tabs = cmsTabs.length ? cmsTabs : FALLBACK_TABS;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: tabBarBackground,
            borderTopColor: theme.colors.border,
            height: Platform.OS === 'ios' ? 82 : 64,
          },
        ],
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
      backBehavior="firstRoute">
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.route}
          name={tab.route}
          options={{
            // eslint-disable-next-line react/no-unstable-nested-components
            tabBarIcon: ({ color, size }) => (
              <Text style={{ color, fontSize: size, lineHeight: size }}>
                {GLYPHS[tab.route]}
              </Text>
            ),
            tabBarLabel: tab.label,
          }}>
          {() => <ScreenForRoute route={tab.route} client={client} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

function ScreenForRoute({
  route,
  client,
}: {
  route: ScreenKey;
  client: CmsClient;
}): React.JSX.Element {
  switch (route) {
    case 'Home':
      return <HomeScreen client={client} />;
    case 'Menu':
      return <MenuScreen client={client} />;
    case 'Reservations':
      return <ReservationsScreen />;
    case 'Privacy':
      return <PrivacyScreen client={client} />;
  }
}

const styles = StyleSheet.create({
  tabBar: {
    borderTopWidth: 1,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
