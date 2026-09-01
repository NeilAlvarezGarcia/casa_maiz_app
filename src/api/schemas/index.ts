import {z} from 'zod';
import {CONTRACT_VERSION} from '../../config';
import {
  archiveSchema,
  cardGridSchema,
  carouselSchema,
  contentBlockSchema,
  ctaBlockSchema,
  formBlockSchema,
  imageBlockSchema,
  mediaBlockSchema,
  promoRailSchema,
  restaurantCtaSchema,
  restaurantHeroSchema,
  textBlockSchema,
  unknownBlockSchema,
} from './blocks';

/**
 * Validates that a content response is safe to consume: the envelope carries
 * the supported contract version and a data section.
 */
export const contractEnvelopeSchema = z
  .object({
    contractVersion: z.string().optional(),
    data: z.unknown().optional(),
    nextChangeAt: z.string().optional(),
    preview: z.boolean().optional(),
    resolvedContext: z.unknown().optional(),
    error: z.string().optional(),
    errors: z.array(z.unknown()).optional(),
  })
  .passthrough();

/**
 * Known documented blocks plus a catch-all for anything else.
 *
 * Uses z.union rather than z.discriminatedUnion: the catch-all uses a plain
 * string discriminator, which discriminatedUnion rejects. Order matters — the
 * catch-all must be evaluated last so future/unknown block types still parse.
 */
export const payloadBlockSchema = z.union([
  restaurantHeroSchema,
  cardGridSchema,
  carouselSchema,
  promoRailSchema,
  textBlockSchema,
  restaurantCtaSchema,
  imageBlockSchema,
  ctaBlockSchema,
  mediaBlockSchema,
  archiveSchema,
  contentBlockSchema,
  formBlockSchema,
  unknownBlockSchema,
]);

export const pageDataSchema = z
  .object({
    id: z.string().optional(),
    slug: z.string().optional(),
    title: z.string().optional(),
    updatedAt: z.string().optional(),
    layout: z.array(payloadBlockSchema).default([]),
  })
  .passthrough();

export const pageResponseSchema = contractEnvelopeSchema
  .extend({
    data: pageDataSchema.passthrough().optional(),
  })
  .passthrough();

export const CONTRACT_VERSION_SUPPORTED = CONTRACT_VERSION;

export function isSupportedContract(response: {
  contractVersion?: string;
}): boolean {
  return response.contractVersion === CONTRACT_VERSION_SUPPORTED;
}
