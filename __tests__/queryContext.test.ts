/**
 * @format
 */

import {
  buildDeliveryQuery,
  deliveryQueryToSearchParams,
  getPlatform,
  normalizeVersion,
} from '../src/core/context/queryContext';

describe('delivery query context', () => {
  it('constructs the required delivery context for the CMS contract', () => {
    // The assessment requires platform, market, audience, and version on every
    // request. buildDeliveryQuery owns that from a single source of truth.
    const query = buildDeliveryQuery();
    expect(['ios', 'android']).toContain(query.platform);
    expect(query.market).toEqual('MX');
    expect(query.audience).toEqual('guest');
    expect(query.appVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('serializes every context field into query parameters', () => {
    const params = deliveryQueryToSearchParams({
      platform: 'ios',
      market: 'MX',
      audience: 'guest',
      appVersion: '1.2.3',
    });
    expect(params).toContain('platform=ios');
    expect(params).toContain('market=MX');
    expect(params).toContain('audience=guest');
    expect(params).toContain('appVersion=1.2.3');
  });

  describe('normalizeVersion', () => {
    it.each([
      ['1.2.3', '1.2.3'],
      ['v2.0.1', '2.0.1'],
      ['1.5', '1.5.0'],
      ['2', '2.0.0'],
      ['garbage', '1.0.0'],
    ])('normalizes "%s" -> "%s"', (raw, expected) => {
      expect(normalizeVersion(raw)).toBe(expected);
    });
  });

  describe('getPlatform', () => {
    it('returns only ios or android', () => {
      expect(['ios', 'android']).toContain(getPlatform());
    });
  });
});
