import React from 'react';
import {
  StyleSheet,
  View,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import type { Media } from '../../api/schemas/shared';
import { ThemedText } from './Text';
import { MediaImage } from './MediaImage';
import { ActionLink } from './ActionLink';
import { CARD_BASE_STYLE, CARD_IMAGE_STYLE } from '../theme/blockStyles';

interface ContentCardCta {
  label?: string;
  destination?:
    | string
    | { path?: string; href?: string; key?: string }
    | undefined;
}

interface ContentCardProps {
  image?: Media | null;
  imageWidth?: DimensionValue;
  aspectRatio?: number;
  cardStyle?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ViewStyle>;
  eyebrow?: string;
  eyebrowColor?: 'accent' | 'muted';
  title?: string;
  description?: string;
  descriptionNumberOfLines?: number;
  bodyGap?: number;
  cta?: ContentCardCta;
  ctaVariant?: 'primary' | 'ghost' | 'outline';
  accessibilityLabel?: string;
  testID?: string;
}

export function ContentCard({
  image,
  imageWidth = '100%',
  aspectRatio = 16 / 9,
  eyebrow,
  eyebrowColor = 'accent',
  title,
  description,
  descriptionNumberOfLines,
  bodyGap = 6,
  cta,
  ctaVariant = 'outline',
  cardStyle,
  imageStyle,
  accessibilityLabel,
  testID,
}: ContentCardProps): React.JSX.Element {
  return (
    <View style={[CARD_BASE_STYLE, cardStyle]} testID={testID}>
      {image ? (
        <MediaImage
          media={image}
          style={[CARD_IMAGE_STYLE, imageStyle]}
          width={imageWidth}
          aspectRatio={aspectRatio}
          accessibilityLabel={accessibilityLabel}
        />
      ) : null}
      {eyebrow || title || description || cta?.label ? (
        <View style={[styles.body, { gap: bodyGap }]}>
          {eyebrow ? (
            <ThemedText variant="eyebrow" color={eyebrowColor}>
              {eyebrow}
            </ThemedText>
          ) : null}
          {title ? <ThemedText variant="title">{title}</ThemedText> : null}
          {description ? (
            <ThemedText
              variant="body"
              color="muted"
              numberOfLines={descriptionNumberOfLines}>
              {description}
            </ThemedText>
          ) : null}
          {cta?.label ? (
            <ActionLink
              label={cta.label}
              destination={cta.destination}
              variant={ctaVariant}
              style={styles.cta}
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingVertical: 8,
    gap: 6,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
