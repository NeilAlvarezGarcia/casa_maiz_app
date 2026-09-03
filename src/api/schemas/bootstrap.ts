import { z } from 'zod';
import { destinationSchema, mediaSchema } from './shared';

export const bootstrapNavigationItemSchema = z.looseObject({
  label: z.string().optional(),
  icon: z.string().optional(),
  highlighted: z.boolean().optional(),
  destination: destinationSchema.optional(),
});

export const bootstrapNavigationSchema = z.looseObject({
  key: z.string().optional(),
  name: z.string().optional(),
  items: z.array(bootstrapNavigationItemSchema).default([]),
});

export const alertSchema = z.looseObject({
  id: z.string().optional(),
  title: z.string().optional(),
  message: z.string().optional(),
  image: mediaSchema.optional(),
  placement: z.string().optional(),
  priority: z.number().optional(),
  revision: z.string().optional(),
  dismissible: z.boolean().optional(),
  trigger: z
    .object({
      type: z.string().optional(),
      delayMs: z.number().optional(),
      scrollPercent: z.number().optional(),
    })
    .optional(),
  frequency: z
    .object({
      type: z.string().optional(),
      cooldownHours: z.number().optional(),
    })
    .optional(),
  pageSlugs: z.array(z.string()).optional(),
  actions: z
    .array(
      z.looseObject({
        label: z.string().optional(),
        href: z.string().optional(),
      }),
    )
    .optional(),
});

export const bootstrapPromotionSchema = z.looseObject({
  id: z.string().optional(),
  title: z.string().optional(),
  eyebrow: z.string().optional(),
  description: z.string().optional(),
  mobileImage: mediaSchema.optional(),
  desktopImage: mediaSchema.optional(),
  placement: z.string().optional(),
  priority: z.number().optional(),
  cta: z
    .looseObject({
      label: z.string().optional(),
      destination: destinationSchema.optional(),
    })
    .optional(),
});

export const experienceLabelKeys = [
  'order',
  'reserve',
  'promotions_title',
  'store_locator_title',
  'store_locator_description',
  'rewards_title',
  'rewards_description',
] as const;

export type ExperienceLabelKey = (typeof experienceLabelKeys)[number];

export const experienceLabelSchema = z.looseObject({
  key: z.string(),
  value: z.string(),
});

export const experienceSchema = z.looseObject({
  key: z.string().optional(),
  name: z.string().optional(),
  layout: z.string().optional(),
  visibleModules: z.array(z.string()).optional(),
  labels: z.array(experienceLabelSchema).optional(),
  navigation: bootstrapNavigationSchema.optional(),
  visualDefaults: z
    .object({
      accent: z.string().optional(),
      density: z.string().optional(),
    })
    .optional(),
});

export const operationalControlsSchema = z.looseObject({
  mode: z.string().optional(),
  bannerMessage: z.string().optional(),
  appUpdate: z
    .looseObject({
      policy: z.string().optional(),
      minimumVersion: z.string().optional(),
      recommendedVersion: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
});

export const featureFlagsSchema = z.record(z.string(), z.boolean());

export const bootstrapDataSchema = z.looseObject({
  alerts: z.array(alertSchema).default([]),
  experience: experienceSchema.optional(),
  featureFlags: featureFlagsSchema.default({}),
  navigation: bootstrapNavigationSchema.optional(),
  operationalControls: operationalControlsSchema.optional(),
  promotions: z.array(bootstrapPromotionSchema).default([]),
});

export const bootstrapResponseSchema = z.looseObject({
  contractVersion: z.string().optional(),
  data: bootstrapDataSchema.optional(),
  nextChangeAt: z.string().optional(),
});

export type BootstrapData = z.infer<typeof bootstrapDataSchema>;
export type BootstrapNavigationItem = z.infer<
  typeof bootstrapNavigationItemSchema
>;
export type Alert = z.infer<typeof alertSchema>;
export type BootstrapPromotion = z.infer<typeof bootstrapPromotionSchema>;
export type OperationalControls = z.infer<typeof operationalControlsSchema>;
