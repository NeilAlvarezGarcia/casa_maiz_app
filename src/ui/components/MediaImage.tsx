import React, {useMemo} from 'react';
import {
  Image,
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {preferredMediaUrl} from '../../api/cmsClient';
import type {Media} from '../../api/schemas/shared';

interface MediaImageProps {
  media?: Media;
  /** Overrides the auto-picked source (e.g. an explicit mobileImage field). */
  source?: Media;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
  /** When both width and aspect ratio are known, the image won't shift layout. */
  aspectRatio?: number;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * Renders a CMS media object, choosing the appropriate mobile source and
 * reserving space (via width + aspectRatio or raw dimensions) to avoid layout
 * shifts. Missing/malformed media renders nothing without crashing.
 */
export function MediaImage({
  media,
  source,
  style,
  width,
  aspectRatio,
  accessibilityLabel,
  testID,
}: MediaImageProps): React.JSX.Element | null {
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
    // Safe default for CMS artwork; prevents a zero-height flash.
    return 16 / 9;
  }, [aspectRatio, source, media]);

  if (!resolved) {
    return null;
  }

  const {width: styleWidth, ...viewStyle} = (StyleSheet.flatten(style) ??
    {}) as ViewStyle & {width?: number | string};

  const containerWidth = styleWidth ?? width ?? '100%';
  return (
    <View
      testID={testID}
      style={[
        styles.container,
        viewStyle,
        {width: containerWidth, aspectRatio: ratio},
      ]}>
      <Image
        source={{uri: resolved}}
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
