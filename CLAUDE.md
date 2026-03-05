# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`react-native-view-shot` is a React Native library (v4.0+) for capturing React Native views as images. It supports iOS, Android, Windows, and Web, and is compatible with both the old and new React Native architectures (Fabric + TurboModules).

## Commands

### Library (root)

```bash
npm run build          # Compile TypeScript → lib/
npm run type-check     # Type-check without emitting
npm run lint           # ESLint
npm run lint:ci        # ESLint (zero warnings allowed)
npm run format         # Prettier format
npm run format:check   # Check formatting
```

### Example App (cd example)

```bash
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run start          # Start Metro bundler

# E2E tests (Detox)
npm run build:e2e:ios
npm run test:e2e:ios
UPDATE_SNAPSHOTS=true npm run test:e2e:ios   # Regenerate reference snapshots

npm run build:e2e:android
npm run test:e2e:android
UPDATE_SNAPSHOTS=true npm run test:e2e:android
```

## Architecture

### JS/TS Layer (`src/`)

- **`src/index.tsx`** — Main entry point. Exports the `ViewShot` class component and imperative functions `captureRef`, `captureScreen`, `releaseCapture`. Contains option validation logic (`validateOptions`).
- **`src/RNViewShot.ts`** — Bridges to the native module via `src/specs/NativeRNViewShot.ts`. Detects old vs. new architecture at runtime using `global.__turboModuleProxy`.
- **`src/RNViewShot.web.ts`** — Web implementation using `html2canvas`. Metro resolves this file automatically for web targets.
- **`src/specs/NativeRNViewShot.ts`** — TurboModule spec (`Spec extends TurboModule`). Codegen config in `package.json` points here (`codegenConfig.jsSrcsDir`).

The compiled output goes to `lib/` (gitignored). The `package.json` `"main"` field points to `lib/index.js` (for npm consumers) and `"react-native"` field points to `src/index.tsx` (for Metro bundler).

### Native Layer

**iOS** (`ios/`)

- `RNViewShot.mm` — Objective-C++ module. Implements `captureRef`, `captureScreen`, `releaseCapture`. Conditionally compiles for new arch (`#ifdef RCT_NEW_ARCH_ENABLED`). Uses `drawViewHierarchyInRect` (default) or `renderInContext` (via `useRenderInContext` option). Runs on the UI manager queue.
- `RNViewShot.h` — Header file.

**Android** (`android/`)

- `src/main/` — Old architecture implementation (always present).
- `src/paper/java/` — Additional old arch sources (conditionally included via `sourceSets`).
- New arch is enabled via the `newArchEnabled` Gradle property, which applies the React plugin and triggers codegen.
- Key classes: `RNViewShotModule.java`, `RNViewShotPackage.java`, `ViewShot.java`.

**Windows** (`windows/`) — C# implementation, referenced via `react-native.config.js`.

### Example App (`example/`)

A full React Native app demonstrating all features. Each feature has its own screen in `example/src/screens/`. The E2E tests (Detox) navigate between these screens and validate captures using pixel-level snapshot comparison.

E2E snapshot references live in `example/e2e/snapshots/reference/{ios,android}/` — platform-separated because rendering differs. Test outputs go to `example/e2e/snapshots/output/` (gitignored).

## Key Behaviors

- **Architecture detection**: `src/specs/NativeRNViewShot.ts` checks `global.__turboModuleProxy` at runtime to decide between `TurboModuleRegistry` (new arch) and `NativeModules` (old arch).
- **Web platform**: Metro resolves `*.web.ts` files automatically; no explicit config needed.
- **`collapsable={false}`** is set automatically by the `ViewShot` component to prevent Android from collapsing the view before capture.
- **First layout wait**: `ViewShot` delays capture until the first `onLayout` event fires, avoiding zero-size captures.
- **Android E2E**: Detox Android tests run with `newArchEnabled=false` (set in example app) to avoid Fabric crashes. iOS is the primary CI target.
