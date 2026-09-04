# Casa Maíz — CMS-Driven React Native App

A React Native (CLI) + TypeScript app that renders a restaurant experience
driven by the published Casa Maíz Payload CMS API.

Android APK: [Try android app](https://drive.google.com/file/d/1zSF76-b2JXsuf55YMhNaKRt3POQvTVNA/view?usp=sharing)

- **Platforms:** iOS & Android (React Native CLI, not Expo)
- **Stack:** React Native 0.76, React Navigation 7, Zod 4, AsyncStorage, NetInfo

---

## 1. Prerequisites

### Common (any platform)

- **Node.js ≥ 18** and **npm** (project ships an `engines.node: >=18`).
- **Watchman** (recommended by React Native for file watching).
- The **Casa Maíz CMS API** is public over HTTPS, so no local CMS is required.
  Requests carry `platform`, `market=MX`, `audience=guest`, and `appVersion`.

### iOS

- **macOS** with **Xcode** (latest stable) and the iOS simulator runtime
  (`xcode-select --install`, open Xcode → Settings → Platforms to install a
  simulator if missing).
- **CocoaPods** (`sudo gem install cocoapods`) or **Bundler** — this project
  uses a `Gemfile` + `Podfile`, so `bundle install && pod install` handles it.
- **Ruby** (ships with macOS; confirm with `ruby -v`).

### Android

- **Android Studio** with the **Android SDK**, platform tools, and at least one
  **AVD** (emulator). Follow the React Native "Setting up the development
  environment" guide for Android.
- **JDK 17** (the project's Gradle config targets this; Android Studio's
  bundled JBR works).
- **`platform-tools` in `PATH`** — after installing the SDK, make sure `adb`
  is reachable. Add the following to your `~/.zshrc` (or `~/.bash_profile`):
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  ```
  Then run `source ~/.zshrc`. Without this, `npm run android` will fail with a
  `spawnSync adb EACCES` error when trying to launch the app on an emulator.

---

## 2. Installation

```bash
# 1) Install JS dependencies (brand new checkout / node_modules absent)
npm install --legacy-peer-deps

# 2) iOS only: install CocoaPods dependencies
cd ios && bundle install && pod install && cd ..
```

> **Why `--legacy-peer-deps`?** `@testing-library/react-native@13` +
> `react-test-renderer` are pinned below v14 (v14 needs React 19 / RN ≥ 0.78).
> See "Important dependency choices & trade-offs".

---

## 3. Configuration

All configuration is read from `.env`, created from the committed
`.env.example` template and containing no secrets:

```bash
cp .env.example .env
```

| Variable | Purpose | Default |
| --- | --- | --- |
| `API_BASE_URL` | Point the app at a tunnel, staging, or prod CMS | `https://payload-cms-poc-seven.vercel.app` |
| `MARKET` | Delivery context market sent on every content request | `MX` |
| `AUDIENCE` | Delivery context audience sent on every content request | `guest` |
| `CONTRACT_VERSION` | Mobile content contract version this build supports | `1.1` |
| `DEEP_LINK_SCHEME` | Custom deep-link URL scheme (without `://`) | `casamaiz` |
| `WEB_PREFIX_URL` | Public web URL used as a universal-link deep-link prefix | `https://payload-cms-poc-seven.vercel.app` |
| `STORE_URL` | App store URL shown in update banners (empty hides the button) | *(empty)* |

---

## 4. Run

Start Metro:

```bash
npm start
```

### iOS simulator

```bash
npm run ios
```

> First run on a fresh checkout requires the `pod install` from step 2. `npm
> run ios` launches the app in the default booted simulator against the
> published API.

### Android emulator

Make sure an AVD is booted (Android Studio → Device Manager → start one),
then:

```bash
npm run android
```

## 5. Lint, types, tests

```bash
npm run lint       # ESLint
npx tsc --noEmit   # TypeScript type check
npm test           # Jest unit tests
```

---

## Tests

`__tests__/` covers scenarios across 4 suites:

- **Query context** (`queryContext.test.ts`) — delivery query parameters
  (`platform/market/audience/appVersion`) are built and serialized; version
  normalization is covered.
- **CMS client** (`cmsClient.test.ts`) — contract version validation (supported
  vs. unsupported), cache serving, offline fallback, and error mapping.
- **Bootstrap** (`bootstrapNull.test.ts`) — tolerance of null/empty bootstrap
  responses without crashing.
- **Block rendering** (`BlockRenderer.test.tsx`) — a successful CMS block path
  renders; unknown/no-op blocks render safely.

Run with `npm test`.

---

## Important dependency choices & trade-offs

- **Zod 4** for runtime validation — the CMS contract is only typed by the
  integration, so every response is parsed. The v4 migration changed
  `z.discriminatedUnion` semantics (a catch-all with a plain `z.string()`
  discriminator is rejected), so the block union uses `z.union` with the
  catch-all evaluated last. This is load-bearing: it is what prevents a
  malformed/unknown block from crashing.
- **`@testing-library/react-native@13` + `react-test-renderer`** — pinned below
  v14 because v14 requires React 19 / RN ≥ 0.78; v13 works with the project's
  React 18.3.1. `install` needs `--legacy-peer-deps` for this reason.
- **React Navigation (bottom tabs)** — the bootstrap-driven tab set, order, and
  labels come from the CMS; unknown destinations are skipped rather than
  crashing.
- **AsyncStorage** — a small, dependency-free way to persist cached content and
  alert cooldown state so offline fallback and alert frequency survive restarts.
- **`react-native-dotenv` (Babel plugin)** — loads `.env`/`.env.example` and
  inlines config (base URL, market, audience, contract version, deep-link
  scheme/host, store URL) at build time, so no config value lives in source. It
  is pure Babel — no native code, so reviewers don't need a new `pod install`.
  Paired with a Zod schema in `src/config/index.ts`, a missing/invalid variable
  fails loudly at startup.
- **`react-native-device-info`** — reports the real installed app version as
  `appVersion` (Android `versionName` / iOS `CFBundleShortVersionString`),
  normalized to semantic `x.y.z` (falling back to `1.0.0` when the native
  module is unavailable, e.g. Jest). It is a small native module that autolinks
  on both platforms; iOS requires a `pod install` after adding it.
- **`@react-native-community/netinfo`** — detects online/offline connectivity.
  Used by `NetworkProvider` (`src/state/network.tsx`) to drive a single global
  `<OfflineBanner />` rendered in `App.tsx`. Autolinks on both platforms; the
  `ACCESS_NETWORK_STATE` Android permission is merged automatically. iOS
  simulator has a known issue where it does not fire network-change events
  correctly — test on a real device for accurate behavior.

## Deep linking (optional bonus)

The app registers a custom URL scheme (`DEEP_LINK_SCHEME`, default
`casamaiz://`) plus the published CMS host (`WEB_PREFIX_URL`) so links like
`casamaiz:///menu` or `https://…/menu` open the matching tab. The path→route
mapping is **derived from the same `ROUTE_MAP`** used for in-app destinations
(see `src/navigation/deepLink.ts`), so the two can't drift. Unknown paths are
ignored rather than crashing. Configuring native verification (e.g. Universal
Links `apple-app-site-association` / Android App Links) for a real domain is a
deployment step for a future release.

## Accessibility / platform notes

- The iOS tab bar uses a translucent "glass" surface; when the OS **Reduce
  Transparency** setting is enabled it falls back to an opaque surface
  (`useReducedTransparency`, iOS-only). Android keeps a solid Material surface.
- Android back behavior uses React Navigation's `backBehavior="firstRoute"`.
