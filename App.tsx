import React, {useMemo, useState} from 'react';
import {StatusBar, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {getCmsClient} from './src/api/clientSingleton';
import {BootstrapProvider, useBootstrap} from './src/state/bootstrap';
import {ThemeProvider, useTheme} from './src/ui/theme';
import {TopBar} from './src/features/shared/TopBar';
import {RootNavigator} from './src/navigation/RootNavigator';
import {LoadingState} from './src/ui/components/StateViews';
import {ActiveRouteProvider, focusedRouteName} from './src/navigation/activeRoute';

/**
 * Application shell: renders the CMS-driven chrome and navigator, theming the
 * whole tree with the bootstrapped accent. The visible loading state is
 * deliberate until /bootstrap resolves so accents are consistent.
 */
function BootstrappedApp(): React.JSX.Element {
  const bootstrap = useBootstrap();
  const theme = useTheme();
  const insetsTheme = theme;

  return (
    <ThemeProvider accent={bootstrap.accent}>
      <View style={[styles.root, {backgroundColor: insetsTheme.colors.background}]}>
        <StatusBar
          barStyle={insetsTheme.isDark ? 'light-content' : 'dark-content'}
          backgroundColor={insetsTheme.colors.background}
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
