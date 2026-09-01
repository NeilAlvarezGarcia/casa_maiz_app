import {CmsClient} from '../api/cmsClient';
import {asyncStorageAdapter} from '../cache/storage';
import {API_BASE_URL} from '../config';

/**
 * App-wide CMS client. Constructed once, backed by persisted AsyncStorage so
 * the last successful response survives restarts and serves as the offline
 * fallback. Screens receive it via props/context rather than importing this
 * singleton directly, which keeps them testable.
 */
let client: CmsClient | null = null;

export function getCmsClient(): CmsClient {
  if (!client) {
    client = new CmsClient({
      baseUrl: API_BASE_URL,
      storage: asyncStorageAdapter,
    });
  }
  return client;
}

export function createTestCmsClient(): CmsClient {
  return new CmsClient({
    baseUrl: API_BASE_URL,
    context: {platform: 'android'},
  });
}
