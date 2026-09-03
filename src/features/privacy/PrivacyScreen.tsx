import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { CmsClient } from '../../api/cmsClient';
import { useLegalContent } from '../hooks/useLegalContent';
import { useTheme } from '../../ui/theme';
import { ThemedText } from '../../ui/components/Text';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../ui/components/StateViews';

interface PrivacyScreenProps {
  client: CmsClient;
}

export function PrivacyScreen({
  client,
}: PrivacyScreenProps): JSX.Element {
  const theme = useTheme();
  const { state, refresh } = useLegalContent(client, 'privacy_policy');

  if (state.status === 'loading') {
    return <LoadingState label="Cargando aviso de privacidad…" />;
  }

  if (state.status === 'error' || state.status === 'not-found') {
    return (
      <ErrorState
        title="No pudimos cargar el aviso de privacidad"
        message={
          state.status === 'not-found'
            ? 'Este documento no está disponible.'
            : state.message
        }
        onRetry={refresh}
        testID="legal-error"
      />
    );
  }

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: theme.colors.background }]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        { paddingHorizontal: theme.horizontalPadding },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={refresh}
          tintColor={theme.colors.accent}
        />
      }
      testID="privacy-screen">
      <ThemedText variant="heading">{state.title}</ThemedText>
      {state.summary ? (
        <ThemedText variant="eyebrow" color="accent" style={styles.summary}>
          {state.summary}
        </ThemedText>
      ) : null}
      {state.body.length === 0 ? (
        <EmptyState label="Este documento aún no tiene contenido." />
      ) : (
        state.body.map((paragraph, i) => (
          <ThemedText
            key={i}
            variant="body"
            color="muted"
            style={styles.paragraph}>
            {paragraph}
          </ThemedText>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingTop: 16,
    gap: 16,
  },
  summary: {
    marginTop: -8,
  },
  paragraph: {
    lineHeight: 24,
  },
});
