# E2E Testing with Detox

## Status

### ✅ iOS - Production Ready

- **All 10 test scenarios passing**
- Runs in CI via GitHub Actions
- Comprehensive coverage of all ViewShot features
- Robust navigation and error handling

### 🚧 Android - Build Working, Runtime Issue

- **APK builds:** ✅ Both debug and test APKs build successfully
- **libfbjni.so fix:** ✅ Duplicate library conflicts resolved
- **Detox runtime:** ❌ Crashes on launch with `NullPointerException` in `NetworkIdlingResource`

## Running Tests

### iOS

```bash
cd example
npm run test:e2e:ios
```

### Android (Build Only)

```bash
cd example/android
./gradlew assembleDebug assembleAndroidTest
```

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

### Android Detox Runtime

The Android Detox tests crash at launch with:

```
java.lang.NullPointerException
  at com.wix.detox.reactnative.idlingresources.network.NetworkIdlingResource.<init>
```

**Root Cause:** Compatibility issue between Detox 20.x and React Native 0.81 with Fabric (New Architecture).

**Workarounds Attempted:**

- ✅ Fixed libfbjni.so duplicates (builds now work)
- ✅ Increased timeouts
- ❌ Disabling network sync (API not available)
- ❌ Using black-box mode (still requires test APK)

**Recommended Path Forward:**

1. Use iOS Detox for CI/CD (fully working)
2. Manual testing for Android features
3. Wait for Detox 21.x or React Native 0.82+ with better Fabric support

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

iOS tests run automatically in GitHub Actions:

- On every PR
- On push to main
- Results published as artifacts

To enable Android Detox in CI, the runtime issue must be resolved first.
