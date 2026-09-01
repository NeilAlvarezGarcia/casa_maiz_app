import React from 'react';
import {FlatList, StyleSheet, useWindowDimensions, View} from 'react-native';
import type {CardGridBlock} from '../../api/types';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';
import {MediaImage} from '../../ui/components/MediaImage';
import {SectionHeader} from './SectionHeader';

interface CardGridProps {
  block: CardGridBlock;
}

export function CardGrid({block}: CardGridProps): React.JSX.Element {
  const theme = useTheme();
  const {width} = useWindowDimensions();
  const columns = width >= 768 ? 2 : 2;
  const cardGap = theme.spacing.lg;
  const cardWidth = Math.max(140, Math.floor((width - theme.horizontalPadding * 2 - cardGap) / columns));

  if (!block.cards.length) {
    return <View style={styles.hidden} />;
  }

  return (
    <View style={styles.section} testID="cardGrid">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      <FlatList
        data={block.cards}
        key={`grid-${columns}`}
        numColumns={columns}
        renderItem={({item}) => {
          const card = item as (typeof block.cards)[number];
          return (
            <View style={[styles.card, {width: cardWidth}]}>
              <MediaImage media={card.image} style={styles.cardImage} width={cardWidth} />
              <View style={styles.cardBody}>
                {card.eyebrow ? (
                  <ThemedText variant="eyebrow" color="muted">
                    {card.eyebrow}
                  </ThemedText>
                ) : null}
                {card.title ? (
                  <ThemedText variant="title">{card.title}</ThemedText>
                ) : null}
                {card.description ? (
                  <ThemedText variant="body" color="muted" numberOfLines={3}>
                    {card.description}
                  </ThemedText>
                ) : null}
              </View>
            </View>
          );
        }}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        columnWrapperStyle={cardGap ? {gap: cardGap} : undefined}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
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
  list: {
    paddingTop: 12,
    gap: 16,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 14,
  },
  cardBody: {
    paddingVertical: 8,
    gap: 4,
  },
});
