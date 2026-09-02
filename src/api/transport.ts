export type CmsErrorCode =
  | 'network'
  | 'http'
  | 'invalid-json'
  | 'invalid-response'
  | 'unsupported-contract'
  | 'not-found'
  | 'timeout';

export class CmsError extends Error {
  readonly code: CmsErrorCode;
  readonly status?: number;
  readonly retryable: boolean;

  constructor(code: CmsErrorCode, message: string, status?: number) {
    super(message);
    this.name = 'CmsError';
    this.code = code;
    this.status = status;
    this.retryable = code === 'network' || code === 'timeout' || (status !== undefined && status >= 500);
  }
}

const DEBUG_LOG_PREFIX = '[cms]';

function debugLog(...parts: unknown[]): void {
  if (__DEV__) {
    console.log(DEBUG_LOG_PREFIX, ...parts);
  }
}

export async function fetchJson(
  url: string,
  options: {signal?: AbortSignal; method?: string; body?: string} = {},
): Promise<unknown> {
  const {signal, method = 'GET', body} = options;

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), 15000);
  const onExternalAbort = () => controller.abort();
  signal?.addEventListener('abort', onExternalAbort);

  try {
    let response: Response;
    try {
      response = await fetch(url, {
        method,
        body,
        signal: controller.signal,
        headers:
          method === 'POST' || body
            ? {'Content-Type': 'application/json'}
            : undefined,
      });
    } catch (error) {
      const isAbort = controller.signal.aborted;
      if (isAbort && signal?.aborted) {
        throw error;
      }
      throw new CmsError(
        'network',
        error instanceof Error ? error.message : 'Network request failed',
      );
    }

    if (!response.ok) {
      let serverMessage: string | undefined;
      try {
        const payload = await response.json();
        serverMessage =
          typeof payload?.error === 'string'
            ? payload.error
            : Array.isArray(payload?.errors)
              ? payload.errors[0]?.message ?? undefined
              : undefined;
      } catch {
        serverMessage = undefined;
      }
      throw new CmsError(
        response.status === 404 ? 'not-found' : 'http',
        serverMessage ?? `Request failed with status ${response.status}`,
        response.status,
      );
    }

    let json: unknown;
    try {
      json = await response.json();
    } catch {
      throw new CmsError('invalid-json', 'Response body was not valid JSON');
    }

    debugLog('GET', url, '->', (json as Record<string, unknown>)?.contractVersion);
    return json;
  } finally {
    clearTimeout(timeoutHandle);
    signal?.removeEventListener('abort', onExternalAbort);
  }
}
