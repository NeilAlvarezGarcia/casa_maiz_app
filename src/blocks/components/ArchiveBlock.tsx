import { FlatList, StyleSheet, View } from 'react-native';
import type { ArchiveBlock } from '../../api/types';
import { SectionHeader } from './SectionHeader';
import { ContentCard } from '../../ui/components/ContentCard';

interface ArchiveBlockProps {
  block: ArchiveBlock;
}

export function ArchiveBlock({ block }: ArchiveBlockProps): JSX.Element | null {
  const items = block.items ?? [];

  if (!items.length) {
    return null;
  }

  return (
    <View style={styles.section} testID="archive">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <ContentCard
            image={item.image}
            eyebrow={item.eyebrow}
            eyebrowColor="muted"
            title={item.title}
            description={item.description}
            descriptionNumberOfLines={4}
            cta={{
              label: item.cta?.label,
              destination: item.cta?.destination ?? item.cta?.href,
            }}
            cardStyle={styles.card}
          />
        )}
        keyExtractor={(_, index) => String(index)}
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
  card: {
    marginBottom: 16,
  },
});
