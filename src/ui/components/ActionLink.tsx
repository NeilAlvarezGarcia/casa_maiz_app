import React from 'react';
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useTheme } from '../theme';
import { ThemedText } from './Text';
import {
  handleDestination,
  type NavigatorRootParamList,
} from '../../navigation/destinationResolver';

interface ActionLinkProps {
  label: string;
  destination:
    | string
    | { path?: string; href?: string; key?: string }
    | undefined;

  variant?: 'primary' | 'ghost' | 'outline';

  onAccent?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ActionLink({
  label,
  destination,
  variant = 'primary',
  onAccent = false,
  onPress,
  style,
  testID,
}: ActionLinkProps): React.JSX.Element {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<NavigatorRootParamList>>();

  const handlePress = () => {
    onPress?.();
    handleDestination(navigation, destination).catch(() => {});
  };

  const backgrounds: Record<string, string> = {
    primary: theme.colors.accent,
    ghost: 'transparent',
    outline: 'transparent',
  };

  const border =
    variant === 'outline' || (onAccent && variant === 'ghost')
      ? {
          borderWidth: 1,
          borderColor: onAccent
            ? theme.colors.textOnAccent
            : theme.colors.border,
        }
      : null;

  const backgroundColor =
    onAccent && variant === 'ghost'
      ? 'rgba(255,255,255,0.16)'
      : backgrounds[variant];

  const textColor =
    variant === 'primary' || onAccent
      ? theme.colors.textOnAccent
      : variant === 'ghost'
      ? theme.colors.accent
      : theme.colors.text;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, minHeight: theme.touchTarget },
        border,
        pressed && styles.pressed,
        style,
      ]}>
      <ThemedText variant="button" style={{ color: textColor }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
