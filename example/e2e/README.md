# E2E Testing with Detox

## Status

### ✅ iOS - Production Ready

- **All 10 test scenarios passing**
- Runs in CI via GitHub Actions
- Comprehensive coverage of all ViewShot features
- Robust navigation and error handling

### 🚧 Android - Working with Known Issues

- **APK builds:** ✅ Both debug and test APKs build successfully
- **libfbjni.so fix:** ✅ Duplicate library conflicts resolved
- **Detox runtime:** ✅ App launches without Fabric crashes (newArchEnabled=false)
- **Test execution:** ⚠️ Tests run but have element detection issues
  - Button testIDs not always detected by Detox
  - Screen navigation sometimes fails
  - App occasionally crashes between tests

## Running Tests

### iOS (Fully Working)

```bash
cd example
npm run test:e2e:ios
```

To update iOS reference snapshots:

```bash
cd example
UPDATE_SNAPSHOTS=true npm run test:e2e:ios
```

### Android (Working with Issues)

```bash
cd example
npm run test:e2e:android
```

To update Android reference snapshots:

```bash
cd example
UPDATE_SNAPSHOTS=true npm run test:e2e:android
```

**Note:** Android tests may fail intermittently due to element detection issues. See "Known Issues" section below.

## Test Coverage

All tests cover the same scenarios on both platforms:

### Basic Tests

1. Basic ViewShot - Simple view capture
2. Full Screen - Full screen capture
3. Transparency - Alpha channel handling
4. File System - Save to device storage

### Media Tests

5. Video - Video player capture
6. Image - Image component capture
7. WebView - WebView content capture

### Advanced Tests

8. SVG Inline - Inline SVG rendering
9. SVG URI - SVG from URI
10. Modal - Modal overlay capture

## Known Issues

### Android Detox Element Detection

Android tests run but have intermittent element detection issues:

**Problems:**

- `testID` attributes not always detected by Detox on Android
- `by.text()` matchers sometimes fail with emoji-containing text
- App crashes with "No activities found" after some test failures
- Navigation between screens can fail intermittently

**Root Causes:**

1. **testID mapping:** React Native Android doesn't automatically map `testID` to accessibility identifiers like iOS does
2. **Emoji rendering:** Android text matching with emojis is unreliable
3. **Activity lifecycle:** React Native Android activity can be destroyed between tests

**Fixes Applied:**

- ✅ Added `accessible={true}` and `accessibilityLabel` to buttons
- ✅ Disabled Fabric (`newArchEnabled=false`) to avoid Detox crashes
- ✅ Increased Detox timeouts for React Native initialization
- ✅ Fixed libfbjni.so duplicate library conflicts

**Recommended Actions:**

1. Use iOS Detox for primary CI/CD validation (fully stable)
2. Run Android Detox tests as supplementary checks
3. Consider adding more explicit testIDs to all interactive elements
4. Investigate using `by.id()` with resource IDs instead of text matchers

## Android Build Fix

The key fix for Android APK builds is in `example/android/app/build.gradle`:

```gradle
afterEvaluate {
    tasks.matching {
        it.name.contains('mergeDebugAndroidTest') &&
        it.name.contains('JniLibFolders')
    }.configureEach {
        doFirst {
            def gestureHandlerDir = file("${projectDir}/../../node_modules/react-native-gesture-handler/android/build/intermediates/library_jni/debug")
            if (gestureHandlerDir.exists()) {
                gestureHandlerDir.eachFileRecurse { file ->
                    if (file.name == 'libfbjni.so') {
                        file.delete()
                    }
                }
            }
        }
    }
}
```

This removes duplicate `libfbjni.so` files from `react-native-gesture-handler` before the merge step, allowing the test APK to build successfully.

## Configuration Files

- `.detoxrc.js` - Detox configuration for both platforms
- `jest.config.js` - Jest test runner configuration
- `setup.js` - Global test helpers and utilities
- `test-config.js` - Platform-specific timeouts and settings

## Helpers

### Navigation

- `navigateToTest(testName)` - Navigate to a test screen
- `safeNavigateBack()` - Go back with error handling
- `scrollToButton(buttonId)` - Smart scrolling to find buttons

### Actions

- `safeTap(elementId)` - Tap with visibility check
- `captureWithRetry(buttonId)` - Capture with retries
- `waitForElementWithTimeout(element, timeout)` - Wait for element

### Validation

- `SnapshotMatcher` - Image comparison with tolerance
- **Platform-specific snapshots** - Separate reference images for iOS/Android
- Platform-specific timeouts (`getPlatformTimeout`)
- Auto-capture detection and handling

## Snapshot Testing

### Platform-Specific References

Screenshot references are **separated by platform** to account for rendering differences:

```
snapshots/
  ├── reference/
  │   ├── ios/           # iOS reference images
  │   │   ├── basic_viewshot.png
  │   │   ├── fullscreen_viewshot.png
  │   │   └── ...
  │   └── android/       # Android reference images
  │       ├── basic_viewshot.png
  │       └── ...
  └── output/            # Test outputs (gitignored)
      ├── ios/
      └── android/
```

**Why separate?** iOS and Android render differently:

- Different fonts and antialiasing
- Different native components
- Different screen densities

### Updating Reference Images

To regenerate reference images for a platform:

```bash
# iOS
cd example
UPDATE_SNAPSHOTS=true npm run test:e2e:ios

# Android (when working)
UPDATE_SNAPSHOTS=true npm run test:e2e:android
```

This will save new screenshots to `snapshots/reference/{platform}/`.

## CI Integration

iOS and Android tests run automatically in GitHub Actions:

**When snapshots differ:**

- The CI will show a clear message in the GitHub Actions summary
- Download the `detox-snapshots-ios` or `detox-snapshots-android` artifact
- Replace `example/e2e/snapshots/reference/` with the downloaded files
- Commit the updated snapshots

**Artifacts available:**

- `detox-snapshots-ios`: iOS reference snapshots (30 days)
- `detox-snapshots-android`: Android reference snapshots (30 days)
- `detox-test-results-ios`: iOS test results (7 days)
- `detox-test-results-android`: Android test results (7 days)

iOS tests run automatically in GitHub Actions:

- On every PR
- On push to main
- Results published as artifacts

To enable Android Detox in CI, the runtime issue must be resolved first.
