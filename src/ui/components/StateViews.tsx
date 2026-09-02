import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useTheme} from '../theme';
import {ThemedText} from './Text';



export function LoadingState({label = 'Cargando…'}: {label?: string}): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container} accessibilityRole="progressbar">
      <ActivityIndicator color={theme.colors.accent} size="large" />
      <ThemedText variant="body" color="muted" style={styles.centerText}>
        {label}
      </ThemedText>
    </View>
  );
}

interface ErrorStateProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  testID?: string;
}

export function ErrorState({
  title,
  message,
  onRetry,
  retryLabel = 'Reintentar',
  testID,
}: ErrorStateProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container} testID={testID}>
      <ThemedText variant="title" style={styles.centerText}>
        {title}
      </ThemedText>
      {message ? (
        <ThemedText
          variant="body"
          color="muted"
          style={[styles.centerText, styles.message]}>
          {message}
        </ThemedText>
      ) : null}
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
          style={({pressed}) => [
            styles.retryButton,
            {backgroundColor: theme.colors.accent},
            pressed && styles.pressed,
          ]}>
          <ThemedText variant="button" color="onAccent">
            {retryLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({label}: {label: string}): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ThemedText variant="body" color="muted" style={styles.centerText}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    minHeight: 180,
    gap: 12,
  },
  centerText: {
    textAlign: 'center',
  },
  message: {
    maxWidth: 320,
  },
  retryButton: {
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
