import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {PromoRailBlock} from '../../api/types';
import {ThemedText} from '../../ui/components/Text';
import {MediaImage} from '../../ui/components/MediaImage';
import {SectionHeader} from './SectionHeader';
import {ActionLink} from '../../ui/components/ActionLink';

interface PromoRailProps {
  block: PromoRailBlock;
}

export function PromoRail({block}: PromoRailProps): React.JSX.Element {
  const items = block.promotions as (typeof block.promotions)[number][];

  if (!items.length) {
    return <View testID="promoRail-empty" style={styles.hidden} />;
  }

  return (
    <View style={styles.section} testID="promoRail">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      {items.map((promo, i) => {
        const hasCta = promo.cta?.label;
        return (
          <View key={promo.id ?? `promo-${i}`} style={styles.card}>
            <MediaImage
              media={promo.mobileImage ?? promo.desktopImage}
              style={styles.cardImage}
              width="100%"
              aspectRatio={16 / 9}
            />
            <View style={styles.cardBody}>
              {promo.eyebrow ? (
                <ThemedText variant="eyebrow" color="accent">
                  {promo.eyebrow}
                </ThemedText>
              ) : null}
              {promo.title ? (
                <ThemedText variant="title">{promo.title}</ThemedText>
              ) : null}
              {promo.description ? (
                <ThemedText variant="body" color="muted">
                  {promo.description}
                </ThemedText>
              ) : null}
              {hasCta ? (
                <ActionLink
                  label={promo.cta?.label ?? ''}
                  destination={promo.cta?.destination ?? promo.cta?.href}
                  variant="primary"
                  style={styles.cta}
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    height: 0,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginBottom: 16,
  },
  cardImage: {
    borderRadius: 14,
  },
  cardBody: {
    paddingVertical: 8,
    gap: 6,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
