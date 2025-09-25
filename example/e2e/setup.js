/**
 * E2E Test Setup for React Native ViewShot
 *
 * Global setup and utilities for Detox E2E tests
 */

// Import test configuration
const TEST_CONFIG = require('./test-config').default;

// Global test utilities
global.TEST_CONFIG = TEST_CONFIG;

// Helper function to wait for element with custom timeout
global.waitForElementWithTimeout = async (element, timeout = 5000) => {
  return await waitFor(element).toBeVisible().withTimeout(timeout);
};

// Helper function to safely tap elements
global.safeTap = async (elementMatcher, timeout = 5000) => {
  try {
    await waitFor(element(elementMatcher)).toBeVisible().withTimeout(timeout);

    await element(elementMatcher).tap();
    return true;
  } catch {
    console.warn('Failed to tap element');
    return false;
  }
};

// Helper function to dismiss alerts
global.dismissAlert = async () => {
  try {
    if (await element(by.text('OK')).exists()) {
      await element(by.text('OK')).tap();
    }
  } catch {
    // Alert might not exist, ignore
  }
};

// Helper function to navigate back safely
global.safeNavigateBack = async () => {
  try {
    await device.pressBack();

    // Wait for home screen to appear
    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(5000);
  } catch (error) {
    console.warn(`Navigation back failed: ${error.message}`);
    // Try to reload app as fallback
    await device.reloadReactNative();
  }
};

// Helper function to capture screenshot with retry
global.captureWithRetry = async (buttonText, maxRetries = 2) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await element(by.text(buttonText)).tap();

      await waitFor(element(by.text('Success!')))
        .toBeVisible()
        .withTimeout(12000);

      await global.dismissAlert();
      return true;
    } catch (error) {
      console.warn(`Capture attempt ${attempt + 1} failed: ${error.message}`);

      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Brief pause before retry
      await device.sleep(1000);
    }
  }

  return false;
};

// Helper function to test navigation to screen
global.navigateToTest = async (testName, expectedScreenTitle) => {
  await element(by.text(testName)).tap();

  await waitFor(element(by.text(expectedScreenTitle)))
    .toBeVisible()
    .withTimeout(8000);
};

// Helper function to check if running on specific platform
global.isAndroid = () => device.getPlatform() === 'android';
global.isIOS = () => device.getPlatform() === 'ios';

// Platform-specific timeouts
global.getPlatformTimeout = operation => {
  const platform = device.getPlatform();
  const config =
    TEST_CONFIG.PLATFORMS[platform] || TEST_CONFIG.PLATFORMS.android;

  switch (operation) {
    case 'webview':
      return config.webViewLoadTime;
    case 'video':
      return config.videoLoadTime;
    case 'capture':
      return config.captureTimeout;
    default:
      return 5000;
  }
};

// Test data helpers
global.getExpectedElements = () => TEST_CONFIG.EXPECTED_ELEMENTS;
global.getSuccessIndicators = () => TEST_CONFIG.SUCCESS_INDICATORS.capture;

// Performance monitoring
global.measureCaptureTime = async captureFunction => {
  const startTime = Date.now();

  try {
    await captureFunction();
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`Capture completed in ${duration}ms`);

    // Log warning if capture took too long
    if (duration > TEST_CONFIG.PERFORMANCE.maxCaptureTime) {
      console.warn(
        `Capture took ${duration}ms, exceeding max time of ${TEST_CONFIG.PERFORMANCE.maxCaptureTime}ms`,
      );
    }

    return duration;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error(`Capture failed after ${duration}ms: ${error.message}`);
    throw error;
  }
};

// Setup logging for better debugging
const originalLog = console.log;
console.log = (...args) => {
  const timestamp = new Date().toISOString();
  originalLog(`[${timestamp}]`, ...args);
};

// Global error handler for better debugging
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Test environment info
console.log('🚀 E2E Test Setup Complete');

module.exports = {
  TEST_CONFIG,
  waitForElementWithTimeout: global.waitForElementWithTimeout,
  safeTap: global.safeTap,
  dismissAlert: global.dismissAlert,
  safeNavigateBack: global.safeNavigateBack,
  captureWithRetry: global.captureWithRetry,
  navigateToTest: global.navigateToTest,
  measureCaptureTime: global.measureCaptureTime,
  isAndroid: global.isAndroid,
  isIOS: global.isIOS,
  getPlatformTimeout: global.getPlatformTimeout,
};
