import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import { normalizeVersion } from '../../core/context/queryContext';
import { STORE_URL } from '../../config';

interface AppUpdateBannerProps {
  policy?: string;
  minimumVersion?: string;
  recommendedVersion?: string;
  message?: string;
  currentVersion: string;
}

export function AppUpdateBanner({
  policy,
  minimumVersion,
  recommendedVersion,
  message,
  currentVersion,
}: AppUpdateBannerProps): JSX.Element | null {
  const theme = useTheme();
  const storeUrl = STORE_URL;

  if (!policy) {
    return null;
  }

  const required = policy === 'required';
  const threshold = required ? minimumVersion : recommendedVersion;
  if (threshold) {
    const isUpToDate =
      normalizeVersion(currentVersion) >= normalizeVersion(threshold);
    if (isUpToDate) {
      return null;
    }
  }

  const text = required
    ? message ?? 'Es necesario actualizar la aplicación para continuar.'
    : message ?? 'Hay una versión nueva disponible. Recomendamos actualizar.';

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl);
    }
  };

  return (
    <View
      testID="app-update-banner"
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          backgroundColor: required
            ? theme.colors.danger + '22'
            : theme.colors.surfaceAlt,
          borderColor: required ? theme.colors.danger : theme.colors.border,
        },
      ]}>
      <ThemedText variant="body" style={styles.message}>
        {text}
      </ThemedText>
      {storeUrl ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Actualizar"
          onPress={handleUpdate}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: theme.colors.accent },
            pressed && styles.pressed,
          ]}>
          <ThemedText variant="button" color="onAccent">
            Actualizar
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 8,
  },
  message: {
    lineHeight: 22,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  pressed: {
    opacity: 0.8,
  },
});
