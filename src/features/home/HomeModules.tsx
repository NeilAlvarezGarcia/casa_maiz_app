import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useBootstrap, useFeatureFlag } from '../../state/bootstrap';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import { ActionLink } from '../../ui/components/ActionLink';
import { ContentCard } from '../../ui/components/ContentCard';
import { SectionHeader } from '../../blocks/components/SectionHeader';
import type { BootstrapPromotion } from '../../api/schemas/bootstrap';

export function HomePromotions(): React.JSX.Element | null {
  const { data } = useBootstrap();
  const promotions = (data.promotions ?? [])
    .filter(promo => (promo.placement ?? 'home') === 'home')
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (!promotions.length) {
    return null;
  }

  return (
    <View testID="home-promotions" style={styles.section}>
      <SectionHeader eyebrow="Promociones" />
      {promotions.map((promo, i) => (
        <PromotionCard key={promo.id ?? `home-promo-${i}`} promo={promo} />
      ))}
    </View>
  );
}

function PromotionCard({
  promo,
}: {
  promo: BootstrapPromotion;
}): React.JSX.Element {
  return (
    <ContentCard
      image={promo.mobileImage ?? promo.desktopImage}
      eyebrow={promo.eyebrow}
      title={promo.title}
      description={promo.description}
      cta={{
        label: promo.cta?.label,
        destination: promo.cta?.destination,
      }}
      ctaVariant="outline"
    />
  );
}

export function FlaggedHomeModules(): React.JSX.Element | null {
  const { data } = useBootstrap();
  const showStoreLocator = useFeatureFlag('show_store_locator_banner');
  const showRewards = useFeatureFlag('show_rewards_module');

  const experienceLabels = new Map(
    (data.experience?.labels ?? []).map(label => [label.key, label.value]),
  );

  const reserveLabel = experienceLabels.get('reserve') ?? 'Reservar';
  const menuLabel = experienceLabels.get('menu') ?? 'Ver menú';

  if (!showStoreLocator && !showRewards) {
    return null;
  }

  return (
    <View style={styles.section}>
      {showStoreLocator ? (
        <FlagCard
          testID="flag-store-locator"
          title="Encuentra tu sucursal"
          description="Consulta la más cercana y el horario de cada casa."
          ctaLabel={reserveLabel}
          destination={{ path: '/reservas' }}
        />
      ) : null}
      {showRewards ? (
        <FlagCard
          testID="flag-rewards"
          title="Recompensas"
          description="Acumula puntos con cada visita y canjéalos en tu próxima orden."
          ctaLabel={menuLabel}
          destination={{ path: '/menu' }}
        />
      ) : null}
    </View>
  );
}

interface FlagCardProps {
  testID: string;
  title: string;
  description: string;
  ctaLabel: string;
  destination: { path: string };
}

function FlagCard({
  testID,
  title,
  description,
  ctaLabel,
  destination,
}: FlagCardProps): React.JSX.Element {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      style={[
        styles.flagCard,
        {
          backgroundColor: theme.colors.surfaceAlt,
          borderColor: theme.colors.border,
        },
      ]}>
      <ThemedText variant="title">{title}</ThemedText>
      <ThemedText variant="body" color="muted">
        {description}
      </ThemedText>
      <ActionLink
        label={ctaLabel}
        destination={destination}
        variant="outline"
        style={styles.flagCta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 10,
  },
  flagCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  flagCta: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
});
