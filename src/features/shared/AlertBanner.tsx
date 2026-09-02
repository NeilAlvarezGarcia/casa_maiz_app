import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import type { Alert } from '../../api/schemas/bootstrap';

interface AlertBannerProps {
  alert: Alert;
  onAction?: (href?: string, label?: string) => void;
  onDismiss: () => void;

  onShown?: () => void;
}

export function AlertBanner({
  alert,
  onAction,
  onDismiss,
  onShown,
}: AlertBannerProps): React.JSX.Element {
  const theme = useTheme();
  const reported = React.useRef(false);
  React.useEffect(() => {
    if (!reported.current) {
      reported.current = true;
      onShown?.();
    }
  }, [onShown]);
  return (
    <View
      testID={`alert-${alert.id}`}
      accessibilityRole="alert"
      style={[
        styles.container,
        { backgroundColor: theme.colors.notice + '22' },
      ]}>
      <View style={styles.textBlock}>
        {alert.title ? (
          <ThemedText variant="title" style={styles.title}>
            {alert.title}
          </ThemedText>
        ) : null}
        {alert.message ? (
          <ThemedText variant="body" color="muted">
            {alert.message}
          </ThemedText>
        ) : null}
        {alert.actions?.length ? (
          <View style={styles.actions}>
            {alert.actions.map((action, i) => (
              <Pressable
                key={i}
                accessibilityRole="button"
                accessibilityLabel={action.label ?? 'Ver'}
                onPress={() => onAction?.(action.href, action.label)}>
                <ThemedText variant="button" color="accent">
                  {action.label ?? 'Ver'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
      {alert.dismissible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar aviso"
          hitSlop={10}
          onPress={onDismiss}
          style={styles.dismiss}>
          <ThemedText variant="caption" color="muted">
            ✕
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 8,
  },
  textBlock: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 4,
  },
  dismiss: {
    padding: 4,
  },
});
