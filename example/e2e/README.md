# E2E testing with Detox

The native example has Detox scenarios for capture formats, media, scrolling,
modals and style filters. A successful app build is not proof that these
interactive or visual checks pass.

## Current CI configuration

- The iOS Detox job runs after the iOS build, but its test step is non-blocking
  (`continue-on-error: true`). The workflow records known reporter and
  snapshot-content-container/style-filter failures. Inspect test results and
  screenshots rather than treating a green workflow as an all-tests-pass result.
- Android Detox jobs are commented out in `.github/workflows/ci.yml`. Android
  library unit tests and the example APK build still run; they do not exercise
  the Detox scenarios.
- The Android example enables the new architecture. Do not disable Fabric based
  on older setup guidance without checking the installed React Native version.
- Several existing scenarios treat missing success text as best-effort, and the
  snapshot helper compares compressed file sizes/bytes rather than decoded
  pixels. These checks do not establish pixel-level rendering correctness.

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

## Review snapshots

Native references are separated under `e2e/snapshots/reference/ios/` and
`e2e/snapshots/reference/android/` because rendering differs by platform.
To intentionally regenerate references, set `UPDATE_SNAPSHOTS=true` on the
matching test command, then review every image change before committing it.
Do not regenerate references merely to hide a regression.

The iOS CI job uploads `detox-screenshots-ios` and `detox-test-results-ios`.
These are diagnostic artifacts, not an automatically approved set of replacement
reference images. Check `.github/workflows/ci.yml` for the current artifact paths.
