/**
 * @format
 *
 * Regression coverage for the offline/stale resilience behavior: when a fetch
 * fails but a (possibly fresh) cache entry exists, the app must serve it while
 * flagging it as offline/stale so the user sees a warning and a retry — never
 * silently showing cached content without any indication they are offline.
 */
import {
  renderHook,
  waitFor,
} from '@testing-library/react-native';
import { usePageData } from '../src/features/hooks/usePageData';
import { CmsError } from '../src/api/transport';
import type { CmsClient } from '../src/api/cmsClient';

const CACHED_DATA = {
  slug: 'home',
  layout: [],
} as any;

function makeClient(overrides: Partial<CmsClient>): CmsClient {
  return {
    getPage: jest.fn().mockRejectedValue(new Error('network down')),
    readCachedPage: jest.fn().mockResolvedValue({
      data: CACHED_DATA,
      stale: false,
      reason: undefined,
    }),
    ...overrides,
  } as unknown as CmsClient;
}

describe('usePageData offline/stale fallback', () => {
  it('serves cached content and flags it stale after a network error', async () => {
    const getPage = jest.fn().mockRejectedValue(new Error('network down'));
    const client = makeClient({ getPage: getPage as any });
    const { result } = renderHook(() => usePageData(client, 'home'));

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    // The hook must force a real network fetch, otherwise a fresh cache entry
    // masks the outage and offline is never detected.
    expect(getPage).toHaveBeenCalledWith(
      'home',
      expect.objectContaining({ force: true }),
    );

    const state = result.current.state;
    expect(state.status).toBe('success');
    if (state.status === 'success') {
      expect(state.data).toEqual(CACHED_DATA);
      // Fresh cache must still surface the offline warning via stale:true,
      // otherwise the user sees saved content with no offline indicator.
      expect(state.stale).toBe(true);
      expect(state.staleReason).toBe('offline-fallback');
    }
  });

  it('serves cached content immediately, before the network resolves', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const getPage = jest.fn().mockReturnValue(
      new Promise(resolve => {
        resolveFetch = resolve;
      }),
    );
    const client = makeClient({ getPage: getPage as any });
    const { result } = renderHook(() => usePageData(client, 'home'));

    // Cached content should surface while the network request is still pending.
    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    expect(result.current.state).toMatchObject({
      status: 'success',
      stale: false,
    });

    // Resolve the pending fetch and confirm it is no longer flagged stale.
    resolveFetch({ slug: 'home', layout: [{ blockType: 'text', text: 'hi' }] });
    await waitFor(() => {
      const s = result.current.state;
      expect(s.status === 'success' && s.stale).toBe(false);
    });
  });

  it('exposes refresh so offline content can be retried', async () => {
    const client = makeClient({});
    const { result } = renderHook(() => usePageData(client, 'home'));

    await waitFor(() => {
      expect(result.current.state.status).toBe('success');
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('reports not-found as its own state', async () => {
    const notFoundClient = {
      getPage: jest
        .fn()
        .mockRejectedValue(new CmsError('not-found', 'missing')),
      readCachedPage: jest.fn().mockResolvedValue(null),
    };
    const { result } = renderHook(() =>
      usePageData(notFoundClient as unknown as CmsClient, 'unknown'),
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('not-found');
    });
  });
});
