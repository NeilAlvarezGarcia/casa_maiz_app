import { StyleSheet, View } from 'react-native';
import type { MediaBlock } from '../../api/types';
import { MediaImage } from '../../ui/components/MediaImage';
import { ThemedText } from '../../ui/components/Text';

interface MediaBlockProps {
  block: MediaBlock;
}

export function MediaBlock({ block }: MediaBlockProps): JSX.Element | null {
  const media = block.media ?? block.image;

  if (!media?.url && !media?.sizes) {
    return null;
  }

  return (
    <View
      testID="mediaBlock"
      style={[
        styles.container,
        block.fullBleed ? styles.fullBleed : styles.contained,
      ]}>
      <MediaImage
        media={media}
        style={styles.image}
        aspectRatio={block.aspectRatio ?? 16 / 9}
        accessibilityLabel={media.alt}
      />
      {block.caption ? (
        <ThemedText variant="caption" color="muted" style={styles.caption}>
          {block.caption}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
