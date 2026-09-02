# Casa Maíz — CMS-Driven React Native App

A React Native (CLI) + TypeScript app that renders a restaurant experience
driven by the published Casa Maíz Payload CMS API. No editorial content is
hardcoded: pages, navigation, promotions, alerts, and legal content arrive
from the CMS and are validated against a typed content contract.

- **Platforms:** iOS & Android (React Native CLI, not Expo)
- **CMS API:** `https://payload-cms-poc-seven.vercel.app` (content contract `1.1`)
- **Stack:** React Native 0.76, React Navigation 7, Zod 4, AsyncStorage

---

## Getting Started

### Prerequisites

Follow the React Native environment setup guide for iOS and Android. Then
install dependencies (the project uses `react-native-device-info`, which has an
iOS native pod, so `pod install` is required):

```bash
npm install --legacy-peer-deps
cd ios && bundle install && pod install && cd ..
```

### Run

```bash
npm start          # start Metro
npm run ios        # build & run on the iOS simulator
npm run android    # build & run on Android emulator (first boot: an AVD)
```

#### Android emulator networking

The published API is public over HTTPS, so the default `API_BASE_URL` works on
an emulator without any local networking. If you point the app at a tunneled or
self-hosted CMS, remember that the Android emulator reaches your host as
`10.0.2.2` (not `localhost`). Example:

```bash
# iOS simulator / device over a tunnel:
API_BASE_URL=https://your-tunnel.example npm run ios

# Android emulator reaching a local server on the host:
API_BASE_URL=http://10.0.2.2:3000 npm run android
```

#### Physical devices

- Android: enable Developer Options → USB debugging, connect via USB, then
  `npm run android`. Metro must be reachable from the device; on Android this
  requires `adb reverse tcp:8081 tcp:8081` (run once) so the device can reach
  Metro on `localhost:8081`.
- iOS: on a real device you must pick your team in `ios/*.xcodeproj` (Signing &
  Capabilities) before `npm run ios -- --device`. Trust your development cert
  on the device when prompted.
- Physical devices cannot resolve `localhost` to your machine; use a tunnel or
  your LAN IP for a self-hosted `API_BASE_URL`.

### Lint, types, tests

```bash
npm run lint       # ESLint (zero-warning config for app code)
npx tsc --noEmit   # TypeScript type check
npm test           # Jest unit tests (50 tests)
```

### Configuration

All configuration is read from `.env`, created from the committed
`.env.example` template (`cp .env.example .env`) and containing no secrets.
`.env` is gitignored, so local/tunnel/staging overrides never enter the repo.
Values are inlined at build time by `react-native-dotenv` and validated at
startup with Zod — a missing or malformed value fails with a clear error
instead of silently using a hardcoded default. A host environment variable
overrides the matching `.env` key, so
`API_BASE_URL=https://your-tunnel.example npm run ios` also works.

| Variable | Purpose | Default |
| --- | --- | --- |
| `API_BASE_URL` | Point the app at a local tunnel, staging, or prod | `https://payload-cms-poc-seven.vercel.app` |
| `APP_VERSION` | Fallback app version reported as `appVersion` context (semantic `x.y.z`). On a real device the native installed version is preferred (see below) | `1.0.0` |
| `MARKET` | Delivery context market sent on every content request | `MX` |
| `AUDIENCE` | Delivery context audience sent on every content request | `guest` |
| `CONTRACT_VERSION` | Mobile content contract version this build supports | `1.1` |

After editing `.env`, restart Metro with a cache reset so the new values are
re-inlined: `npm start -- --reset-cache`.

---

## Architecture

```
src/
  config/            build-time constants (Zod-validated .env values)
  core/context/      query context construction (platform/market/audience/version)
  core/hooks/        useReducedTransparency (iOS Reduce Transparency → glass fallback)
  api/
    schemas/
      index.ts       envelope + block union schema (catch-all evaluated last)
      blocks.ts      individual block schemas (14 block types + unknownBlock)
      bootstrap.ts   bootstrap schemas (nav, alerts, promotions, feature flags)
      shared.ts      media, destination, CTA, rich-text, contract version
    transport.ts     fetch wrapper: 15s timeout, CmsError codes, abort
    cmsClient.ts     typed client: endpoints, contract validation, cache wiring
    clientSingleton.ts   getCmsClient() singleton, createTestCmsClient() for tests
    types.ts         inferred Zod types for blocks, page data, layout
  cache/
    contentCache.ts  in-memory Map + AsyncStorage adapter, 30 min TTL
    storage.ts       asyncStorageAdapter + createMemoryStorageAdapter()
  ui/
    theme/           light/dark palettes, CMS-driven accent, spacing, blockStyles
    components/      Text, ActionLink, ContentCard, MediaImage, StateViews
  blocks/
    BlockRenderer.tsx  data-driven registry: 7 rendered blocks + 5 no-ops + UnknownBlock fallback
    components/
      RestaurantHero.tsx, TextBlock.tsx, RestaurantCta.tsx,
      CardGrid.tsx, Carousel.tsx, PromoRail.tsx, ImageBlock.tsx,
      SectionHeader.tsx (shared), UnknownBlock.tsx (safe fallback)
  navigation/
    RootNavigator.tsx      bootstrap-driven bottom tabs + iOS glass surface
    destinationResolver.ts CMS path → route map + external URL validation
    deepLink.ts            deep-link config derived from ROUTE_MAP (scheme + host)
    activeRoute.tsx        ActiveRouteProvider, useActiveRoute()
  state/
    bootstrap.tsx   BootstrapProvider, useBootstrap(), useFeatureFlag()
  features/
    home/           HomeScreen + HomeModules (promotions + feature-flagged modules)
    menu/           MenuScreen
    reservations/   ReservationsScreen (static placeholder)
    privacy/        PrivacyScreen (legal content)
    hooks/          usePageData (page loading state machine), useLegalContent
    shared/         PageScreen, AlertBanner, AppUpdateBanner, StaleBanner,
                    alertBehavior (placement/delay/cooldown), TopBar
App.tsx              SafeAreaProvider > ActiveRoute > NavContainer > Bootstrap > Theme > tabs
```

### CMS content flow

1. **Bootstrap** (`/api/content/v1/bootstrap`) loads first. It supplies:
   navigation tabs, in-app alert banners, visual default (accent color),
   operational controls, feature flags, and app-update information. Navigation
   and banners are driven by it.
2. **Pages** (`/api/content/v1/pages/{slug}`) load per tab. Every request
   carries `platform`, `market=MX`, `audience=guest`, and `appVersion`.
3. **Blocks** render through `BlockRenderer`, a data-driven registry mapping
   `blockType` strings to components. Seven block types are fully implemented
   (`restaurantHero`, `textBlock`, `restaurantCTA`, `cardGrid`, `carousel`,
   `promoRail`, `imageBlock`); five more are registered as safe no-ops
   (`cta`, `content`, `mediaBlock`, `archive`, `formBlock`); any unknown or
   future block type renders a safe `UnknownBlock` placeholder — never crashes.
4. **Destinations** (block actions, alert CTAs, promotions) resolve through
   `navigation/destinationResolver.ts` — a single map of CMS paths to routes,
   with external URLs validated before opening.

### Resilience

- **Contract validation:** responses are parsed with Zod 4; unsupported content
  contract versions surface as typed `unsupported-contract` errors rather than
  crashing. The block union uses `z.union` with the catch-all evaluated last
  (Zod 4 rejects `z.discriminatedUnion` with a plain `z.string()` discriminator).
- **Caching/offline:** every successful response is persisted in memory and
  AsyncStorage (`nextChangeAt` honoured, 30-minute TTL fallback). When a page
  is stale or the network is down, the last good content remains readable as a
  read-only fallback and is flagged with a "stale" banner; pull-to-refresh retries.
- **State handling:** loading, error (retry), empty, and offline states are
  rendered consistently via `StateViews`.
- **Accessibility:** actions expose `accessibilityRole`/`accessibilityLabel`,
  media exposes alt text, and touch targets respect a minimum size.
- **Theme:** light/dark via system color scheme with a CMS-driven accent.

---

## Tests

`__tests__/` covers the assessment-required scenarios across 7 suites:

- **Query context** — required query parameters are built and serialized;
  version normalization and platform detection are covered.
- **Contract validation** — supported vs. unsupported contract versions.
- **CMS client** — cache serving, offline fallback, stale detection,
  error mapping (404, server errors, unknown keys).
- **Block rendering** — a successful CMS block path (`textBlock`,
  `restaurantHero`) renders; unknown and no-op blocks render safely.
- **Cache / offline fallback** — fresh vs. stale `nextChangeAt`, TTL expiry,
  read-only offline fallback after the network fails, and `clear()` wiping
  persisted keys.
- **Destination resolver** — every CMS path maps to a navigation route and
  navigates correctly; external URLs are validated.
- **Alert lifecycle** — placement, trigger delay, frequency/cooldown, and
  page-`pageSlugs` targeting are pure and unit-tested.
- **Deep linking** — the link config is derived from `ROUTE_MAP` and covers
  every CMS path and both prefixes.

Run with `npm test` (currently 50 tests across 7 suites).

---

## Important dependency choices & trade-offs

- **React Native CLI + TypeScript** — required by the brief; rejects Expo. The
  template's default `tsconfig.json` is used (`types: ["react-native", "jest"]`).
- **Zod 4** for runtime validation — the CMS contract is only typed by the
  integration, so every response is parsed. The v4 migration changed
  `z.discriminatedUnion` semantics (a catch-all with a plain `z.string()`
  discriminator is rejected), so the block union uses `z.union` with the
  catch-all evaluated last. This is load-bearing: it is what prevents a
  malformed/unknown block from crashing.
- **`@testing-library/react-native@13` + `react-test-renderer`** — pinned below
  v14 because v14 requires React 19 / RN ≥0.78 and the newer `test-renderer`
  package; v13 works with the project's React 18.3.1. `install` needs
  `--legacy-peer-deps` for this reason.
- **React Navigation (bottom tabs)** — the bootstrap-driven tab set, order, and
  labels come from the CMS; unknown destinations are skipped rather than
  crashing.
- **AsyncStorage** — a small, dependency-free way to persist cached content and
  alert cooldown state so offline fallback and alert frequency survive restarts.
- **`react-native-dotenv` (Babel plugin)** — loads `.env`/`.env.example` and
  inlines config (base URL, market, audience, contract version, app version) at
  build time, so no config value lives in source. It is pure Babel — no native
  code, so reviewers don't need a new `pod install`. Paired with a Zod schema
  in `src/config/index.ts`, a missing/invalid variable fails loudly at startup.
- **Single `CmsClient`** with central query-context construction — keeps the
  `platform/market/audience/appVersion` params, timeout, abort, and cache wiring
  in one place so every screen cannot drift.
- **`react-native-device-info`** — reports the real installed app version as
  `appVersion` (Android `versionName` / iOS `CFBundleShortVersionString`),
  falling back to the build-time `APP_VERSION` constant when the native module
  is unavailable (e.g. Jest). It is a small native module that autolinks on both
  platforms; iOS requires a `pod install` after adding it.

## Deep linking (optional bonus)

The app registers a custom URL scheme (`casamaiz://`) plus the published CMS
host so links like `casamaiz:///menu` or `https://…/menu` open the matching tab.
The path→route mapping is **derived from the same `ROUTE_MAP`** used for in-app
destinations (see `src/navigation/deepLink.ts`), so the two can't drift. Unknown
paths are ignored rather than crashing. Configuring native verification (e.g.
Universal Links `apple-app-site-association` / Android App Links) for a real
domain is a deployment step for a future release.

## Accessibility / platform notes

- The iOS tab bar uses a translucent "glass" surface; when the OS **Reduce
  Transparency** setting is enabled it falls back to an opaque surface
  (`useReducedTransparency`, iOS-only). Android keeps a solid Material surface.
- Android back behavior uses React Navigation's `backBehavior="firstRoute"`.
- Scroll-triggered alerts: see "Known limitations".

## Known limitations

- **Alert `trigger.type: "scroll"`** is approximated as "on load" in the global
  chrome (a scroll% isn't easily measurable above the tab navigator); the
  `delayMs` still applies. Frequency/cooldown, placement, page targeting,
  dismissal, and actions are fully honoured.
- **iOS CocoaPods are not committed/installed by default**; run
  `cd ios && bundle install && pod install` once. The app was verified by
  type-check, lint, and tests; builds on the iOS simulator require that step.
- **`ContentCache.clear()`** now removes persisted keys via the storage
  adapter's `keys()` (`AsyncStorage.getAllKeys()`), so a programmatic "clear
  all" forgets persistent copies too, not only the in-memory map.

## License

Private assessment project. Content and API belong to their publishers.
