/**
 * Global application configuration.
 *
 * The CMS base URL is configurable at build time through the environment so
 * the app can point at a local tunnel, staging, or the published API without a
 * code change. The published default is used when nothing is set.
 */

export const DEFAULT_API_BASE_URL = 'https://payload-cms-poc-seven.vercel.app';

export const API_BASE_URL: string =
  (process.env.API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ??
  DEFAULT_API_BASE_URL;

export const CONTRACT_VERSION = '1.1';

export const MARKET = 'MX';
export const AUDIENCE = 'guest';

export const CACHE_TTL_MS = 30 * 60 * 1000;
