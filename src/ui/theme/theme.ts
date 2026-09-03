import { isAndroid } from '../../core/platform';

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
  overlay: string;
  surfaceOnAccent: string;
  heroEyebrow: string;
  glassLight: string;
  glassDark: string;
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
  fontSizes: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
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
  overlay: 'rgba(0,0,0,0.45)',
  surfaceOnAccent: 'rgba(255,255,255,0.16)',
  heroEyebrow: '#ffd9a0',
  glassLight: 'rgba(255,255,255,0.72)',
  glassDark: 'rgba(20,18,16,0.72)',
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
  overlay: 'rgba(0,0,0,0.55)',
  surfaceOnAccent: 'rgba(255,255,255,0.12)',
  heroEyebrow: '#ffd9a0',
  glassLight: 'rgba(255,255,255,0.72)',
  glassDark: 'rgba(20,18,16,0.72)',
};

export const spacing: ThemeSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const fontSizes = { xs: 12, sm: 14, md: 16, lg: 20, xl: 26, xxl: 32 } as const;

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3,8})$/i.exec(hex);
  if (!m) {
    return null;
  }
  let h = m[1];
  if (h.length === 3) {
    h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  }
  if (h.length !== 6) {
    return null;
  }
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const sRGB = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function contrastOnAccent(accentHex: string, isDark: boolean): string {
  const rgb = hexToRgb(accentHex);
  if (!rgb) {
    return isDark ? darkColors.textOnAccent : lightColors.textOnAccent;
  }
  const lum = relativeLuminance(...rgb);
  return lum > 0.4 ? '#141210' : '#ffffff';
}

export function buildTheme(isDark: boolean, accent?: string): ThemeType {
  const palette = isDark ? darkColors : lightColors;
  const accentValue = accent ?? palette.accent;
  const colors: ThemeColors = {
    ...palette,
    accent: accentValue,
    accentContrast: accent
      ? contrastOnAccent(accent, isDark)
      : palette.accentContrast,
    textOnAccent: accent
      ? contrastOnAccent(accent, isDark)
      : palette.textOnAccent,
  };
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
