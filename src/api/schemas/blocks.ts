import { z } from 'zod';
import { ctaSchema, destinationSchema, mediaSchema } from './shared';

export const restaurantHeroSchema = z.looseObject({
  blockType: z.literal('restaurantHero'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  image: mediaSchema.optional(),
  actions: z.array(ctaSchema).optional(),
  id: z.string().optional(),
});

export const textBlockSchema = z.looseObject({
  blockType: z.literal('textBlock'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
  alignment: z.string().optional(),
  id: z.string().optional(),
});

export const restaurantCtaSchema = z.looseObject({
  blockType: z.literal('restaurantCTA'),
  contractVersion: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  destination: destinationSchema.optional(),
  href: z.string().optional(),
  tone: z.string().optional(),
  id: z.string().optional(),
});

export const cardSchema = z.looseObject({
  image: mediaSchema.optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  cta: ctaSchema.optional(),
});

export const cardGridSchema = z.looseObject({
  blockType: z.literal('cardGrid'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  cards: z.array(cardSchema).default([]),
  id: z.string().optional(),
});

export const carouselSlideSchema = z.looseObject({
  image: mediaSchema.optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  cta: ctaSchema.optional(),
});

export const carouselSchema = z.looseObject({
  blockType: z.literal('carousel'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  slides: z.array(carouselSlideSchema).default([]),
  id: z.string().optional(),
});

export const promotionSchema = z.looseObject({
  id: z.string().optional(),
  title: z.string().optional(),
  eyebrow: z.string().optional(),
  description: z.string().optional(),
  mobileImage: mediaSchema.optional(),
  desktopImage: mediaSchema.optional(),
  placement: z.string().optional(),
  cta: ctaSchema.optional(),
});
export const promoRailSchema = z.looseObject({
  blockType: z.literal('promoRail'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  promotions: z.array(promotionSchema).default([]),
  id: z.string().optional(),
});

export const imageBlockSchema = z.looseObject({
  blockType: z.literal('imageBlock'),
  contractVersion: z.string().optional(),
  image: mediaSchema.optional(),
  mobileImage: mediaSchema.optional(),
  caption: z.string().optional(),
  fullBleed: z.boolean().optional(),
  id: z.string().optional(),
});

export const ctaBlockSchema = z.looseObject({
  blockType: z.literal('cta'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  headline: z.string().optional(),
  description: z.string().optional(),
  label: z.string().optional(),
  destination: destinationSchema.optional(),
  href: z.string().optional(),
  tone: z.string().optional(),
  align: z.string().optional(),
  id: z.string().optional(),
});

export const mediaBlockSchema = z.looseObject({
  blockType: z.literal('mediaBlock'),
  contractVersion: z.string().optional(),
  media: mediaSchema.optional(),
  image: mediaSchema.optional(),
  caption: z.string().optional(),
  fullBleed: z.boolean().optional(),
  aspectRatio: z.number().optional(),
  id: z.string().optional(),
});

export const archiveItemSchema = z.looseObject({
  image: mediaSchema.optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  cta: ctaSchema.optional(),
});

export const archiveSchema = z.looseObject({
  blockType: z.literal('archive'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  items: z.array(archiveItemSchema).default([]),
  id: z.string().optional(),
});

export const contentBlockSchema = z.looseObject({
  blockType: z.literal('content'),
  contractVersion: z.string().optional(),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  body: z.string().optional(),
  alignment: z.string().optional(),
  id: z.string().optional(),
});

export const formFieldOptionSchema = z.looseObject({
  label: z.string().optional(),
  value: z.string().optional(),
});

export const formFieldSchema = z.looseObject({
  id: z.string().optional(),
  name: z.string().optional(),
  label: z.string().optional(),
  type: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(formFieldOptionSchema).optional(),
});

export const formBlockSchema = z.looseObject({
  blockType: z.literal('formBlock'),
  contractVersion: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  form: z.string().optional(),
  submitLabel: z.string().optional(),
  fields: z.array(formFieldSchema).default([]),
  id: z.string().optional(),
});

export const unknownBlockSchema = z.looseObject({
  blockType: z.string(),
  contractVersion: z.string().optional(),
});
