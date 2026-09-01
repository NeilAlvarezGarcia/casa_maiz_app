import {z} from 'zod';
import {destinationSchema, mediaSchema} from './shared';

/**
 * Validation schemas for the /bootstrap response. Bootstrap is configuration,
 * not content, and every optional field may be null or absent — the app must
 * remain usable when any of them is missing.
 */

export const bootstrapNavigationItemSchema = z
  .object({
    label: z.string().optional(),
    icon: z.string().optional(),
    highlighted: z.boolean().optional(),
    destination: destinationSchema.passthrough().optional(),
  })
  .passthrough();

export const bootstrapNavigationSchema = z
  .object({
    key: z.string().optional(),
    name: z.string().optional(),
    items: z.array(bootstrapNavigationItemSchema).default([]),
  })
  .passthrough();

export const alertSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    message: z.string().optional(),
    image: mediaSchema.optional(),
    placement: z.string().optional(),
    priority: z.number().optional(),
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
        z
          .object({
            label: z.string().optional(),
            href: z.string().optional(),
          })
          .passthrough(),
      )
      .optional(),
  })
  .passthrough();

export const bootstrapPromotionSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().optional(),
    eyebrow: z.string().optional(),
    description: z.string().optional(),
    mobileImage: mediaSchema.optional(),
    desktopImage: mediaSchema.optional(),
    placement: z.string().optional(),
    priority: z.number().optional(),
    cta: z
      .object({
        label: z.string().optional(),
        destination: destinationSchema.optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const experienceSchema = z
  .object({
    key: z.string().optional(),
    name: z.string().optional(),
    layout: z.string().optional(),
    visibleModules: z.array(z.string()).optional(),
    labels: z
      .array(z.object({key: z.string(), value: z.string()}).passthrough())
      .optional(),
    navigation: bootstrapNavigationSchema.optional(),
    visualDefaults: z
      .object({
        accent: z.string().optional(),
        density: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export const operationalControlsSchema = z
  .object({
    mode: z.string().optional(),
    bannerMessage: z.string().optional(),
    appUpdate: z
      .object({
        policy: z.string().optional(),
        minimumVersion: z.string().optional(),
        recommendedVersion: z.string().optional(),
        message: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export const featureFlagsSchema = z.record(z.string(), z.boolean());

export const bootstrapDataSchema = z
  .object({
    alerts: z.array(alertSchema).default([]),
    experience: experienceSchema.optional(),
    featureFlags: featureFlagsSchema.default({}),
    navigation: bootstrapNavigationSchema.optional(),
    operationalControls: operationalControlsSchema.optional(),
    promotions: z.array(bootstrapPromotionSchema).default([]),
  })
  .passthrough();

export const bootstrapResponseSchema = z
  .object({
    contractVersion: z.string().optional(),
    data: bootstrapDataSchema.passthrough().optional(),
    nextChangeAt: z.string().optional(),
  })
  .passthrough();

export type BootstrapData = z.infer<typeof bootstrapDataSchema>;
export type BootstrapNavigationItem = z.infer<
  typeof bootstrapNavigationItemSchema
>;
export type Alert = z.infer<typeof alertSchema>;
export type BootstrapPromotion = z.infer<typeof bootstrapPromotionSchema>;
export type OperationalControls = z.infer<typeof operationalControlsSchema>;
