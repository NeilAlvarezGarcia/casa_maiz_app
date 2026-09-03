import { z } from 'zod';
import { CONTRACT_VERSION } from '../../config';
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

export const contractEnvelopeSchema = z.strictObject({
  contractVersion: z.string().optional(),
  data: z.unknown().optional(),
  nextChangeAt: z.string().optional(),
  preview: z.boolean().optional(),
  resolvedContext: z.unknown().optional(),
  error: z.string().optional(),
  errors: z.array(z.unknown()).optional(),
});

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

export const pageDataSchema = z.looseObject({
  id: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  indexable: z.boolean().optional(),
  meta: z.unknown().optional(),
  updatedAt: z.string().optional(),
  layout: z.array(payloadBlockSchema).default([]),
});

export const pageResponseSchema = contractEnvelopeSchema.extend({
  data: pageDataSchema.optional(),
});

export const CONTRACT_VERSION_SUPPORTED = CONTRACT_VERSION;

export function isSupportedContract(response: {
  contractVersion?: string;
}): boolean {
  return response.contractVersion === CONTRACT_VERSION_SUPPORTED;
}
