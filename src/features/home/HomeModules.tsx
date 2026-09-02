import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useBootstrap, useFeatureFlag} from '../../state/bootstrap';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';
import {MediaImage} from '../../ui/components/MediaImage';
import {ActionLink} from '../../ui/components/ActionLink';
import {SectionHeader} from '../../blocks/components/SectionHeader';
import type {BootstrapPromotion} from '../../api/schemas/bootstrap';

export function HomePromotions(): React.JSX.Element | null {
  const {data} = useBootstrap();
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

function PromotionCard({promo}: {promo: BootstrapPromotion}): React.JSX.Element {
  return (
    <View style={styles.card}>
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
        {promo.cta?.label ? (
          <ActionLink
            label={promo.cta.label}
            destination={promo.cta.destination}
            variant="outline"
            style={styles.cta}
          />
        ) : null}
      </View>
    </View>
  );
}

export function FlaggedHomeModules(): React.JSX.Element | null {
  const theme = useTheme();
  const {data} = useBootstrap();
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

  const flagCardStyle = [
    styles.flagCard,
    {
      backgroundColor: theme.colors.surfaceAlt,
      borderColor: theme.colors.border,
    },
  ];

  return (
    <View style={styles.section}>
      {showStoreLocator ? (
        <View
          testID="flag-store-locator"
          accessibilityRole="alert"
          style={flagCardStyle}>
          <ThemedText variant="title">Encuentra tu sucursal</ThemedText>
          <ThemedText variant="body" color="muted">
            Consulta la más cercana y el horario de cada casa.
          </ThemedText>
          <ActionLink
            label={reserveLabel}
            destination={{path: '/reservas'}}
            variant="outline"
            style={styles.flagCta}
          />
        </View>
      ) : null}
      {showRewards ? (
        <View
          testID="flag-rewards"
          accessibilityRole="alert"
          style={flagCardStyle}>
          <ThemedText variant="title">Recompensas</ThemedText>
          <ThemedText variant="body" color="muted">
            Acumula puntos con cada visita y canjéalos en tu próxima orden.
          </ThemedText>
          <ActionLink
            label={menuLabel}
            destination={{path: '/menu'}}
            variant="outline"
            style={styles.flagCta}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
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
