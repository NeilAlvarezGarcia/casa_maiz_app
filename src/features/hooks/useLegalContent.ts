import {useCallback, useEffect, useRef, useState} from 'react';
import {CmsClient} from '../../api/cmsClient';
import {CmsError} from '../../api/transport';
import {extractPlainText} from '../../api/schemas/shared';

export type LegalState =
  | {status: 'loading'}
  | {status: 'success'; title: string; summary?: string; body: string[]}
  | {status: 'error'; message: string; retryable: boolean}
  | {status: 'not-found'};

export function useLegalContent(
  client: CmsClient,
  key: string,
): {state: LegalState; refresh: () => void} {
  const [state, setState] = useState<LegalState>({status: 'loading'});
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();

    const load = async () => {
      setState({status: 'loading'});
      try {
        const raw = await client.getLegal(key, {signal: controller.signal});
        if (controller.signal.aborted) {
          return;
        }
        const data = (raw as any)?.data;
        const contentRoot = data?.content?.root;
        const paragraphs = Array.isArray(contentRoot?.children)
          ? contentRoot.children
              .map((node: any) => extractPlainText(node))
              .filter((t: string) => t.length > 0)
          : [];
        setState({
          status: 'success',
          title: data?.title ?? 'Aviso de privacidad',
          summary: data?.summary,
          body: paragraphs.length ? paragraphs : [],
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        if (error instanceof CmsError) {
          if (error.code === 'not-found') {
            setState({status: 'not-found'});
            return;
          }
          setState({status: 'error', message: error.message, retryable: error.retryable});
        } else {
          setState({status: 'error', message: 'No se pudo cargar el contenido', retryable: true});
        }
      }
    };

    load().catch(() => {});
    return () => {
      mounted.current = false;
      controller.abort();
    };
  }, [client, key, attempt]);

  const refresh = useCallback(() => setAttempt(n => n + 1), []);

  return {state, refresh};
}
