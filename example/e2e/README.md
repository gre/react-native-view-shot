# E2E testing with Detox

The native example has Detox scenarios for capture formats, media, scrolling,
modals and style filters. A successful app build is not proof that these
interactive or visual checks pass.

## Current CI configuration

- Detox runs in the `ios` job of `ci.yml` and is blocking: a failing scenario
  or snapshot mismatch fails CI. It pins Xcode 16.4 and the `iPhone 16 Pro`
  simulator on the iOS runtime pinned by `IOS_SIMULATOR_OS` in ci.yml (26.2),
  which the iOS references were produced with. The job boots that
  simulator, installs the app once and runs `detox test --reuse` with
  `IOS_SIMULATOR_UDID` set, so Detox doesn't reinstall the app per test file.
- Android Detox does not run in `.github/workflows/ci.yml`. Android
  library unit tests and the example APK build still run; they do not exercise
  the Detox scenarios.
- The Android example runs RN 0.88, where the new architecture can no longer be
  disabled (`newArchEnabled=true` in `android/gradle.properties`).

## Run locally

Install and build the library and example dependencies first. Start Metro from
`example/` in a separate terminal, then build and run the matching Detox target:

```bash
cd example
npm run build:e2e:ios
npm run test:e2e:ios
```

```bash
cd example
npm run build:e2e:android
npm run test:e2e:android
```

`.detoxrc.js` defines the simulator/emulator names and binary paths. Set
`IOS_SIMULATOR` or `ANDROID_AVD_NAME` to select an installed device. Android
setup or runtime failures must be resolved before claiming Android E2E coverage.

## Configuration and helpers

- `e2e/jest.config.js`: test discovery, timeout, Detox environment and reporters.
- `e2e/test-config.js`: platform timeouts and expected content.
- `e2e/setup.js`: shared navigation, capture and logging helpers.
- `e2e/helpers/`: screenshot comparison and interaction helpers.
- `e2e/tests/`: the actual scenario assertions.

## Snapshots

Tests compare an element screenshot of the on-screen capture preview
(`testID="capture-preview"`) with `e2e/snapshots/reference/<platform>/<name>.png`
using `e2e/helpers/snapshot-matcher.js` (pixelmatch, per-pixel threshold 0.1,
at most 0.1% differing pixels). Full Screen, Video and SVG URI only assert that
the capture succeeds (scroll position, playback timing, network).

- Mismatch or missing reference: the test fails and writes `<name>.actual.png`
  (and `<name>.diff.png`) to `e2e/snapshots/output/<platform>/`. CI uploads
  them in the `detox-screenshots-ios` artifact.
- Update references: `npm run test:e2e:ios:update-snapshots`. References only
  match the simulator/Xcode that produced them, so take iOS references from
  the CI artifact (rename `<name>.actual.png` to `<name>.png`) rather than from
  a different local setup. Review every image change before committing it.
