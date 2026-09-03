import { CmsClient } from '../../api/cmsClient';
import { CmsError } from '../../api/transport';
import { extractPlainText } from '../../api/schemas/shared';
import { useMountedEffect } from '../../core/hooks/useMountedEffect';

export type LegalState =
  | { status: 'loading' }
  | { status: 'success'; title: string; summary?: string; body: string[] }
  | { status: 'error'; message: string; retryable: boolean }
  | { status: 'not-found' };

export function useLegalContent(
  client: CmsClient,
  key: string,
): { state: LegalState; refresh: () => void } {
  return useMountedEffect<LegalState>(
    async ({ signal, setState }) => {
      setState({ status: 'loading' });
      try {
        const raw = await client.getLegal(key, { signal });
        if (signal.aborted) {
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
        if (signal.aborted) {
          return;
        }
        if (error instanceof CmsError) {
          if (error.code === 'not-found') {
            setState({ status: 'not-found' });
            return;
          }
          setState({
            status: 'error',
            message: error.message,
            retryable: error.retryable,
          });
        } else {
          setState({
            status: 'error',
            message: 'No se pudo cargar el contenido',
            retryable: true,
          });
        }
      }
    },
    [client, key],
    { status: 'loading' },
  );
}
