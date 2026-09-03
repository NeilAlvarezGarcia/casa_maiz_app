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
  _options: { preferCacheFirst?: boolean } = {},
): {
  state: PageLoadState;
  refresh: () => void;
} {
  return useMountedEffect<PageLoadState>(
    async ({ signal, setState }) => {
      setState({ status: 'loading' });
      try {
        const data = await client.getPage(slug, { signal });
        if (signal.aborted) {
          return;
        }
        setState({ status: 'success', data, stale: false });
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
            setState({ status: 'not-found' });
            return;
          }
        }

        const cached = await client.readCachedPage(slug);
        if (signal.aborted) {
          return;
        }
        if (cached) {
          setState({
            status: 'success',
            data: cached.data,
            stale: cached.stale,
            staleReason: cached.reason,
          });
          return;
        }

        if (error instanceof CmsError) {
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
