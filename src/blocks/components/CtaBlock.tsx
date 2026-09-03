import { StyleSheet, View } from 'react-native';
import type { CtaBlock } from '../../api/types';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import { ActionLink } from '../../ui/components/ActionLink';

interface CtaBlockProps {
  block: CtaBlock;
}

export function CtaBlock({ block }: CtaBlockProps): JSX.Element | null {
  const theme = useTheme();
  const emphasized = block.tone === 'tomato' || block.tone === 'accent';
  const centered = block.align === 'center';

  const hasContent =
    block.headline || block.description || block.label || block.eyebrow;

  if (!hasContent) {
    return null;
  }

  return (
    <View
      testID="cta"
      style={[
        styles.container,
        centered && styles.centered,
        {
          backgroundColor: emphasized
            ? theme.colors.accent
            : theme.colors.surfaceAlt,
        },
      ]}>
      {block.eyebrow ? (
        <ThemedText
          variant="eyebrow"
          color={emphasized ? 'onAccent' : 'accent'}>
          {block.eyebrow}
        </ThemedText>
      ) : null}
      {block.headline ? (
        <ThemedText
          variant="title"
          color={emphasized ? 'onAccent' : 'text'}>
          {block.headline}
        </ThemedText>
      ) : null}
      {block.description ? (
        <ThemedText
          variant="body"
          color={emphasized ? 'onAccent' : 'muted'}
          style={centered ? styles.centeredText : undefined}>
          {block.description}
        </ThemedText>
      ) : null}
      {block.label ? (
        <ActionLink
          label={block.label}
          destination={block.destination ?? block.href}
          variant={emphasized ? 'ghost' : 'primary'}
          onAccent={emphasized}
          style={[styles.cta, centered ? styles.centeredCta : undefined]}
          testID="cta-action"
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
  centered: {
    alignItems: 'center',
  },
  centeredText: {
    textAlign: 'center',
  },
  centeredCta: {
    alignSelf: 'center',
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});
