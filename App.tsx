import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getCmsClient } from './src/api/clientSingleton';
import { BootstrapProvider, useBootstrap } from './src/state/bootstrap';
import { NetworkProvider } from './src/state/network';
import { ThemeProvider, useTheme } from './src/ui/theme';
import { TopBar } from './src/features/shared/TopBar';
import { OfflineBanner } from './src/features/shared/OfflineBanner';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/deepLink';
import { LoadingState } from './src/ui/components/StateViews';
import {
  ActiveRouteProvider,
  focusedRouteName,
} from './src/navigation/activeRoute';
import { DEFAULT_ROUTE } from './src/navigation/routes';
import type { RouteName } from './src/navigation/routes';

function BootstrappedApp(): React.JSX.Element {
  const bootstrap = useBootstrap();
  const theme = useTheme();

  return (
    <ThemeProvider accent={bootstrap.accent}>
      <View
        style={[
          styles.root,
          { backgroundColor: theme.colors.background },
        ]}>
        <StatusBar
          barStyle={theme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={theme.colors.background}
        />
        {bootstrap.loading ? (
          <LoadingState label="Iniciando…" />
        ) : (
          <>
            <TopBar />
            <OfflineBanner />
            <RootNavigator client={getCmsClient()} />
          </>
        )}
      </View>
    </ThemeProvider>
  );
}

function App(): React.JSX.Element {
  const client = useMemo(() => getCmsClient(), []);
  const [activeRoute, setActiveRoute] = useState<RouteName>(DEFAULT_ROUTE);

  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <ActiveRouteProvider value={activeRoute}>
          <NavigationContainer
            linking={linking}
            onStateChange={state => setActiveRoute(focusedRouteName(state))}>
            <BootstrapProvider client={client}>
              <ThemeProvider>
                <BootstrappedApp />
              </ThemeProvider>
            </BootstrapProvider>
          </NavigationContainer>
        </ActiveRouteProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
