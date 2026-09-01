import {z} from 'zod';
import {ctaSchema, destinationSchema, mediaSchema} from './shared';

/**
 * Schemas for the CMS layout blocks documented in contract version 1.1.
 * Unknown/missing optional fields are tolerated. Blocks the app does not yet
 * render still parse (via the generic block schema) so they never crash.
 */
export const restaurantHeroSchema = z
  .object({
    blockType: z.literal('restaurantHero'),
    eyebrow: z.string().optional(),
    headline: z.string().optional(),
    description: z.string().optional(),
    image: mediaSchema.optional(),
    actions: z.array(ctaSchema).optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const textBlockSchema = z
  .object({
    blockType: z.literal('textBlock'),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    body: z.string().optional(),
    alignment: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const restaurantCtaSchema = z
  .object({
    blockType: z.literal('restaurantCTA'),
    headline: z.string().optional(),
    description: z.string().optional(),
    label: z.string().optional(),
    destination: destinationSchema.optional(),
    href: z.string().optional(),
    tone: z.string().optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const cardSchema = z
  .object({
    image: mediaSchema.optional(),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    cta: ctaSchema.optional(),
  })
  .passthrough();

export const cardGridSchema = z
  .object({
    blockType: z.literal('cardGrid'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    cards: z.array(cardSchema).default([]),
    id: z.string().optional(),
  })
  .passthrough();

export const carouselSlideSchema = z
  .object({
    image: mediaSchema.optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    cta: ctaSchema.optional(),
  })
  .passthrough();

export const carouselSchema = z
  .object({
    blockType: z.literal('carousel'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    slides: z.array(carouselSlideSchema).default([]),
    id: z.string().optional(),
  })
  .passthrough();

export const promotionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    eyebrow: z.string().optional(),
    description: z.string().optional(),
    mobileImage: mediaSchema.optional(),
    desktopImage: mediaSchema.optional(),
    placement: z.string().optional(),
    cta: ctaSchema.optional(),
  })
  .passthrough();

export const promoRailSchema = z
  .object({
    blockType: z.literal('promoRail'),
    eyebrow: z.string().optional(),
    title: z.string().optional(),
    promotions: z.array(promotionSchema).default([]),
    id: z.string().optional(),
  })
  .passthrough();

export const imageBlockSchema = z
  .object({
    blockType: z.literal('imageBlock'),
    image: mediaSchema.optional(),
    mobileImage: mediaSchema.optional(),
    caption: z.string().optional(),
    fullBleed: z.boolean().optional(),
    id: z.string().optional(),
  })
  .passthrough();

export const ctaBlockSchema = z
  .object({
    blockType: z.literal('cta'),
    id: z.string().optional(),
  })
  .passthrough();

export const mediaBlockSchema = z
  .object({
    blockType: z.literal('mediaBlock'),
    id: z.string().optional(),
  })
  .passthrough();

export const archiveSchema = z
  .object({
    blockType: z.literal('archive'),
    id: z.string().optional(),
  })
  .passthrough();

export const contentBlockSchema = z
  .object({
    blockType: z.literal('content'),
    id: z.string().optional(),
  })
  .passthrough();

export const formBlockSchema = z
  .object({
    blockType: z.literal('formBlock'),
    id: z.string().optional(),
  })
  .passthrough();

/** Catch-all for any block shape. Unknown blocks land here. */
export const unknownBlockSchema = z
  .object({
    blockType: z.string(),
  })
  .passthrough();
