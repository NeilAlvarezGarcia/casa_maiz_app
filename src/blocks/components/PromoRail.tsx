import { StyleSheet, View } from 'react-native';
import type { PromoRailBlock } from '../../api/types';
import { SectionHeader } from './SectionHeader';
import { ContentCard } from '../../ui/components/ContentCard';
import { HIDDEN_STYLE } from '../../ui/theme/blockStyles';

interface PromoRailProps {
  block: PromoRailBlock;
}

export function PromoRail({ block }: PromoRailProps): JSX.Element {
  const items = block.promotions as (typeof block.promotions)[number][];

  if (!items.length) {
    return <View testID="promoRail-empty" style={HIDDEN_STYLE} />;
  }

  return (
    <View style={styles.section} testID="promoRail">
      <SectionHeader eyebrow={block.eyebrow} title={block.title} />
      {items.map((promo, i) => (
        <ContentCard
          key={promo.id ?? `promo-${i}`}
          image={promo.mobileImage ?? promo.desktopImage}
          eyebrow={promo.eyebrow}
          title={promo.title}
          description={promo.description}
          cta={{
            label: promo.cta?.label,
            destination: promo.cta?.destination ?? promo.cta?.href,
          }}
          ctaVariant="primary"
          cardStyle={styles.card}
        />
      ))}
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
