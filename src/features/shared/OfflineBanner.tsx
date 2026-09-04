import { StyleSheet, View } from 'react-native';
import { useNetworkStatus } from '../../state/network';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';

export function OfflineBanner(): JSX.Element | null {
  const { isConnected } = useNetworkStatus();
  const theme = useTheme();

  if (isConnected) {
    return null;
  }

  return (
    <View
      testID="offline-banner"
      accessibilityRole="alert"
      style={[
        styles.banner,
        {
          backgroundColor: theme.colors.notice + '22',
          borderColor: theme.colors.notice,
        },
      ]}>
      <ThemedText variant="caption" color="text">
        Sin conexion. Mostrando contenido guardado.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
    marginHorizontal: 16,
  },
});
