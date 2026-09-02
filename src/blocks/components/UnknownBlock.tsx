import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';

interface UnknownBlockProps {
  blockType: string;
}

export function UnknownBlock({
  blockType,
}: UnknownBlockProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <View
      testID={`unknown-block-${blockType}`}
      style={[styles.container, { backgroundColor: theme.colors.surfaceAlt }]}>
      <ThemedText variant="caption" color="muted">
        Bloque no disponible
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
});
