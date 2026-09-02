import React from 'react';
import { Text, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '../theme';

export type TextVariant =
  | 'eyebrow'
  | 'heading'
  | 'title'
  | 'body'
  | 'caption'
  | 'button';

const variantStyles: Record<TextVariant, TextStyle> = {
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heading: { fontSize: 26, fontWeight: '700', lineHeight: 32 },
  title: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  button: { fontSize: 16, fontWeight: '600' },
};

interface ThemedTextProps extends TextProps {
  variant?: TextVariant;
  color?: 'text' | 'muted' | 'inverse' | 'onAccent' | 'accent';
  style?: TextStyle | TextStyle[];
}

export function ThemedText({
  variant = 'body',
  color = 'text',
  style,
  ...props
}: ThemedTextProps): React.JSX.Element {
  const theme = useTheme();
  const colorMap = {
    text: theme.colors.text,
    muted: theme.colors.textMuted,
    inverse: theme.colors.textInverse,
    onAccent: theme.colors.textOnAccent,
    accent: theme.colors.accent,
  } as const;
  return (
    <Text
      {...props}
      style={[
        variantStyles[variant],
        { color: colorMap[color] },
        style,
      ]}
    />
  );
}
