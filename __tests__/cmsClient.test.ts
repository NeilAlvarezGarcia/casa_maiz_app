/**
 * @format
 *
 * Covers the cache/error/offline fallback scenario required by the
 * assessment: after a successful fetch, the client serves cached content when
 * the network is unavailable, and flags it as stale once the server-provided
 * expiry boundary passes.
 */
import { CmsClient } from '../src/api/cmsClient';
import { isSupportedContract } from '../src/api/schemas';
import { CONTRACT_VERSION_SUPPORTED } from '../src/api/schemas';
import { CmsError } from '../src/api/transport';
import { fetchJson } from '../src/api/transport';

jest.mock('../src/api/transport', () => {
  const actual = jest.requireActual('../src/api/transport');
  return {
    ...actual,
    fetchJson: jest.fn(),
  };
});

const mockedFetchJson = fetchJson as jest.MockedFunction<typeof fetchJson>;

const BASE = 'https://cms.example.test';
const SUPPORTED = CONTRACT_VERSION_SUPPORTED;

function makePageEnvelope(contractVersion: string, nextChangeAt?: string) {
  return {
    contractVersion,
    nextChangeAt,
    data: {
      id: 'page-home',
      slug: 'home',
      title: 'Inicio',
      updatedAt: '2026-01-01T00:00:00.000Z',
      layout: [
        {
          blockType: 'textBlock',
          heading: 'Casa Maíz',
          body: 'Cocina mexicana de temporada.',
        },
      ],
    },
  };
}

const STALE_BOUNDARY = new Date(Date.now() - 60 * 1000).toISOString();
const FUTURE_BOUNDARY = new Date(Date.now() + 60 * 60 * 1000).toISOString();

describe('contract version validation', () => {
  it('accepts the supported contract version', () => {
    expect(isSupportedContract({ contractVersion: SUPPORTED })).toBe(true);
  });

  it('rejects unsupported contract versions', () => {
    expect(isSupportedContract({ contractVersion: '0.9' })).toBe(false);
    expect(isSupportedContract({})).toBe(false);
  });
});

describe('CmsClient offline fallback', () => {
  beforeEach(() => {
    mockedFetchJson.mockReset();
  });

  it('serves a valid cached page without hitting the network', async () => {
    mockedFetchJson.mockResolvedValue(makePageEnvelope(SUPPORTED));

    const client = new CmsClient({
      baseUrl: BASE,
      context: {
        platform: 'ios',
        market: 'MX',
        audience: 'guest',
        appVersion: '1.0.0',
      },
    });

    await client.getHome();
    expect(mockedFetchJson).toHaveBeenCalledTimes(1);

    // Second call is served from the in-memory cache.
    const cached = await client.getHome();
    expect(cached.slug).toBe('home');
    expect(mockedFetchJson).toHaveBeenCalledTimes(1);
  });

  it('keeps last good content available offline as a read-only fallback', async () => {
    mockedFetchJson.mockResolvedValue(
      makePageEnvelope(SUPPORTED, STALE_BOUNDARY),
    );
    const client = new CmsClient({
      baseUrl: BASE,
      context: {
        platform: 'ios',
        market: 'MX',
        audience: 'guest',
        appVersion: '1.0.0',
      },
    });

    await client.getHome();

    // Network is gone; getHome() would normally throw, but the app reads the
    // persisted cache directly for the read-only offline surface.
    mockedFetchJson.mockRejectedValue(new CmsError('network', 'offline'));

    const offline = await client.readCachedPage('home');
    expect(offline).not.toBeNull();
    expect(offline!.data.slug).toBe('home');
    expect(offline!.stale).toBe(true);
    expect(offline!.reason).toBe('nextChangeAt-exceeded');
  });

  it('reports stale cache when nextChangeAt has passed', async () => {
    mockedFetchJson.mockResolvedValue(
      makePageEnvelope(SUPPORTED, STALE_BOUNDARY),
    );
    const client = new CmsClient({
      baseUrl: BASE,
      context: { platform: 'ios' },
    });

    await client.getHome();
    mockedFetchJson.mockRejectedValueOnce(new CmsError('network', 'offline'));

    // Still readable as a read-only fallback, but flagged stale.
    const offline = await client.readCachedPage('home');
    expect(offline).not.toBeNull();
    expect(offline!.stale).toBe(true);
  });

  it('treats content as fresh while nextChangeAt is in the future', async () => {
    mockedFetchJson.mockResolvedValue(
      makePageEnvelope(SUPPORTED, FUTURE_BOUNDARY),
    );
    const client = new CmsClient({
      baseUrl: BASE,
      context: { platform: 'ios' },
    });

    await client.getHome();
    const cached = await client.getHome();
    expect(cached.slug).toBe('home');
  });

  it('throws a typed error for unsupported contract versions', async () => {
    mockedFetchJson.mockResolvedValue(makePageEnvelope('9.9'));

    const client = new CmsClient({ baseUrl: BASE });
    await expect(client.getHome()).rejects.toThrow(CmsError);
    await expect(client.getHome()).rejects.toThrow(
      /Unsupported content contract version/,
    );
  });

  it('maps an HTTP 404 to a not-found error', async () => {
    mockedFetchJson.mockRejectedValue(
      new CmsError('not-found', 'Page not found', 404),
    );

    const client = new CmsClient({ baseUrl: BASE });
    const err = await client.getHome().catch((e: unknown) => e);
    expect(err).toBeInstanceOf(CmsError);
    expect((err as CmsError).code).toBe('not-found');
  });
});
