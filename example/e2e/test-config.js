/**
 * E2E Test Configuration for React Native ViewShot
 *
 * This file defines test priorities, timeouts, and configurations
 * for comprehensive end-to-end testing of all ViewShot features.
 */

export const TEST_CONFIG = {
  // Global timeouts
  TIMEOUTS: {
    APP_LAUNCH: 15000,
    SCREEN_LOAD: 8000,
    CAPTURE_OPERATION: 12000,
    NETWORK_LOAD: 20000,
    MODAL_ANIMATION: 3000,
    ALERT_APPEAR: 5000,
  },

  // Test priorities for CI optimization
  PRIORITIES: {
    CRITICAL: [
      'Basic ViewShot functionality',
      'Full Screen capture',
      'Navigation flow',
      'App stability',
    ],
    HIGH: [
      'Image formats (PNG/JPG)',
      'File system operations',
      'Transparency handling',
      'Error recovery',
    ],
    MEDIUM: [
      'Video capture',
      'WebView capture',
      'SVG rendering',
      'Modal capture',
      'Performance tests',
    ],
    LOW: [
      'Advanced configurations',
      'Edge cases',
      'Platform-specific features',
    ],
  },

  // Platform-specific configurations
  PLATFORMS: {
    ios: {
      webViewLoadTime: 4000,
      videoLoadTime: 3000,
      captureTimeout: 10000,
      specificFeatures: ['iOS WebView rendering', 'Metal rendering'],
    },
    android: {
      webViewLoadTime: 5000,
      videoLoadTime: 4000,
      captureTimeout: 12000,
      specificFeatures: ['GL surface handling', 'Hardware acceleration'],
    },
  },

  // Test data and expected behaviors
  EXPECTED_ELEMENTS: {
    homeScreen: {
      title: '🚀 React Native ViewShot',
      subtitle: 'New Architecture Test Suite',
      architecture: '✅ Fabric + TurboModules',
      categories: ['🟢 BASIC TESTS', '🟡 MEDIA TESTS', '🟠 ADVANCED TESTS'],
    },
    basicTests: [
      'Basic ViewShot',
      'Full Screen',
      'Transparency',
      'File System',
    ],
    mediaTests: ['Video Capture', 'Image Capture', 'WebView Capture'],
    advancedTests: ['SVG Inline', 'SVG URI', 'Modal'],
  },

  // Success indicators for different operations
  SUCCESS_INDICATORS: {
    capture: ['Success!', 'Screenshot saved', 'captured', 'saved'],
    navigation: ['Test', 'Capture', 'ViewShot'],
    error: ['Error', 'Failed', 'Unable to'],
    loading: ['Loading', 'Wait', 'Processing'],
  },

  // Performance benchmarks
  PERFORMANCE: {
    maxCaptureTime: 10000,
    maxScreenLoadTime: 5000,
    maxMemoryUsage: '100MB', // Platform dependent
    minSuccessRate: 0.95,
  },
};

// Helper functions for test configuration
export const getTimeoutForOperation = operation => {
  return TEST_CONFIG.TIMEOUTS[operation.toUpperCase()] || 5000;
};

export const getPlatformConfig = platform => {
  return TEST_CONFIG.PLATFORMS[platform] || TEST_CONFIG.PLATFORMS.android;
};

export const isHighPriorityTest = testName => {
  return (
    TEST_CONFIG.PRIORITIES.CRITICAL.some(priority =>
      testName.toLowerCase().includes(priority.toLowerCase()),
    ) ||
    TEST_CONFIG.PRIORITIES.HIGH.some(priority =>
      testName.toLowerCase().includes(priority.toLowerCase()),
    )
  );
};

export const getExpectedSuccessIndicators = () => {
  return TEST_CONFIG.SUCCESS_INDICATORS.capture;
};

export default TEST_CONFIG;
