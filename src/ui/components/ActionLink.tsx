import React from 'react';
import {Pressable, StyleSheet, type StyleProp, type ViewStyle} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NavigationProp} from '@react-navigation/native';
import {useTheme} from '../theme';
import {ThemedText} from './Text';
import {
  handleDestination,
  type NavigatorRootParamList,
} from '../../navigation/destinationResolver';

interface ActionLinkProps {
  label: string;
  destination: string | {path?: string; href?: string; key?: string} | undefined;
  /** Visual treatment. */
  variant?: 'primary' | 'ghost' | 'outline';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Renders a CMS action as a tappable button and routes it through the
 * centralized destination resolver. The block needs no knowledge of
 * navigation internals.
 */
export function ActionLink({
  label,
  destination,
  variant = 'primary',
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
    variant === 'outline' ? {borderWidth: 1, borderColor: theme.colors.border} : null;

  const textColor =
    variant === 'primary'
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
      style={({pressed}) => [
        styles.button,
        {backgroundColor: backgrounds[variant], minHeight: theme.touchTarget},
        border,
        pressed && styles.pressed,
        style,
      ]}>
      <ThemedText variant="button" style={{color: textColor}}>
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
