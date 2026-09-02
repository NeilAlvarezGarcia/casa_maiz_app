import { API_BASE_URL } from '../config';
import {
  buildDeliveryQuery,
  deliveryQueryToSearchParams,
  type DeliveryQuery,
} from '../core/context/queryContext';
import { fetchJson, CmsError } from './transport';
import {
  pageResponseSchema,
  isSupportedContract,
  CONTRACT_VERSION_SUPPORTED,
} from './schemas';
import type { PageData } from './types';
import { ContentCache, type StorageAdapter } from '../cache/contentCache';

export interface CmsClientOptions {
  baseUrl?: string;
  context?: Partial<DeliveryQuery>;
  storage?: StorageAdapter;
}

export interface FetchOptions {
  signal?: AbortSignal;
  force?: boolean;
}

export function resolveMediaUrl(
  rawUrl: string | undefined,
  baseUrl: string = API_BASE_URL,
): string | undefined {
  if (!rawUrl) {
    return undefined;
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  const trimmedBase = baseUrl.replace(/\/+$/, '');
  if (rawUrl.startsWith('/')) {
    return `${trimmedBase}${rawUrl}`;
  }

  if (rawUrl.startsWith('media/')) {
    return `${trimmedBase}/api/${rawUrl}`;
  }
  return `${trimmedBase}/${rawUrl}`;
}

export function preferredMediaUrl(
  media: { url?: string; sizes?: Record<string, { url?: string }> } | undefined,
  baseUrl: string = API_BASE_URL,
): string | undefined {
  if (!media) {
    return undefined;
  }
  const preferred =
    media.sizes?.medium?.url ?? media.sizes?.small?.url ?? media.url;
  return resolveMediaUrl(preferred, baseUrl);
}

export class CmsClient {
  readonly baseUrl: string;
  readonly context: DeliveryQuery;
  private readonly cache: ContentCache;

  constructor(options: CmsClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? API_BASE_URL).replace(/\/+$/, '');
    this.context = {
      ...buildDeliveryQuery(),
      ...options.context,
    };
    this.cache = new ContentCache({ storage: options.storage });
  }

  private endpoint(path: string): string {
    return `${this.baseUrl}/api/content/v1/${path}`;
  }

  private withContext(path: string): string {
    const params = deliveryQueryToSearchParams(this.context);
    return `${this.endpoint(path)}?${params}`;
  }

  private async fetchPage(
    slug: string,
    options: FetchOptions = {},
  ): Promise<PageData> {
    const key = `page:${slug}`;

    if (!options.force) {
      const cached = await this.cache.getValid(key);
      if (cached.entry) {
        return cached.entry.data as PageData;
      }
    }

    const url = this.withContext(`pages/${slug}`);
    const raw = await fetchJson(url, { signal: options.signal });

    const parsed = pageResponseSchema.safeParse(raw);
    if (!parsed.success) {
      throw new CmsError(
        'invalid-response',
        `Malformed page response for "${slug}"`,
      );
    }

    const envelope = parsed.data;
    if (!isSupportedContract(envelope)) {
      throw new CmsError(
        'unsupported-contract',
        `Unsupported content contract version "${
          envelope.contractVersion ?? 'unknown'
        }" (expected ${CONTRACT_VERSION_SUPPORTED})`,
      );
    }
    if (!envelope.data) {
      throw new CmsError('invalid-response', `Empty page data for "${slug}"`);
    }

    const pageData = envelope.data as PageData;
    await this.cache.set(key, {
      data: pageData,
      nextChangeAt: envelope.nextChangeAt,
      contractVersion: envelope.contractVersion,
      fetchedAt: new Date().toISOString(),
    });
    return pageData;
  }

  getHome(options?: FetchOptions): Promise<PageData> {
    return this.fetchPage('home', options);
  }

  getMenu(options?: FetchOptions): Promise<PageData> {
    return this.fetchPage('menu', options);
  }

  getPage(slug: string, options?: FetchOptions): Promise<PageData> {
    return this.fetchPage(slug, options);
  }

  async readCachedPage(slug: string): Promise<{
    data: PageData;
    stale: boolean;
    reason?: string;
  } | null> {
    const read = await this.cache.get(`page:${slug}`);
    if (!read.entry) {
      return null;
    }
    return {
      data: read.entry.data as PageData,
      stale: read.stale,
      reason: read.reason,
    };
  }

  async getBootstrap(options?: FetchOptions): Promise<unknown> {
    const key = 'bootstrap';
    if (!options?.force) {
      const cached = await this.cache.getValid(key);
      if (cached.entry) {
        return cached.entry.data;
      }
    }
    const raw = await fetchJson(this.withContext('bootstrap'), {
      signal: options?.signal,
    });
    await this.cache.set(key, {
      data: raw,
      fetchedAt: new Date().toISOString(),
    });
    return raw;
  }

  async getLegal(key: string, options?: FetchOptions): Promise<unknown> {
    const cacheKey = `legal:${key}`;
    if (!options?.force) {
      const cached = await this.cache.getValid(cacheKey);
      if (cached.entry) {
        return cached.entry.data;
      }
    }
    const raw = await fetchJson(this.withContext(`legal/${key}`), {
      signal: options?.signal,
    });
    await this.cache.set(cacheKey, {
      data: raw,
      fetchedAt: new Date().toISOString(),
    });
    return raw;
  }
}
