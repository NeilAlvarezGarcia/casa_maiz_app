import React from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { CardGridBlock } from '../../api/types';
import { useTheme } from '../../ui/theme';
import { SectionHeader } from './SectionHeader';
import { ContentCard } from '../../ui/components/ContentCard';
import { HIDDEN_STYLE } from '../../ui/theme/blockStyles';

interface CardGridProps {
  block: CardGridBlock;
}

export function CardGrid({ block }: CardGridProps): React.JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const columns = width >= 768 ? 2 : 2;
  const cardGap = theme.spacing.lg;
  const cardWidth = Math.max(
    140,
    Math.floor((width - theme.horizontalPadding * 2 - cardGap) / columns),
  );

  if (!block.cards.length) {
    return <View style={HIDDEN_STYLE} />;
  }

  return (
    <View style={styles.section} testID="cardGrid">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      <FlatList
        data={block.cards}
        key={`grid-${columns}`}
        numColumns={columns}
        renderItem={({ item }) => {
          const card = item as (typeof block.cards)[number];
          return (
            <ContentCard
              image={card.image}
              imageWidth={cardWidth}
              cardStyle={{ width: cardWidth }}
              eyebrow={card.eyebrow}
              eyebrowColor="muted"
              title={card.title}
              description={card.description}
              descriptionNumberOfLines={3}
              bodyGap={4}
            />
          );
        }}
        keyExtractor={(_, index) => String(index)}
        contentContainerStyle={styles.list}
        columnWrapperStyle={cardGap ? { gap: cardGap } : undefined}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  list: {
    paddingTop: 12,
    gap: 16,
  },
});
