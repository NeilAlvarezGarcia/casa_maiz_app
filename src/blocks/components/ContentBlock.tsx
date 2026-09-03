import { StyleSheet, View } from 'react-native';
import type { ContentBlock } from '../../api/types';
import { ThemedText } from '../../ui/components/Text';

interface ContentBlockProps {
  block: ContentBlock;
}

export function ContentBlock({ block }: ContentBlockProps): JSX.Element | null {
  const isCenter = block.alignment === 'center';

  if (!block.heading && !block.body && !block.eyebrow) {
    return null;
  }

  return (
    <View
      testID="content"
      style={[styles.container, isCenter && styles.centered]}>
      {block.eyebrow ? (
        <ThemedText variant="eyebrow" color="accent">
          {block.eyebrow}
        </ThemedText>
      ) : null}
      {block.heading ? (
        <ThemedText variant="heading" style={styles.heading}>
          {block.heading}
        </ThemedText>
      ) : null}
      {block.body ? (
        <ThemedText variant="body" color="muted">
          {block.body}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    gap: 8,
    maxWidth: 640,
  },
  centered: {
    alignSelf: 'center',
    alignItems: 'center',
  },
  heading: {
    textAlign: 'left',
  },
});
