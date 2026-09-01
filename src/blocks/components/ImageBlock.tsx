import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {ImageBlock} from '../../api/types';
import {MediaImage} from '../../ui/components/MediaImage';
import {ThemedText} from '../../ui/components/Text';

interface ImageBlockProps {
  block: ImageBlock;
}

export function ImageBlockComponent({
  block,
}: ImageBlockProps): React.JSX.Element {
  const image = block.mobileImage ?? block.image;
  if (!image?.url && !image?.sizes) {
    return <View testID="imageBlock-empty" style={styles.hidden} />;
  }
  return (
    <View
      testID="imageBlock"
      style={[
        styles.container,
        block.fullBleed ? styles.fullBleed : styles.contained,
      ]}>
      <MediaImage
        media={image}
        style={styles.image}
        aspectRatio={16 / 9}
        accessibilityLabel={image.alt ?? undefined}
      />
      {image.alt ? (
        <ThemedText variant="caption" color="muted" style={styles.caption}>
          {image.alt}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
  },
  container: {
    marginBottom: 20,
    gap: 6,
  },
  contained: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  fullBleed: {
    marginHorizontal: -20,
    borderRadius: 0,
  },
  image: {
    borderRadius: 14,
  },
  caption: {
    paddingHorizontal: 4,
  },
});
