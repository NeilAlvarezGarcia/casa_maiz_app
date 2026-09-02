import {z} from 'zod';
import {
  cardGridSchema,
  carouselSchema,
  promoRailSchema,
  restaurantHeroSchema,
  textBlockSchema,
  restaurantCtaSchema,
  imageBlockSchema,
} from './schemas/blocks';

export type RestaurantHeroBlock = z.infer<typeof restaurantHeroSchema>;
export type CardGridBlock = z.infer<typeof cardGridSchema>;
export type CarouselBlock = z.infer<typeof carouselSchema>;
export type PromoRailBlock = z.infer<typeof promoRailSchema>;
export type TextBlock = z.infer<typeof textBlockSchema>;
export type RestaurantCtaBlock = z.infer<typeof restaurantCtaSchema>;
export type ImageBlock = z.infer<typeof imageBlockSchema>;

export type LayoutBlock = Record<string, unknown> & {blockType: string};

export interface PageData {
  id?: string;
  slug?: string;
  title?: string;
  updatedAt?: string;
  layout: LayoutBlock[];
}
