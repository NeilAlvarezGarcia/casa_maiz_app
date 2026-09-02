import {CmsClient} from '../api/cmsClient';
import {asyncStorageAdapter} from '../cache/storage';
import {API_BASE_URL} from '../config';

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
