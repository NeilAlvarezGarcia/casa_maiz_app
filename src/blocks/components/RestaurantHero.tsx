import { StyleSheet, View } from 'react-native';
import type { RestaurantHeroBlock } from '../../api/types';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import { MediaImage } from '../../ui/components/MediaImage';
import { ActionLink } from '../../ui/components/ActionLink';

interface RestaurantHeroProps {
  block: RestaurantHeroBlock;
}

export function RestaurantHero({
  block,
}: RestaurantHeroProps): JSX.Element {
  const theme = useTheme();
  return (
    <View style={styles.container} testID="restaurantHero">
      <MediaImage
        media={block.image}
        style={styles.image}
        width="100%"
        aspectRatio={4 / 3}
      />
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        {block.eyebrow ? (
          <ThemedText
            variant="eyebrow"
            color="onAccent"
            style={{ color: theme.colors.heroEyebrow }}>
            {block.eyebrow}
          </ThemedText>
        ) : null}
        {block.headline ? (
          <ThemedText variant="heading" color="onAccent">
            {block.headline}
          </ThemedText>
        ) : null}
        {block.description ? (
          <ThemedText variant="body" color="onAccent">
            {block.description}
          </ThemedText>
        ) : null}
        {block.actions?.length ? (
          <View style={styles.actions}>
            {block.actions.slice(0, 2).map((action, i) => (
              <ActionLink
                key={i}
                label={action.label ?? ''}
                destination={action.destination ?? action.href}
                variant={i === 0 ? 'primary' : 'outline'}
                onAccent
              />
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 14,
  },
  image: {},
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 56,
    justifyContent: 'flex-end',
    gap: 8,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
});
