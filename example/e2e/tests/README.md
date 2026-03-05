# 📸 ViewShot E2E Tests

Comprehensive end-to-end tests for react-native-view-shot with snapshot validation.

## 📁 Directory Structure

```
e2e/
├── tests/                          # Test files
│   ├── viewshot-with-validation.test.js  # Main test suite with snapshot validation
│   └── README.md                   # This file
├── helpers/                        # Test helper utilities
│   ├── snapshot-matcher.js         # Snapshot comparison and validation
│   └── test-actions.js             # Common Detox actions (scroll, tap, navigate)
├── snapshots/
│   ├── reference/                  # Reference snapshots (golden images)
│   └── output/                     # Output snapshots from test runs
└── setup.js                        # Detox setup configuration
```

## 🚀 Running Tests

### Prerequisites

1. **iOS**: Xcode installed, iOS simulator available
2. **Android**: Android Studio, emulator running
3. **Dependencies**: Run `npm install` in the example directory

### Run Tests

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android

# Build first (if needed)
npm run build:e2e:ios
npm run build:e2e:android
```

## 📸 Snapshot Testing

### How It Works

1. **First Run**: Tests capture screenshots and save them as output
2. **Create References**: Run with `UPDATE_SNAPSHOTS=true` to create reference snapshots
3. **Validation**: Subsequent runs compare output against reference snapshots
4. **Results**: Tests report if snapshots match or differ

### Create Reference Snapshots

```bash
# iOS
UPDATE_SNAPSHOTS=true npm run test:e2e:ios

# Android
UPDATE_SNAPSHOTS=true npm run test:e2e:android
```

This will save all captured screenshots as reference images in `e2e/snapshots/reference/`.

### Normal Test Run (with validation)

```bash
npm run test:e2e:ios
```

Tests will:

- ✅ Capture screenshots
- 📊 Compare with references
- ✅/❌ Report matches/differences

## 🎯 Test Features

### Automatic Scrolling

Tests automatically scroll to find elements:

```javascript
// This will scroll until the button is found
await navigateToScreen('Basic ViewShot', '📸 Basic ViewShot Test');
```

### Snapshot Validation

```javascript
// Capture and validate against reference
const result = await snapshotMatcher.captureAndValidate(
  'test_name',
  null,
  UPDATE_REFERENCES,
);

if (!UPDATE_REFERENCES && result.matched !== null) {
  expect(result.matched).toBe(true);
}
```

### Smart Element Detection

Tests scroll down to ensure capture buttons and results are visible:

```javascript
// Scroll to bottom to see capture button
await scrollToBottom();

// Capture screenshot
await captureScreenshot('📸 Capture Screenshot', 'Success!');

// Scroll to see the captured preview
await scrollToBottom();
await device.sleep(500);
```

## 📋 Test Coverage

### 🟢 Basic Tests

- ✅ Basic ViewShot capture
- ✅ Full screen capture
- ✅ Transparency handling
- ✅ File system operations

### 🟡 Media Tests

- ✅ Video frame capture
- ✅ Image format variations (PNG/JPG)
- ✅ WebView content capture

### 🟠 Advanced Tests

- ✅ SVG inline rendering
- ✅ SVG from URI
- ✅ Modal capture

### 🔄 Edge Cases

- ✅ Multiple rapid captures
- ✅ State persistence after reload

## 🛠️ Troubleshooting

### Tests fail to find elements

**Solution**: Elements might be off-screen. The test helpers automatically scroll, but you may need to adjust scroll distances:

```javascript
// Increase scroll distance
await scrollToBottom(null, 800); // Scroll 800px instead of default 500px
```

### Snapshots don't match

**Possible causes**:

1. Legitimate UI changes → Update references with `UPDATE_SNAPSHOTS=true`
2. Timing issues → Increase wait times before capturing
3. Different screen sizes → Ensure consistent simulator/emulator

**Solution**:

```bash
# Update reference snapshots
UPDATE_SNAPSHOTS=true npm run test:e2e:ios
```

### Capture button not visible

**Solution**: Ensure you scroll to the bottom before tapping:

```javascript
await scrollToBottom();
await captureScreenshot('📸 Capture Screenshot', 'Success!');
```

### Preview image not visible after capture

**Solution**: Scroll down after capture to see the preview:

```javascript
await captureScreenshot('📸 Capture Screenshot', 'Success!');
await device.sleep(1000); // Wait for preview to render
await scrollToBottom(); // Scroll to see it
```

## 📊 Snapshot Comparison

The snapshot matcher performs:

1. **Size Check**: Compares image file sizes
2. **Byte Comparison**: Checks for pixel differences
3. **Tolerance**: Allows 1% difference to account for minor rendering variations

To improve comparison accuracy, consider integrating:

- **pixelmatch**: Pixel-level image comparison
- **looks-same**: Visual regression testing
- **jimp**: Image processing and comparison

## 🧹 Cleanup

Old snapshots are automatically cleaned up after tests:

```javascript
// Keep last 10 snapshots per test
snapshotMatcher.cleanup(10);
```

Manual cleanup:

```bash
# Remove all output snapshots
rm -rf e2e/snapshots/output/*

# Remove reference snapshots (careful!)
rm -rf e2e/snapshots/reference/*
```

## 📝 Writing New Tests

```javascript
it('should test new feature', async () => {
  // 1. Navigate to screen
  await navigateToScreen('Feature Name', '🎯 Feature Screen');

  // 2. Scroll to ensure content is visible
  await scrollToBottom();

  // 3. Perform action
  await captureScreenshot('📸 Capture Feature', 'Success!');

  // 4. Wait for result
  await device.sleep(1000);
  await scrollToBottom();

  // 5. Validate snapshot
  const result = await snapshotMatcher.captureAndValidate(
    'feature_name_after_capture',
    null,
    UPDATE_REFERENCES,
  );

  if (!UPDATE_REFERENCES && result.matched !== null) {
    expect(result.matched).toBe(true);
  }

  // 6. Cleanup
  await dismissAlert();
  await goHome();
});
```

## 🎯 Best Practices

1. **Always scroll**: UI elements might be off-screen on smaller devices
2. **Wait for loading**: Use `device.sleep()` after navigation and captures
3. **Scroll to see results**: Preview images often appear below the fold
4. **Dismiss alerts**: Always dismiss success alerts before next action
5. **Go home**: Return to home screen after each test for consistency
6. **Update references**: When UI legitimately changes, update references
7. **Check artifacts**: Failed tests save screenshots to `artifacts/` directory

## 📈 Performance

- Average test duration: **30-60 seconds per test**
- Full suite: **10-15 minutes** (depending on platform)
- Snapshot comparison: **< 100ms per snapshot**

## 🔗 Related Documentation

- [Detox Documentation](https://wix.github.io/Detox/)
- [react-native-view-shot API](../../README.md)
- [Test Configuration](./.detoxrc.js)
