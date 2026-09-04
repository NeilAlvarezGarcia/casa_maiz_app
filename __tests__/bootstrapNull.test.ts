/**
 * @format
 *
 * Covers the "missing optional configuration must never make the application
 * unusable" requirement: the documented bootstrap fields (navigation,
 * experience, operationalControls) may be null, and a single null field must
 * not invalidate the whole bootstrap response.
 */
import {
  bootstrapResponseSchema,
  type BootstrapData,
} from '../src/api/schemas/bootstrap';

describe('bootstrap null/empty tolerance', () => {
  const base = { contractVersion: '1.1' };

  it.each([
    ['navigation:null', { navigation: null }],
    ['experience:null', { experience: null }],
    ['operationalControls:null', { operationalControls: null }],
    [
      'all optional fields null',
      { navigation: null, experience: null, operationalControls: null },
    ],
    ['all optional fields missing', {}],
  ])('%s parses successfully', (_name, data) => {
    const result = bootstrapResponseSchema.safeParse({ ...base, data });
    expect(result.success).toBe(true);
  });

  it('treats a null field value as absent rather than erroring', () => {
    const result = bootstrapResponseSchema.safeParse({
      ...base,
      data: { navigation: null },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data.data as BootstrapData | undefined;
      // null is safe for downstream consumers that use optional chaining:
      // navigation?.items never throws regardless of null or undefined.
      expect(data?.navigation == null).toBe(true);
    }
  });

  it('still validates the provided optional objects', () => {
    const result = bootstrapResponseSchema.safeParse({
      ...base,
      data: {
        navigation: { key: 'main', name: 'Main', items: [] },
        operationalControls: { mode: 'notice' },
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      const data = result.data.data as BootstrapData | undefined;
      expect(data?.navigation?.key).toBe('main');
      expect(data?.operationalControls?.mode).toBe('notice');
    }
  });
});
