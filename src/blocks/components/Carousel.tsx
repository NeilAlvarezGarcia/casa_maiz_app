import React, {useRef, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type {CarouselBlock} from '../../api/types';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';
import {MediaImage} from '../../ui/components/MediaImage';
import {SectionHeader} from './SectionHeader';
import {ActionLink} from '../../ui/components/ActionLink';

const RAIL_ITEM_WIDTH = 280;

interface CarouselProps {
  block: CarouselBlock;
}

export function Carousel({block}: CarouselProps): React.JSX.Element {
  const theme = useTheme();
  const {width} = useWindowDimensions();
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList>(null);
  const items = block.slides as (typeof block.slides)[number][];

  if (!items.length) {
    return <View testID="carousel-empty" style={styles.hidden} />;
  }

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / RAIL_ITEM_WIDTH);
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
        renderItem={({item}) => {
          const slide = item as (typeof block.slides)[number];
          const hasAction = slide.cta?.label && (slide.cta?.destination || slide.cta?.href);
          return (
            <View style={[styles.slide, {width: Math.min(RAIL_ITEM_WIDTH, width - 40)}]}>
              <MediaImage
                media={slide.image}
                style={styles.slideImage}
                width={Math.min(RAIL_ITEM_WIDTH, width - 40)}
                aspectRatio={16 / 9}
              />
              <View style={styles.slideBody}>
                <ThemedText variant="title">{slide.title ?? ''}</ThemedText>
                <ThemedText variant="body" color="muted" numberOfLines={3}>
                  {slide.description ?? ''}
                </ThemedText>
                {hasAction ? (
                  <ActionLink
                    label={slide.cta?.label ?? ''}
                    destination={slide.cta?.destination ?? slide.cta?.href}
                    variant="outline"
                    style={styles.slideCta}
                  />
                ) : null}
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => String(index)}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={Math.min(RAIL_ITEM_WIDTH, width - 40)}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.railContent}
      />
      {items.length > 1 ? (
        <View style={styles.dots} accessibilityRole="adjustable" accessibilityLabel="Carrusel">
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
  hidden: {
    height: 0,
  },
  section: {
    marginBottom: 20,
  },
  railContent: {
    paddingRight: 24,
    paddingTop: 12,
  },
  slide: {
    marginRight: 12,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  slideImage: {
    borderRadius: 14,
  },
  slideBody: {
    paddingVertical: 8,
    gap: 6,
  },
  slideCta: {
    alignSelf: 'flex-start',
    marginTop: 4,
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
