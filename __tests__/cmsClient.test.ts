/**
 * @format
 *
 * Required coverage:
 *  - Contract-version validation: supported version accepted, unsupported
 *    rejected.
 *  - One cache/offline fallback scenario: after a successful fetch, the
 *    client serves cached content when the network is unavailable.
 */
import { CmsClient } from '../src/api/cmsClient';
import { isSupportedContract } from '../src/api/schemas';
import { CONTRACT_VERSION_SUPPORTED } from '../src/api/schemas';
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

function makePageEnvelope(contractVersion: string) {
  return {
    contractVersion,
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

    const cached = await client.getHome();
    expect(cached.slug).toBe('home');
    expect(mockedFetchJson).toHaveBeenCalledTimes(1);
  });
});
