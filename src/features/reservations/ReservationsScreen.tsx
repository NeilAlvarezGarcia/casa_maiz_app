import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';

export function ReservationsScreen(): React.JSX.Element {
  const theme = useTheme();
  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.colors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: theme.horizontalPadding },
      ]}
      testID="reservations-screen">
      <View style={styles.body}>
        <ThemedText variant="heading">Reservaciones</ThemedText>
        <ThemedText variant="body" color="muted" style={styles.message}>
          La reservación en línea estará disponible próximamente.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingTop: 32, paddingBottom: 40 },
  body: { gap: 12 },
  message: { lineHeight: 22 },
});
