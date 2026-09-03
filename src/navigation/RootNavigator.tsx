import { StyleSheet, Text } from 'react-native';
import { isIos } from '../core/platform';
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
import { RouteNames, type RouteName } from './routes';

const Tab = createBottomTabNavigator();

const FALLBACK_TABS: Array<{ route: RouteName; label: string }> = [
  { route: RouteNames.Home, label: 'Inicio' },
  { route: RouteNames.Menu, label: 'Menú' },
  { route: RouteNames.Reservations, label: 'Reservar' },
  { route: RouteNames.Privacy, label: 'Privacidad' },
];

const GLYPHS: Record<RouteName, string> = {
  [RouteNames.Home]: '\u2302',
  [RouteNames.Menu]: '\u25C9',
  [RouteNames.Reservations]: '\u2733',
  [RouteNames.Privacy]: '\u2139',
};

export function RootNavigator({
  client,
}: {
  client: CmsClient;
}): JSX.Element {
  const theme = useTheme();
  const bootstrap = useBootstrap();
  const items = bootstrap.data.navigation?.items ?? [];
  const reducedTransparency = useReducedTransparency();

  const glass = !theme.isAndroid && !reducedTransparency;
  const tabBarBackground = glass
    ? theme.isDark
      ? theme.colors.glassDark
      : theme.colors.glassLight
    : theme.colors.surface;

  const cmsTabs = items
    .map(item => {
      const path = item.destination?.path ?? item.destination?.href;
      if (!path) {
        return null;
      }
      const route = ROUTE_MAP[path]?.route as RouteName | undefined;
      if (!route) {
        return null;
      }
      return { route, label: item.label ?? route };
    })
    .filter((t): t is { route: RouteName; label: string } => t !== null);

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
            height: isIos ? 82 : 64,
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
  route: RouteName;
  client: CmsClient;
}): JSX.Element {
  switch (route) {
    case RouteNames.Home:
      return <HomeScreen client={client} />;
    case RouteNames.Menu:
      return <MenuScreen client={client} />;
    case RouteNames.Reservations:
      return <ReservationsScreen client={client} />;
    case RouteNames.Privacy:
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
