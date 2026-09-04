import { CmsClient } from '../../api/cmsClient';
import { CmsError } from '../../api/transport';
import type { PageData } from '../../api/types';
import { useMountedEffect } from '../../core/hooks/useMountedEffect';

export type PageLoadState =
  | { status: 'loading' }
  | { status: 'success'; data: PageData; stale: boolean; staleReason?: string }
  | {
      status: 'error';
      code: CmsError['code'];
      message: string;
      retryable: boolean;
    }
  | { status: 'unsupported'; message: string }
  | { status: 'not-found' };

export function usePageData(
  client: CmsClient,
  slug: string,
): {
  state: PageLoadState;
  refresh: () => void;
} {
  return useMountedEffect<PageLoadState>(
    async ({ signal, setState }) => {
      let showedCached = false;
      const cached = await client.readCachedPage(slug);
      if (signal.aborted) {
        return;
      }
      if (cached) {
        showedCached = true;
        setState({
          status: 'success',
          data: cached.data,
          stale: cached.stale,
          staleReason: cached.reason,
        });
      } else {
        setState({ status: 'loading' });
      }

      try {
        const fresh = await client.getPage(slug, { force: true, signal });
        if (signal.aborted) {
          return;
        }
        setState({ status: 'success', data: fresh, stale: false });
      } catch (error) {
        if (signal.aborted) {
          return;
        }
        if (error instanceof CmsError) {
          if (error.code === 'unsupported-contract') {
            setState({ status: 'unsupported', message: error.message });
            return;
          }
          if (error.code === 'not-found') {
            if (!showedCached) {
              setState({ status: 'not-found' });
            }
            return;
          }
        }

        if (showedCached) {
          setState({
            status: 'success',
            data: cached!.data,
            stale: true,
            staleReason: 'offline-fallback',
          });
        } else if (error instanceof CmsError) {
          setState({
            status: 'error',
            code: error.code,
            message: error.message,
            retryable: error.retryable,
          });
        } else {
          setState({
            status: 'error',
            code: 'invalid-response',
            message: 'No se pudo cargar el contenido',
            retryable: true,
          });
        }
      }
    },
    [client, slug],
    { status: 'loading' },
  );
}
