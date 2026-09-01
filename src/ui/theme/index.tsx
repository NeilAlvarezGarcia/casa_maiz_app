import React, {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import {useColorScheme} from 'react-native';
import {buildTheme, type ThemeType} from './theme';

/**
 * Provides the app theme, including a CMS-controlled accent color pulled from
 * bootstrap's experience.visualDefaults.accent when available. Consumers use
 * useTheme(); nothing here is statically tied to CMS values.
 */
const ThemeContext = createContext<ThemeType | null>(null);

interface ThemeProviderProps {
  accent?: string;
}

export function ThemeProvider({
  children,
  accent,
}: PropsWithChildren<ThemeProviderProps>): React.JSX.Element {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const theme = useMemo(() => buildTheme(isDark, accent), [isDark, accent]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeType {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}
