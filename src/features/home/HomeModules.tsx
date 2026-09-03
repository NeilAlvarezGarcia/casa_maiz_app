import { StyleSheet, View } from 'react-native';
import { useBootstrap, useFeatureFlag } from '../../state/bootstrap';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import { ActionLink } from '../../ui/components/ActionLink';
import { ContentCard } from '../../ui/components/ContentCard';
import { SectionHeader } from '../../blocks/components/SectionHeader';
import { pathForRoute, RouteNames } from '../../navigation/destinationResolver';
import {
  experienceLabelKeys,
  type BootstrapPromotion,
  type ExperienceLabelKey,
} from '../../api/schemas/bootstrap';

function useExperienceLabels(): Map<ExperienceLabelKey, string> {
  const { data } = useBootstrap();
  const labels = (data.experience?.labels ?? []).filter(
    (label): label is { key: ExperienceLabelKey; value: string } =>
      experienceLabelKeys.includes(label.key as ExperienceLabelKey),
  );
  return new Map(labels.map(label => [label.key, label.value]));
}

export function HomePromotions(): JSX.Element | null {
  const { data } = useBootstrap();
  const labels = useExperienceLabels();
  const promotions = data.promotions?.filter(promo => promo.placement === 'home')
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  if (!promotions?.length) {
    return null;
  }

  return (
    <View testID="home-promotions" style={styles.section}>
      <SectionHeader eyebrow={labels.get('promotions_title')} />
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
}): JSX.Element {
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

export function FlaggedHomeModules(): JSX.Element | null {
  const showStoreLocator = useFeatureFlag('show_store_locator_banner');
  const showRewards = useFeatureFlag('show_rewards_module');
  const labels = useExperienceLabels();

  const storeLocator =
    showStoreLocator &&
    labels.has('store_locator_title') &&
    labels.has('store_locator_description') &&
    labels.has('reserve');

  const rewards =
    showRewards &&
    labels.has('rewards_title') &&
    labels.has('rewards_description') &&
    labels.has('order');

  if (!storeLocator && !rewards) {
    return null;
  }

  return (
    <View style={styles.section}>
      {storeLocator ? (
        <FlagCard
          testID="flag-store-locator"
          title={labels.get('store_locator_title')!}
          description={labels.get('store_locator_description')!}
          ctaLabel={labels.get('reserve')!}
          destination={{ path: pathForRoute(RouteNames.Reservations) }}
        />
      ) : null}
      {rewards ? (
        <FlagCard
          testID="flag-rewards"
          title={labels.get('rewards_title')!}
          description={labels.get('rewards_description')!}
          ctaLabel={labels.get('order')!}
          destination={{ path: pathForRoute(RouteNames.Menu) }}
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
}: FlagCardProps): JSX.Element {
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
