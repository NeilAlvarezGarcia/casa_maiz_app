import { z } from 'zod';

const envSchema = z.object({
  API_BASE_URL: z.url().trim()
    .min(1, 'API_BASE_URL is required — set it in .env (see .env.example)'),
  MARKET: z.string().trim().min(1),
  AUDIENCE: z.string().trim().min(1),
  CONTRACT_VERSION: z.string().trim().min(1),
  DEEP_LINK_SCHEME: z.string().trim().min(1),
  WEB_PREFIX_URL: z.url().trim().min(1),
  STORE_URL: z.url().trim().default(''),
});

const env = envSchema.parse({
  API_BASE_URL: process.env.API_BASE_URL,
  MARKET: process.env.MARKET,
  AUDIENCE: process.env.AUDIENCE,
  CONTRACT_VERSION: process.env.CONTRACT_VERSION,
  DEEP_LINK_SCHEME: process.env.DEEP_LINK_SCHEME,
  WEB_PREFIX_URL: process.env.WEB_PREFIX_URL,
  STORE_URL: process.env.STORE_URL,
});

export const API_BASE_URL = env.API_BASE_URL.replace(/\/+$/, '');

export const CONTRACT_VERSION = env.CONTRACT_VERSION;

export const MARKET = env.MARKET;
export const AUDIENCE = env.AUDIENCE;

export const DEEP_LINK_SCHEME = env.DEEP_LINK_SCHEME;
export const WEB_PREFIX_URL = env.WEB_PREFIX_URL;
export const STORE_URL = env.STORE_URL;

export const CACHE_TTL_MS = 30 * 60 * 1000;
