import { z } from 'zod';
import {
  cardGridSchema,
  carouselSchema,
  promoRailSchema,
  restaurantHeroSchema,
  textBlockSchema,
  restaurantCtaSchema,
  imageBlockSchema,
  ctaBlockSchema,
  mediaBlockSchema,
  archiveSchema,
  contentBlockSchema,
  formBlockSchema,
  formFieldSchema,
} from './schemas/blocks';

export type RestaurantHeroBlock = z.infer<typeof restaurantHeroSchema>;
export type CardGridBlock = z.infer<typeof cardGridSchema>;
export type CarouselBlock = z.infer<typeof carouselSchema>;
export type PromoRailBlock = z.infer<typeof promoRailSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type RestaurantCtaBlock = z.infer<typeof restaurantCtaSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;
export type CtaBlock = z.infer<typeof ctaBlockSchema>;
export type MediaBlock = z.infer<typeof mediaBlockSchema>;
export type ArchiveBlock = z.infer<typeof archiveSchema>;
export type ContentBlock = z.infer<typeof contentBlockSchema>;
export type FormBlock = z.infer<typeof formBlockSchema>;
export type FormField = z.infer<typeof formFieldSchema>;

export type LayoutBlock = Record<string, unknown> & { blockType: string };

export interface PageData {
  id?: string;
  slug?: string;
  title?: string;
  updatedAt?: string;
  layout: LayoutBlock[];
}
