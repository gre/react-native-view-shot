/**
 * Helper functions for common Detox test actions
 */

/**
 * Navigate to a screen and wait for it to load
 * @param {string} buttonText - Text of the button to tap
 * @param {string} screenTitle - Expected title on the target screen
 * @param {number} timeout - Timeout in ms
 */
async function navigateToScreen(buttonText, screenTitle, timeout = 5000) {
  // Scroll to find the button if needed
  await scrollToElement(by.text(buttonText));

  await element(by.text(buttonText)).tap();

  await waitFor(element(by.text(screenTitle)))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Scroll to make an element visible
 * @param {Detox.Matcher} matcher - Element matcher
 * @param {string} scrollViewId - ID of the scroll view (optional)
 * @param {number} maxAttempts - Maximum scroll attempts
 */
async function scrollToElement(matcher, scrollViewId = null, maxAttempts = 10) {
  try {
    // First check if element is already visible
    await waitFor(element(matcher)).toBeVisible().withTimeout(1000);
    return true;
  } catch {
    // Element not visible, need to scroll
  }

  let attempts = 0;
  const direction = 'down';

  while (attempts < maxAttempts) {
    try {
      // Try to find element again
      await waitFor(element(matcher)).toBeVisible().withTimeout(500);
      return true;
    } catch {
      // Scroll to reveal more content
      if (scrollViewId) {
        await element(by.id(scrollViewId)).scroll(200, direction);
      } else {
        // Scroll the first scrollable element found
        await element(
          by.type(
            device.getPlatform() === 'ios'
              ? 'RCTScrollView'
              : 'android.widget.ScrollView',
          ),
        )
          .atIndex(0)
          .scroll(200, direction);
      }

      attempts++;
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  throw new Error(
    `Could not find element after ${maxAttempts} scroll attempts`,
  );
}

/**
 * Wait for element and tap, with automatic scrolling if needed
 * @param {Detox.Matcher} matcher - Element matcher
 * @param {number} _timeout - Timeout in ms
 */
async function scrollAndTap(matcher, _timeout = 5000) {
  await scrollToElement(matcher);
  await element(matcher).tap();
}

/**
 * Capture screenshot with automatic scroll to capture button
 * @param {string} buttonText - Text of the capture button
 * @param {string} successText - Expected success message
 * @param {number} timeout - Timeout in ms
 */
async function captureScreenshot(
  buttonText = '📸 Capture Screenshot',
  successText = 'Success!',
  timeout = 10000,
) {
  // Scroll to capture button if needed
  await scrollToElement(by.text(buttonText));

  // Tap capture button
  await element(by.text(buttonText)).tap();

  // Wait for success indication
  await waitFor(
    element(by.text(successText))
      .or(element(by.text('Screenshot saved')))
      .or(element(by.text('Captured successfully'))),
  )
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Dismiss alert/dialog if present
 * @param {string[]} buttonTexts - Possible button texts to dismiss (e.g., 'OK', 'Close')
 */
async function dismissAlert(buttonTexts = ['OK', 'Close', 'Dismiss']) {
  for (const text of buttonTexts) {
    try {
      const exists = await element(by.text(text)).exists();
      if (exists) {
        await element(by.text(text)).tap();
        await new Promise(resolve => setTimeout(resolve, 300));
        return true;
      }
    } catch {
      // Button not found, continue
    }
  }
  return false;
}

/**
 * Go back to home screen
 * @param {string} homeTitle - Expected title on home screen
 */
async function goHome(homeTitle = '🚀 React Native ViewShot') {
  // Check if already on home screen
  try {
    await waitFor(element(by.text(homeTitle)))
      .toBeVisible()
      .withTimeout(1000);
    return; // Already on home screen
  } catch {
    // Not on home screen, navigate back
  }

  if (device.getPlatform() === 'ios') {
    // iOS: Navigate back using navigation
    try {
      await element(by.type('_UIBackButtonContainerView')).atIndex(0).tap();
    } catch {
      // Fallback: press back
      await device.pressBack();
    }
  } else {
    // Android: Use back button
    await device.pressBack();
  }

  await waitFor(element(by.text(homeTitle)))
    .toBeVisible()
    .withTimeout(5000);
}

/**
 * Wait for any loading indicators to disappear
 * @param {number} timeout - Max wait time in ms
 */
async function waitForLoadingComplete(timeout = 10000) {
  const loadingIndicators = [
    'Loading...',
    'Please wait...',
    'ActivityIndicator',
  ];

  for (const indicator of loadingIndicators) {
    try {
      await waitFor(element(by.text(indicator)))
        .not.toBeVisible()
        .withTimeout(timeout);
    } catch {
      // Indicator might not exist, which is fine
    }
  }
}

/**
 * Scroll to bottom of screen
 * @param {string} scrollViewId - ID of scroll view (optional)
 * @param {number} distance - Distance to scroll in pixels
 */
async function scrollToBottom(scrollViewId = null, distance = 500) {
  if (scrollViewId) {
    await element(by.id(scrollViewId)).scroll(distance, 'down');
  } else {
    const scrollViewType =
      device.getPlatform() === 'ios'
        ? 'RCTScrollView'
        : 'android.widget.ScrollView';
    await element(by.type(scrollViewType)).atIndex(0).scroll(distance, 'down');
  }
  await new Promise(resolve => setTimeout(resolve, 500)); // Wait for scroll to complete
}

/**
 * Scroll to top of screen
 * @param {string} scrollViewId - ID of scroll view (optional)
 * @param {number} distance - Distance to scroll in pixels
 */
async function scrollToTop(scrollViewId = null, distance = 500) {
  if (scrollViewId) {
    await element(by.id(scrollViewId)).scroll(distance, 'up');
  } else {
    const scrollViewType =
      device.getPlatform() === 'ios'
        ? 'RCTScrollView'
        : 'android.widget.ScrollView';
    await element(by.type(scrollViewType)).atIndex(0).scroll(distance, 'up');
  }
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Take a reference screenshot for visual regression testing
 * @param {string} testName - Name for the screenshot
 */
async function takeReferenceScreenshot(testName) {
  const sanitized = testName.replace(/[^a-zA-Z0-9-]/g, '_');
  await device.takeScreenshot(sanitized);
  console.log(`📸 Reference screenshot taken: ${sanitized}`);
}

/**
 * Verify an element is visible after scrolling if needed
 * @param {Detox.Matcher} matcher - Element matcher
 * @param {number} timeout - Timeout in ms
 */
async function verifyElementVisible(matcher, timeout = 5000) {
  try {
    // First try without scrolling
    await waitFor(element(matcher)).toBeVisible().withTimeout(1000);
  } catch {
    // If not visible, try scrolling
    await scrollToElement(matcher);
    await waitFor(element(matcher)).toBeVisible().withTimeout(timeout);
  }
}

module.exports = {
  navigateToScreen,
  scrollToElement,
  scrollAndTap,
  captureScreenshot,
  dismissAlert,
  goHome,
  waitForLoadingComplete,
  scrollToBottom,
  scrollToTop,
  takeReferenceScreenshot,
  verifyElementVisible,
};
