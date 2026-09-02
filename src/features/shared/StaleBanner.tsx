import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';

interface StaleBannerProps {
  reason?: string;
}


export function StaleBanner({reason}: StaleBannerProps): React.JSX.Element {
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
        {backgroundColor: theme.colors.notice + '22'},
        {borderColor: theme.colors.notice},
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
