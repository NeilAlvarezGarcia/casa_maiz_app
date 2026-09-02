import {Platform} from 'react-native';

export interface ThemeColors {

  accent: string;
  accentContrast: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textInverse: string;
  textMuted: string;
  textOnAccent: string;
  border: string;
  danger: string;
  warning: string;
  success: string;
  notice: string;
}

export interface ThemeSpacing {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface ThemeType {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radius: number;
  fontSizes: {xs: number; sm: number; md: number; lg: number; xl: number; xxl: number};
  isDark: boolean;
  isAndroid: boolean;
  touchTarget: number;
  horizontalPadding: number;
}

const lightColors: ThemeColors = {
  accent: '#ef4938',
  accentContrast: '#ffffff',
  background: '#faf7f2',
  backgroundAlt: '#f1ece3',
  surface: '#ffffff',
  surfaceAlt: '#f5f0e8',
  text: '#1d1a17',
  textInverse: '#ffffff',
  textMuted: '#6d6459',
  textOnAccent: '#ffffff',
  border: '#e3dcd0',
  danger: '#b3261e',
  warning: '#8a5a00',
  success: '#1e7a3c',
  notice: '#c8960c',
};

const darkColors: ThemeColors = {
  accent: '#ff6a5b',
  accentContrast: '#3a0603',
  background: '#141210',
  backgroundAlt: '#1c1917',
  surface: '#211d1a',
  surfaceAlt: '#2a2521',
  text: '#f2ece2',
  textInverse: '#141210',
  textMuted: '#b3a89a',
  textOnAccent: '#141210',
  border: '#38332d',
  danger: '#ff8a80',
  warning: '#ffd38a',
  success: '#7ee08b',
  notice: '#ffcf5c',
};

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const fontSizes = {xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 32} as const;

export function buildTheme(isDark: boolean, accent?: string): ThemeType {
  const colors: ThemeColors = isDark
    ? {...darkColors, accent: accent ?? darkColors.accent}
    : {...lightColors, accent: accent ?? lightColors.accent};
  const isAndroid = Platform.OS === 'android';
  return {
    colors,
    spacing,
    radius: isAndroid ? 12 : 14,
    fontSizes,
    isDark,
    isAndroid,

    touchTarget: isAndroid ? 48 : 44,
    horizontalPadding: 20,
  };
}
