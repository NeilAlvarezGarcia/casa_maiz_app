import { useCallback, useEffect, useRef, useState } from 'react';
import { CmsClient } from '../../api/cmsClient';
import { CmsError } from '../../api/transport';
import type { PageData } from '../../api/types';

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
  const [state, setState] = useState<PageLoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);
  const abortRef = useRef<AbortController | null>(null);

  const notify = useCallback((next: PageLoadState) => {
    if (mounted.current) {
      setState(next);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    abortRef.current = controller;

    const load = async () => {
      notify({ status: 'loading' });
      try {
        const data = await client.getPage(slug, { signal: controller.signal });
        if (controller.signal.aborted) {
          return;
        }
        notify({ status: 'success', data, stale: false });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (error instanceof CmsError) {
          if (error.code === 'unsupported-contract') {
            notify({ status: 'unsupported', message: error.message });
            return;
          }
          if (error.code === 'not-found') {
            notify({ status: 'not-found' });
            return;
          }
        }

        try {
          const cached = await client.readCachedPage(slug);
          if (controller.signal.aborted) {
            return;
          }
          if (cached) {
            notify({
              status: 'success',
              data: cached.data,
              stale: cached.stale,
              staleReason: cached.reason,
            });
            return;
          }
        } catch {
          // fallback read failure is non-fatal
        }

        if (error instanceof CmsError) {
          notify({
            status: 'error',
            code: error.code,
            message: error.message,
            retryable: error.retryable,
          });
        } else {
          notify({
            status: 'error',
            code: 'invalid-response',
            message: 'No se pudo cargar el contenido',
            retryable: true,
          });
        }
      }
    };

    load().catch(() => {});
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [client, slug, attempt, notify]);

  const refresh = useCallback(() => {
    setAttempt(n => n + 1);
  }, []);

  return { state, refresh };
}
