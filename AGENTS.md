# AGENTS.md

## Project overview

Casa Maíz is a CMS-driven restaurant app built with **React Native (CLI, not
Expo)** and **TypeScript**. All editorial content (pages, navigation,
promotions, alerts, legal) is fetched from the published Casa Maíz Payload CMS
API and validated against a typed content contract (Zod). No editorial content
is hardcoded.

- **Platforms:** iOS & Android (React Native CLI)
- **CMS API:** `https://payload-cms-poc-seven.vercel.app` (contract `1.1`)
- **Stack:** React Native 0.76, React Navigation 7, Zod 4, AsyncStorage

## Commands

```bash
npm install             # install deps; may need --legacy-peer-deps (RN 0.76 / React 18 constraints)
npm start               # start Metro
npm run ios             # build & run on the iOS simulator (requires: cd ios && bundle install && pod install)
npm run android         # build & run on Android emulator
npm run lint            # ESLint (extends @react-native, jest env for tests)
npx tsc --noEmit        # TypeScript type check
npm test                # Jest unit tests (preset react-native)
```

First-time iOS: `cd ios && bundle install && pod install`.

## Code style and conventions

- **TypeScript** everywhere; strictness comes from the React Native shared
  config (extends `@react-native/typescript-config/tsconfig.json`).
- **Prettier** (`.prettierrc.js`): `singleQuote`, `arrowParens: 'avoid'`,
  `bracketSameLine`, `bracketSpacing: false`, `trailingComma: 'all'`.
- **ESLint** (`.eslintrc.js`): extends `@react-native`; `overrides` enable the
  `jest` env for test files (`**/*.test.{ts,tsx}`, `__tests__/**`, `jest.setup.js`).
- **Runtime validation:** every CMS response is parsed with Zod. The block
  union uses `z.union` with the catch-all evaluated last (`z.discriminatedUnion`
  with a plain `z.string()` discriminator is rejected by Zod 4). Do not
  refactor this to a shape that reassumes a known block type — unknown/future
  blocks must render a safe `UnknownBlock`, never crash.
- **CMS-driven behavior:** navigation tabs, banners, accent color, and app
  update info come from the bootstrap endpoint. Actions/destinations resolve
  through `navigation/destinationResolver.ts` — keep the path→route mapping
  there, and validate external URLs before opening.
- **Resilience:** every successful response is cached (memory + AsyncStorage)
  for offline/stale fallback. Loading / error (retry) / empty / offline states
  are rendered via `StateViews`.
- **Accessibility:** actions expose `accessibilityRole`/`accessibilityLabel`,
  media exposes alt text, touch targets respect minimum size.
- **Architecture:** existing modules live in `src/` — `api/` (schemas,
  transport, CmsClient), `cache/`, `ui/`, `blocks/` (data-driven
  `BlockRenderer` registry), `navigation/`, `state/` (bootstrap provider),
  `features/`, `core/`, `config/`. Follow existing import/naming patterns; a
  single `CmsClient` builds the shared query context — do not let per-screen
  query construction drift.
- **Pin constraints:** `@testing-library/react-native@13` + `react-test-renderer`
  are pinned below v14 (v14 requires React 19 / RN ≥0.78). Do not bump versions
  that break this pairing.

## Verification

Before finishing work, run:

```bash
npx tsc --noEmit   # type check
npm run lint       # ESLint (zero-warning config for app code)
npm test           # Jest unit tests
```

Key test suites live in `__tests__/`: query context, contract validation,
block rendering (successful + unknown/unimplemented safe rendering), cache /
offline fallback, bootstrap-driven navigation, and alert lifecycle.

## Git workflow

Single `main` branch. Conventional, focused commits are preferred (e.g.
`feat(blocks): render `hero` variant`, `fix(cache): honor expired nextChangeAt`).
Keep commits small and atomic; run the verification commands above before
committing. Do not commit local overrides — `.opencode/opencode.json` is
gitignored.