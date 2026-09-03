import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import type { PageLoadState } from '../hooks/usePageData';

interface StaleBannerProps {
  reason?: string;
}

export function StaleNotice({
  state,
}: {
  state: PageLoadState;
}): JSX.Element | null {
  if (state.status !== 'success' || !state.stale) {
    return null;
  }
  return <StaleBanner reason={state.staleReason} />;
}

export function StaleBanner({ reason }: StaleBannerProps): JSX.Element {
  const theme = useTheme();
  const label =
    reason === 'nextChangeAt-exceeded'
      ? 'Contenido guardado (posiblemente desactualizado)'
      : 'Sin conexión. Mostrando contenido guardado.';
  return (
    <View
      testID="stale-banner"
      accessibilityRole="alert"
      style={[
        styles.banner,
        { backgroundColor: theme.colors.notice + '22' },
        { borderColor: theme.colors.notice },
      ]}>
      <ThemedText variant="caption" color="text">
        {label}
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
    marginBottom: 12,
    gap: 4,
  },
});
