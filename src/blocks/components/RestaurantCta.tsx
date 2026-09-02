import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {RestaurantCtaBlock} from '../../api/types';
import {useTheme} from '../../ui/theme';
import {ThemedText} from '../../ui/components/Text';
import {ActionLink} from '../../ui/components/ActionLink';

interface RestaurantCtaProps {
  block: RestaurantCtaBlock;
}

export function RestaurantCta({
  block,
}: RestaurantCtaProps): React.JSX.Element {
  const theme = useTheme();
  const emphasized = block.tone === 'tomato' || block.tone === 'accent';
  return (
    <View
      testID="restaurantCTA"
      style={[
        styles.container,
        {
          backgroundColor: emphasized
            ? theme.colors.accent
            : theme.colors.surfaceAlt,
        },
      ]}>
      {block.headline ? (
        <ThemedText
          variant="title"
          color={emphasized ? 'onAccent' : 'text'}
          style={styles.headline}>
          {block.headline}
        </ThemedText>
      ) : null}
      {block.description ? (
        <ThemedText
          variant="body"
          color={emphasized ? 'onAccent' : 'muted'}>
          {block.description}
        </ThemedText>
      ) : null}
      {block.label ? (
        <ActionLink
          label={block.label}
          destination={block.destination ?? block.href}
          variant={emphasized ? 'ghost' : 'primary'}
          onAccent={emphasized}
          style={styles.cta}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    padding: 24,
    gap: 8,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  headline: {
    alignSelf: 'flex-start',
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});
