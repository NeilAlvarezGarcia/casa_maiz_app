import React, { useMemo, useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getCmsClient } from './src/api/clientSingleton';
import { BootstrapProvider, useBootstrap } from './src/state/bootstrap';
import { ThemeProvider, useTheme } from './src/ui/theme';
import { TopBar } from './src/features/shared/TopBar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { linking } from './src/navigation/deepLink';
import { LoadingState } from './src/ui/components/StateViews';
import {
  ActiveRouteProvider,
  focusedRouteName,
} from './src/navigation/activeRoute';

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
            <RootNavigator client={getCmsClient()} />
          </>
        )}
      </View>
    </ThemeProvider>
  );
}

function App(): React.JSX.Element {
  const client = useMemo(() => getCmsClient(), []);
  const [activeRoute, setActiveRoute] = useState('Home');

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
