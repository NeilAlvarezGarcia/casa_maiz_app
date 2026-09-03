import { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { CarouselBlock } from '../../api/types';
import { useTheme } from '../../ui/theme';
import { SectionHeader } from './SectionHeader';
import { ContentCard } from '../../ui/components/ContentCard';
import { HIDDEN_STYLE } from '../../ui/theme/blockStyles';

const RAIL_ITEM_WIDTH = 280;

interface CarouselProps {
  block: CarouselBlock;
}

export function Carousel({ block }: CarouselProps): JSX.Element {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);
  const items = block.slides as (typeof block.slides)[number][];
  const itemWidth = Math.min(RAIL_ITEM_WIDTH, width - 40);

  if (!items.length) {
    return <View testID="carousel-empty" style={HIDDEN_STYLE} />;
  }

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / RAIL_ITEM_WIDTH,
    );
    if (index !== active) {
      setActive(Math.max(0, Math.min(index, items.length - 1)));
    }
  };

  return (
    <View style={styles.section} testID="carousel">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      <FlatList
        ref={listRef}
        data={items as unknown[]}
        renderItem={({ item }) => {
          const slide = item as (typeof block.slides)[number];
          const hasAction =
            slide.cta?.label && !!(slide.cta?.destination || slide.cta?.href);
          return (
            <ContentCard
              image={slide.image}
              imageWidth={itemWidth}
              cardStyle={styles.slide}
              title={slide.title}
              description={slide.description}
              descriptionNumberOfLines={3}
              cta={
                hasAction
                  ? {
                      label: slide.cta?.label,
                      destination: slide.cta?.destination ?? slide.cta?.href,
                    }
                  : undefined
              }
            />
          );
        }}
        keyExtractor={(item, index) => String(index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={itemWidth}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.railContent}
      />
      {items.length > 1 ? (
        <View
          style={styles.dots}
          accessibilityRole="adjustable"
          accessibilityLabel="Carrusel">
          {items.map((item, i) => (
            <View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === active ? theme.colors.accent : theme.colors.border,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  railContent: {
    paddingRight: 24,
    paddingTop: 12,
  },
  slide: {
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
