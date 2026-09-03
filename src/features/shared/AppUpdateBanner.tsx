import { useState } from 'react';
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import {
  normalizeVersion,
  getAppVersion,
} from '../../core/context/queryContext';

interface AppUpdateBannerProps {
  policy?: string;
  minimumVersion?: string;
  recommendedVersion?: string;
  message?: string;
  storeUrl: string;
  currentVersion?: string;
}

export function AppUpdateBanner({
  policy,
  minimumVersion,
  recommendedVersion,
  message,
  storeUrl,
  currentVersion = getAppVersion(),
}: AppUpdateBannerProps): JSX.Element | null {
  const theme = useTheme();
  const [temporarilyClosed, setTemporarilyClosed] = useState(false);

  const required = policy === 'required';
  const threshold = required ? minimumVersion : recommendedVersion;

  const upToDate = threshold
    ? normalizeVersion(currentVersion) >= normalizeVersion(threshold)
    : false;
  if (upToDate) {
    return null;
  }

  const close = () => {
    if (!required) {
      setTemporarilyClosed(true);
    }
  };

  const handleUpdate = () => {
    close();
    Linking.openURL(storeUrl);
  };

  return (
    <Modal
      visible={!temporarilyClosed}
      transparent
      animationType="fade"
      onRequestClose={close}
      accessibilityViewIsModal>
      <Pressable
        testID="app-update-modal"
        accessibilityRole="alert"
        onPress={close}
        style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}>
        <Pressable
          onPress={e => e.stopPropagation()}
          accessibilityViewIsModal
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius,
              borderColor: theme.colors.border,
              paddingBottom: theme.spacing.md,
            },
          ]}>
          <ThemedText variant="body" color="muted" style={styles.message}>
            {message}
          </ThemedText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Actualizar"
            onPress={handleUpdate}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.colors.accent },
              pressed && styles.pressed,
            ]}>
            <ThemedText variant="button" color="onAccent">
              Actualizar
            </ThemedText>
          </Pressable>
          {!required && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ahora no"
              onPress={close}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.pressed,
              ]}>
              <ThemedText variant="button" color="accent">
                Ahora no
              </ThemedText>
            </Pressable>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 14,
  },
  message: {
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  secondaryButton: {
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
});
