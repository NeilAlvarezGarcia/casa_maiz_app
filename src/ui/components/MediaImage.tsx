import { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { preferredMediaUrl } from '../../api/cmsClient';
import type { Media } from '../../api/schemas/shared';

interface MediaImageProps {
  media?: Media;

  source?: Media;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;

  aspectRatio?: number;
  accessibilityLabel?: string;
  testID?: string;
}

export function MediaImage({
  media,
  source,
  style,
  width,
  aspectRatio,
  accessibilityLabel,
  testID,
}: MediaImageProps): JSX.Element | null {
  const resolved = useMemo(
    () => preferredMediaUrl(source ?? media),
    [source, media],
  );

  const ratio = useMemo(() => {
    if (aspectRatio) {
      return aspectRatio;
    }
    const m = source ?? media;
    if (m?.width && m?.height && m.width > 0) {
      return m.width / m.height;
    }

    return 16 / 9;
  }, [aspectRatio, source, media]);

  if (!resolved) {
    return null;
  }

  const { width: styleWidth, ...viewStyle } = (StyleSheet.flatten(style) ??
    {}) as ViewStyle & { width?: number | string };

  const containerWidth = styleWidth ?? width ?? '100%';
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        viewStyle,
        { width: containerWidth, aspectRatio: ratio },
      ]}>
      <Image
        source={{ uri: resolved }}
        style={styles.image}
        resizeMode="cover"
        accessible
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel ?? media?.alt ?? ''}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
