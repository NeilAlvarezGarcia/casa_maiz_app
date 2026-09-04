/**
 * @format
 *
 * Required: query-context construction. Every CMS request must carry
 * platform, market, audience, and version from a single source of truth.
 */
import { buildDeliveryQuery } from '../src/core/context/queryContext';

describe('delivery query context', () => {
  it('constructs the required delivery context for the CMS contract', () => {
    const query = buildDeliveryQuery();
    expect(['ios', 'android']).toContain(query.platform);
    expect(query.market).toEqual('MX');
    expect(query.audience).toEqual('guest');
    expect(query.appVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
