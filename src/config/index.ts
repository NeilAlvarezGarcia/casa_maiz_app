/**
 * Global application configuration.
 *
 * Every configurable value is loaded from the environment (`.env`, see
 * `.env.example`) and validated at startup with Zod. A missing or malformed
 * value fails with a clear error instead of silently falling back to a
 * hardcoded default.
 *
 * Values are inlined at build time by the `react-native-dotenv` Babel plugin
 * (`process.env.X` references are replaced while bundling), so there is no
 * runtime file or native code involved.
 */
import {z} from 'zod';

const envSchema = z.object({
  API_BASE_URL: z
    .string()
    .trim()
    .min(1, 'API_BASE_URL is required — set it in .env (see .env.example)'),
  APP_VERSION: z
    .string()
    .trim()
    .regex(
      /^\d+\.\d+\.\d+$/,
      'APP_VERSION must be a semantic version such as 1.0.0 (values like "1" or "v1.0" are invalid)',
    ),
  MARKET: z.string().trim().min(1),
  AUDIENCE: z.string().trim().min(1),
  CONTRACT_VERSION: z.string().trim().min(1),
});

const env = envSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
  APP_VERSION: process.env.APP_VERSION,
  MARKET: process.env.MARKET,
  AUDIENCE: process.env.AUDIENCE,
  CONTRACT_VERSION: process.env.CONTRACT_VERSION,
});

/** Base URL of the published CMS API, with any trailing slashes removed. */
export const API_BASE_URL = env.API_BASE_URL.replace(/\/+$/, '');

/** The mobile content contract version this build supports. */
export const CONTRACT_VERSION = env.CONTRACT_VERSION;

/** Delivery context sent with every content request. */
export const MARKET = env.MARKET;
export const AUDIENCE = env.AUDIENCE;

/** App version reported to the CMS as `appVersion`. */
export const APP_VERSION = env.APP_VERSION;

export const CACHE_TTL_MS = 30 * 60 * 1000;
