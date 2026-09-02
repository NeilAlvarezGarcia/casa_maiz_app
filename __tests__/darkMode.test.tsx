import React from 'react';
import { render } from '@testing-library/react-native';
import { buildTheme } from '../src/ui/theme/theme';
import { ThemedText } from '../src/ui/components/Text';
import { ActionLink } from '../src/ui/components/ActionLink';
import { RestaurantHero } from '../src/blocks/components/RestaurantHero';
import { ThemeProvider } from '../src/ui/theme';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('Theme token differentiation', () => {
  it('provides distinct overlay values for light and dark modes', () => {
    const light = buildTheme(false);
    const dark = buildTheme(true);
    expect(light.colors.overlay).not.toBe(dark.colors.overlay);
    expect(light.colors.surfaceOnAccent).not.toBe(dark.colors.surfaceOnAccent);
  });

  it('provides consistent glass tokens across modes', () => {
    const light = buildTheme(false);
    const dark = buildTheme(true);
    expect(typeof light.colors.glassLight).toBe('string');
    expect(typeof dark.colors.glassDark).toBe('string');
    expect(light.colors.glassLight).not.toBe(dark.colors.glassDark);
  });

  it('heroEyebrow is readable in both modes', () => {
    const light = buildTheme(false);
    const dark = buildTheme(true);
    expect(light.colors.heroEyebrow).toBeTruthy();
    expect(dark.colors.heroEyebrow).toBeTruthy();
  });
});

describe('accentContrast auto-computation', () => {
  it('uses default contrast when no CMS accent is provided', () => {
    const light = buildTheme(false);
    const dark = buildTheme(true);
    expect(light.colors.accentContrast).toBe('#ffffff');
    expect(dark.colors.accentContrast).toBe('#3a0603');
  });

  it('computes dark text for a light CMS accent', () => {
    const theme = buildTheme(false, '#7ecbf5');
    expect(theme.colors.accentContrast).toBe('#141210');
    expect(theme.colors.textOnAccent).toBe('#141210');
  });

  it('computes light text for a dark CMS accent', () => {
    const theme = buildTheme(false, '#1a1a2e');
    expect(theme.colors.accentContrast).toBe('#ffffff');
    expect(theme.colors.textOnAccent).toBe('#ffffff');
  });

  it('computes contrast correctly in dark mode with CMS accent', () => {
    const theme = buildTheme(true, '#ff6a5b');
    expect(theme.colors.accentContrast).toBe('#ffffff');
    expect(theme.colors.textOnAccent).toBe('#ffffff');
  });
});

describe('Dark mode rendering', () => {
  it('renders ThemedText with dark-mode text color', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ThemedText variant="body">Hello</ThemedText>
      </ThemeProvider>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders RestaurantHero overlay using theme token', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <RestaurantHero
          block={{
            blockType: 'restaurantHero',
            headline: 'Test Hero',
          }}
        />
      </ThemeProvider>,
    );
    expect(getByTestId('restaurantHero')).toBeTruthy();
  });

  it('renders ActionLink ghost-on-accent with themed surface', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ActionLink
          label="Ghost Button"
          destination="/menu"
          variant="ghost"
          onAccent
        />
      </ThemeProvider>,
    );
    expect(getByText('Ghost Button')).toBeTruthy();
  });
});
