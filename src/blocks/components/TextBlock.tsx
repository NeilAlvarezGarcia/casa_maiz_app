import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {TextBlock} from '../../api/types';
import {ThemedText} from '../../ui/components/Text';

interface TextBlockProps {
  block: TextBlock;
}

export function TextBlockComponent({
  block,
}: TextBlockProps): React.JSX.Element {
  const isCenter = block.alignment === 'center';
  if (!block.heading && !block.body && !block.eyebrow) {
    return <View testID="textBlock-empty" />;
  }
  return (
    <View
      testID="textBlock"
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
