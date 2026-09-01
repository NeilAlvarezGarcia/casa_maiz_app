import React from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {BlockRenderer} from '../../blocks/BlockRenderer';
import {useTheme} from '../../ui/theme';
import {
  LoadingState,
  ErrorState,
  EmptyState,
} from '../../ui/components/StateViews';
import type {PageLoadState} from '../hooks/usePageData';
import type {LayoutBlock} from '../../api/types';

interface PageScreenProps {
  title?: string;
  state: PageLoadState;
  onRefresh?: () => void;
  refreshing?: boolean;
  /**
   * Optional banner content shown above the blocks (e.g. offline/stale notice,
   * operational notice). Kept out of the layout array because it is app-level
   * state, not CMS content.
   */
  banner?: React.ReactNode;
  testID?: string;
}

/**
 * Renders a CMS-driven screen for any page slug. All deliberate states are
 * handled here: loading, success (blocks), error + retry, empty, unsupported
 * contract, page-not-found, and pull-to-refresh.
 */
export function PageScreen({
  title,
  state,
  onRefresh,
  refreshing = false,
  banner,
  testID,
}: PageScreenProps): React.JSX.Element {
  const theme = useTheme();

  if (state.status === 'loading') {
    return <LoadingState label={title ? `Cargando ${title}…` : 'Cargando…'} />;
  }

  if (state.status === 'unsupported') {
    return (
      <ErrorState
        title="Contenido no compatible"
        message={state.message}
        onRetry={onRefresh}
        retryLabel="Reintentar"
        testID="unsupported-contract"
      />
    );
  }

  if (state.status === 'not-found') {
    return (
      <ErrorState
        title="Página no encontrada"
        message="Este contenido ya no está disponible."
        onRetry={onRefresh}
        testID="page-not-found"
      />
    );
  }

  if (state.status === 'error') {
    return (
      <ErrorState
        title="No pudimos cargar la página"
        message={
          state.retryable
            ? 'Revisa tu conexión e inténtalo de nuevo.'
            : state.message
        }
        onRetry={onRefresh}
        testID="page-error"
      />
    );
  }

  const layout = state.data.layout ?? [];

  return (
    <ScrollView
      testID={testID}
      style={[styles.scroll, {backgroundColor: theme.colors.background}]}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[
        styles.content,
        {paddingHorizontal: theme.horizontalPadding},
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
            colors={[theme.colors.accent]}
          />
        ) : undefined
      }
      >
      {banner ? <View style={styles.banner}>{banner}</View> : null}
      {layout.length === 0 ? (
        <EmptyState label="Esta página aún no tiene contenido." />
      ) : (
        layout.map((block, i) => (
          <BlockRenderer key={i} block={block as LayoutBlock & {blockType: string}} />
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
    paddingBottom: 32,
  },
  banner: {
    marginTop: 12,
  },
});
