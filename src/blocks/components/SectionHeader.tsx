import { StyleSheet, View } from 'react-native';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';

interface SectionHeaderProps {
  eyebrow?: string;
  title?: string;
  center?: boolean;
  testID?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  center,
  testID,
}: SectionHeaderProps): JSX.Element | null {
  const theme = useTheme();

  if (!eyebrow && !title) {
    return null;
  }

  return (
    <View testID={testID} style={[styles.container, center && styles.centered]}>
      {eyebrow ? (
        <ThemedText variant="eyebrow" color="accent">
          {eyebrow}
        </ThemedText>
      ) : null}
      {title ? (
        <ThemedText variant="heading" style={styles.title}>
          {title}
        </ThemedText>
      ) : null}
      <View style={[styles.rule, { backgroundColor: theme.colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 6,
  },
  centered: {
    alignItems: 'center',
  },
  title: {
    marginTop: 2,
  },
  rule: {
    height: 1,
    marginTop: 8,
    width: '100%',
  },
});
