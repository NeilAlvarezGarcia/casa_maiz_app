import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  PixelRatio,
  StyleSheet,
  useWindowDimensions,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { preferredMediaUrl } from '../../api/cmsClient';
import type { Media } from '../../api/schemas/shared';
import { useTheme } from '../theme';

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
  width = '100%',
  aspectRatio,
  accessibilityLabel,
  testID,
}: MediaImageProps): JSX.Element | null {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [failed, setFailed] = useState(false);

  const meddiaActive = source ?? media;

  const resolved = useMemo(() => {
    const containerWidth = StyleSheet.flatten(style)?.width as
      | number
      | undefined;
    const knownWidth =
      typeof containerWidth === 'number'
        ? containerWidth
        : typeof width === 'number'
        ? width
        : windowWidth;
    const targetWidth = Math.round(knownWidth * PixelRatio.get());
    return preferredMediaUrl(meddiaActive, undefined, targetWidth);
  }, [meddiaActive, style, width, windowWidth]);

  useEffect(() => {
    setFailed(false);
  }, [resolved]);

  const ratio = useMemo(() => {
    if (aspectRatio) {
      return aspectRatio;
    }
    const m = meddiaActive;
    if (m?.width && m?.height && m.width > 0) {
      return m.width / m.height;
    }

    return 16 / 9;
  }, [aspectRatio, meddiaActive]);

  if (!resolved) {
    return null;
  }

  const label = accessibilityLabel ?? media?.alt;
  const { width: styleWidth, ...viewStyle } = (StyleSheet.flatten(style) ??
    {}) as ViewStyle & { width?: number | string };

  const containerWidth = styleWidth ?? width;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        viewStyle,
        {
          width: containerWidth,
          aspectRatio: ratio,
          backgroundColor: theme.colors.surfaceAlt,
        },
      ]}>
      {failed ? (
        <View
          style={styles.fallback}
          testID={testID ? `${testID}-fallback` : 'mediaImage-fallback'}
        />
      ) : (
        <Image
          source={{ uri: resolved }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setFailed(true)}
          accessible={!!label}
          accessibilityRole={label ? 'image' : undefined}
          accessibilityLabel={label}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fallback: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
