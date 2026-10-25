# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`react-native-view-shot` is a React Native library for capturing React Native views as images. It supports iOS, Android, Windows, and Web, and is compatible with both the old and new React Native architectures (Fabric + TurboModules).

Supported floors: `react-native >= 0.80.0` and `react >= 18` (peer deps), iOS 15.1 (podspec; `Package.swift` declares iOS 15 for SwiftPM autolinking, RN >= 0.87), Node `>= 20.19.4` (`engines`; CI uses Node 24).

## Commands

### Library (root)

```bash
npm run build          # Compile TypeScript → lib/
npm run type-check     # Type-check without emitting
npm run lint           # ESLint
npm run lint:ci        # ESLint (zero warnings allowed)
npm run format         # Prettier format
npm run format:check   # Check formatting
npm test               # Jest unit tests (src/__tests__)
```

Native unit tests (run in CI):

```bash
# Android JUnit (android/src/test), from example/android
./gradlew :react-native-view-shot:testDebugUnitTest

# iOS XCTest (example/ios/ViewShotExampleTests), from example after pod install
xcodebuild test -workspace ios/ViewShotExample.xcworkspace -scheme ViewShotExampleTests -destination 'platform=iOS Simulator,id=<simulator-udid>'

# Windows (windows/RNViewShot.Tests)
dotnet test windows/RNViewShot.Tests/RNViewShot.Tests.csproj
```

### Example App (cd example)

```bash
npm run ios            # Run on iOS simulator
npm run android        # Run on Android emulator
npm run start          # Start Metro bundler

# E2E tests (Detox)
npm run build:e2e:ios
npm run test:e2e:ios

npm run build:e2e:android
npm run test:e2e:android
```

## Architecture

### JS/TS Layer (`src/`)

- **`src/index.tsx`** — Main entry point. Exports the `ViewShot` component (a `forwardRef` function component; the ref is the inner host `View` with a `capture()` method attached) and imperative functions `captureRef`, `captureScreen`, `releaseCapture`. Contains option validation logic (`validateOptions`).
- **`src/RNViewShot.ts`** — Re-exports the native module from `src/specs/NativeRNViewShot.ts`.
- **`src/RNViewShot.web.ts`** — Web implementation using `html2canvas-pro` (optional peer dependency, loaded lazily via dynamic `import()` on first capture). Metro resolves this file automatically for web targets.
- **`src/specs/NativeRNViewShot.ts`** — TurboModule spec (`Spec extends TurboModule`). Codegen config in `package.json` points here (`codegenConfig.jsSrcsDir`).
- **`src/__tests__/`** — Jest tests (jsdom, `react-native` mocked in `__mocks__/`).

The compiled output goes to `lib/` (gitignored). The `package.json` `"main"` field points to `lib/index.js` (for npm consumers) and `"react-native"` field points to `src/index.tsx` (for Metro bundler).

### Native Layer

**iOS** (`ios/`)

- `RNViewShot.mm` — Objective-C++ module. Implements `captureRef`, `captureScreen`, `releaseCapture`. Conditionally compiles for new arch (`#ifdef RCT_NEW_ARCH_ENABLED`). Uses `drawViewHierarchyInRect` (default) or `renderInContext` (via `useRenderInContext` option). Runs on the UI manager queue.
- `RNViewShot.h` — Header file.
- `PrivacyInfo.xcprivacy` — Privacy manifest, bundled by both the podspec and `Package.swift`.
- Distributed via CocoaPods (`react-native-view-shot.podspec`) and SwiftPM autolinking (`Package.swift`, new arch only).

**Android** (`android/`)

- `src/main/` — Implementation shared by both architectures.
- `src/paper/java/` — Hand-written `NativeRNViewShotSpec` for the old architecture (added to `sourceSets` only when `newArchEnabled` is not `true`; on new arch codegen generates it).
- `src/test/` — JUnit tests (Mockito).
- New arch is enabled via the `newArchEnabled` Gradle property, which applies the React plugin and triggers codegen.
- Key classes: `RNViewShotModule.java`, `RNViewShotPackage.java`, `ViewShot.java`.

**Windows** (`windows/`) — C# implementation, referenced via `react-native.config.cjs`. Unit tests in `windows/RNViewShot.Tests/`.

### Example App (`example/`)

A full React Native app demonstrating all features. Each feature has its own screen in `example/src/screens/`. The E2E tests (Detox, `example/e2e/tests/`) navigate between these screens, check on-screen results and take `device.takeScreenshot` artifacts.

Reference images live in `example/e2e/snapshots/reference/{ios,android}/` (platform-separated because rendering differs), but the current tests do not compare against them: `e2e/helpers/snapshot-matcher.js` is not used by any test and nothing reads `UPDATE_SNAPSHOTS`.

### Web Example App (`example-web/`)

A standalone web example using `react-native-web` + `html2canvas-pro` + webpack. Webpack alias resolves `react-native-view-shot` to `../src` (the local lib source). Also has Playwright E2E tests.

```bash
cd example-web
npm start              # webpack dev server on port 3000
npm run build          # Production build → dist/
npm run test:e2e       # Playwright tests (reference snapshots are Linux-only)
```

### Expo Example App (`example-expo/`)

An Expo (dev client) app consuming the library via `file:..`; `metro.config.js` blocks the root `node_modules` copies of `react`/`react-native`. Not built in CI.

### Windows Example App (`example-windows/`)

A React Native Windows example app (see `example-windows/README.md`).

### CI (`.github/workflows/`)

- `ci.yml` — lint/format/type-check/build/Jest, Android JUnit + APK build (new arch), podspec lint, iOS builds (CocoaPods and SwiftPM) + XCTest, Windows build + dotnet tests, iOS Detox (non-blocking), web build + Playwright. Android Detox is commented out.
- `build-apk.yml` — builds the example release APK.
- `rn-compat.yml` — weekly build of a fresh app at the `latest`/`next` react-native release; opens an "RN compat" issue with the result.

## Key Behaviors

- **Architecture detection**: `src/specs/NativeRNViewShot.ts` uses `TurboModuleRegistry.get<Spec>("RNViewShot") ?? NativeModules.RNViewShot` (TurboModule first, legacy `NativeModules` fallback).
- **Web platform**: Metro resolves `*.web.ts` files automatically; no explicit config needed.
- **`collapsable={false}`** is set automatically by the `ViewShot` component to prevent Android from collapsing the view before capture.
- **First layout wait**: `ViewShot` delays capture until the first `onLayout` event fires, avoiding zero-size captures.
- **Android E2E**: `example/android/gradle.properties` still sets `newArchEnabled=false` (a Detox workaround), but RN >= 0.82 (the example uses 0.84) no longer supports opting out of the new architecture; CI builds the APK with `-PnewArchEnabled=true`. Android Detox is disabled in CI; iOS is the primary E2E target.
