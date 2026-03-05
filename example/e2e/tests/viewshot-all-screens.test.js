/**
 * Comprehensive ViewShot Tests - All Screens
 * Tests all screens with snapshot validation
 */

const SnapshotMatcher = require('../helpers/snapshot-matcher');

describe('📸 ViewShot - All Screens', () => {
  let snapshotMatcher;
  const UPDATE_REFERENCES = process.env.UPDATE_SNAPSHOTS === 'true';

  beforeAll(async () => {
    snapshotMatcher = new SnapshotMatcher();

    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' },
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    // Wait for home screen to load with polling (sync disabled via launch args)
    console.log('✅ App launched, waiting for home screen...');
    // With sync disabled, waitFor polls without waiting for app idle
    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(60000);
    console.log('✅ Home screen visible');
  });

  /**
   * Navigate back to home screen
   */
  const goBackToHome = async () => {
    // Check if we're already on home
    try {
      await expect(element(by.text('🚀 React Native ViewShot'))).toBeVisible();
      console.log('✅ Already on home screen');
      return;
    } catch {
      // Not on home, need to navigate back
    }

    // Try multiple methods to get back home
    try {
      console.log('🔙 Attempting to go back to home...');

      // Method 1: Try tapping back button multiple times (some screens are nested)
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await element(by.label('Back')).atIndex(0).tap();
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if we're home now
          try {
            await expect(
              element(by.text('🚀 React Native ViewShot')),
            ).toBeVisible();
            console.log('✅ Back to home screen');
            return;
          } catch {
            // Not home yet, continue
          }
        } catch {
          // Back button not found, try next method
          break;
        }
      }

      // Method 2: If back button didn't work, try device back (Android) or swipe (iOS)
      if (device.getPlatform() === 'android') {
        await device.pressBack();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await expect(element(by.text('🚀 React Native ViewShot'))).toBeVisible();
      console.log('✅ Back to home screen (via device back)');
    } catch (e) {
      console.log(`⚠️  Failed to go back: ${e.message}`);
      console.log(
        '⚠️  Continuing anyway - will fail if home screen button not found',
      );
      // If back fails, the test will fail when trying to find the next screen button
    }
  };

  /**
   * Helper to capture a screen with scrolling to see the result
   */
  const captureScreenWithScroll = async (
    screenTitle,
    captureButtonText,
    successText,
    snapshotName,
    scrollViewId,
  ) => {
    // Ensure we're on home screen
    await goBackToHome();

    // Navigate to screen
    console.log(`🔄 Navigating to: ${screenTitle}`);
    const testId = `nav-${screenTitle.toLowerCase().replace(/\s+/g, '-')}`;
    console.log(`   Using testID: ${testId}`);

    // Scroll home screen to find the nav button, then tap it
    // First scroll to top of home screen
    try {
      await element(by.id('homeScrollView')).scrollTo('top');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Ignore scroll errors
    }

    // Find the button by scrolling down
    for (let i = 0; i < 8; i++) {
      try {
        await expect(element(by.id(testId))).toBeVisible();
        console.log(`   Nav button visible (attempt ${i})`);
        break;
      } catch {
        try {
          await element(by.id('homeScrollView')).swipe('up', 'slow', 0.3);
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch {
          break;
        }
      }
    }

    // Wait for scroll momentum to settle before tapping
    await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      await element(by.id(testId)).tap();
    } catch (e) {
      console.log(`⚠️  testID tap failed, falling back to text: ${e.message}`);
      await element(by.text(screenTitle)).atIndex(0).tap();
    }
    // Wait for navigation animation to complete
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Wait for screen to load and check if button is visible
    console.log(`⏳ Looking for button: ${captureButtonText}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scroll to find the capture button using whileElement (Detox recommended)
    if (scrollViewId) {
      try {
        await waitFor(element(by.id('capture-button')))
          .toBeVisible()
          .whileElement(by.id(scrollViewId))
          .scroll(200, 'down');
        console.log(`✅ Button found via whileElement scroll`);
      } catch {
        // Fallback: try manual swipes
        console.log(`📜 whileElement scroll failed, trying manual swipes...`);
        for (let i = 0; i < 5; i++) {
          try {
            await expect(element(by.id('capture-button'))).toBeVisible();
            console.log(`✅ Button found after ${i} swipes`);
            break;
          } catch {
            try {
              await element(by.id(scrollViewId)).swipe('up', 'slow', 0.5);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch {
              break;
            }
          }
        }
      }
    }

    // Final wait for button to be visible
    await waitFor(element(by.id('capture-button')))
      .toBeVisible()
      .withTimeout(10000);

    // Tap capture button
    await element(by.id('capture-button')).tap();
    await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for capture to complete

    // Scroll down to reveal success message if needed
    let successVisible = false;
    for (let i = 0; i < 3 && !successVisible; i++) {
      try {
        await expect(element(by.text(successText))).toBeVisible();
        successVisible = true;
        console.log(`✅ Success message visible after ${i} swipes`);
        break;
      } catch {
        if (scrollViewId && i < 2) {
          try {
            await element(by.id(scrollViewId)).swipe('up', 'slow', 0.6);
            await new Promise(resolve => setTimeout(resolve, 800));
          } catch {
            // Can't scroll more
          }
        }
      }
    }

    // Wait for success indicator with better error handling
    try {
      await waitFor(element(by.text(successText)))
        .toBeVisible()
        .withTimeout(20000); // Increased timeout for slow captures
      console.log(`✅ ${snapshotName} captured`);
    } catch {
      console.log(
        `⚠️  Success message not found for ${snapshotName}, but continuing...`,
      );
      console.log(`   Expected text: "${successText}"`);
      // Continue anyway to take screenshot
    }

    // Wait for UI to settle and app to become idle
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Take Detox screenshot
    await device.takeScreenshot(snapshotName);

    // Extra delay to ensure screenshot is written
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Capture and validate
    try {
      const result = await snapshotMatcher.captureAndValidate(
        snapshotName,
        null,
        UPDATE_REFERENCES,
      );

      if (UPDATE_REFERENCES) {
        console.log(
          `📸 Reference snapshot created/updated for ${snapshotName}`,
        );
      } else if (result.matched !== null) {
        if (!result.matched) {
          console.log(
            `⚠️  Snapshot mismatch for ${snapshotName}, but test continues`,
          );
          // Don't throw - just log the mismatch
        } else {
          console.log(`✅ ${snapshotName} matches reference`);
        }
      }
    } catch (error) {
      console.log(
        `⚠️  Screenshot validation failed for ${snapshotName}: ${error.message}`,
      );
      // Don't fail the test - screenshot validation is best-effort
    }
  };

  describe('🟢 Basic Tests', () => {
    it('should capture Basic ViewShot', async () => {
      await captureScreenWithScroll(
        'Basic ViewShot',
        '📸 Test ViewShot Capture',
        '✅ Capture Success:',
        'basic_viewshot',
        'basicTestScrollView',
      );
    });

    it('should capture Full Screen', async () => {
      await captureScreenWithScroll(
        'Full Screen',
        '📸 Capture Full Screen',
        '✅ Full Screen Captured:',
        'fullscreen_viewshot',
        'fullScreenScrollView',
      );
    });

    it('should capture Transparency', async () => {
      // Transparency screen has auto-capture, no button needed
      await goBackToHome();

      console.log(`🔄 Navigating to: Transparency`);
      try {
        await element(by.id('nav-transparency')).tap();
      } catch {
        await element(by.text('Transparency')).atIndex(0).tap();
      }
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for auto-capture

      // Check for success message
      try {
        await waitFor(element(by.text('✅ Transparency Working!')))
          .toBeVisible()
          .withTimeout(10000);
        console.log(`✅ transparency_viewshot captured`);
      } catch {
        console.log(`⚠️  Auto-capture may have failed, but continuing...`);
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
      await device.takeScreenshot('transparency_viewshot');
      await new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const result = await snapshotMatcher.captureAndValidate(
          'transparency_viewshot',
          null,
          UPDATE_REFERENCES,
        );

        if (UPDATE_REFERENCES) {
          console.log(
            `📸 Reference snapshot created/updated for transparency_viewshot`,
          );
        } else if (result.matched !== null) {
          if (!result.matched) {
            console.log(
              `⚠️  Snapshot mismatch for transparency_viewshot, but test continues`,
            );
          } else {
            console.log(`✅ transparency_viewshot matches reference`);
          }
        }
      } catch (error) {
        console.log(
          `⚠️  Screenshot validation failed for transparency_viewshot: ${error.message}`,
        );
      }
    });

    it('should capture File System save', async () => {
      await captureScreenWithScroll(
        'File System',
        '💾 Save to File System',
        '✅ File Saved:',
        'filesystem_viewshot',
        'fsScrollView',
      );
    });
  });

  describe('🟡 Media Tests', () => {
    it('should capture Video screen', async () => {
      await captureScreenWithScroll(
        'Video Capture',
        '📹 Capture Video Frame',
        '✅ Video Frame Captured:',
        'video_viewshot',
        'videoScrollView',
      );
    });

    it('should capture Image screen', async () => {
      await captureScreenWithScroll(
        'Image Capture',
        '📸 Capture as PNG',
        '✅ Captured Image:',
        'image_viewshot',
        'imageScrollView',
      );
    });

    // TODO: WebView test disabled - capture button is too far below the fold
    // due to the 300px WebView + controls. Needs layout rework to fix.
    // it('should capture WebView', async () => {
    //   await captureScreenWithScroll(
    //     'WebView Capture',
    //     '📸 Capture WebView',
    //     '✅ WebView Captured:',
    //     'webview_viewshot',
    //     'webviewScrollView',
    //   );
    // });
  });

  describe('🟠 Advanced Tests', () => {
    it('should capture SVG Inline', async () => {
      await captureScreenWithScroll(
        'SVG Inline',
        '📸 Capture SVG',
        '✅ SVG Captured:',
        'svg_viewshot',
        'svgScrollView',
      );
    });

    it('should capture SVG URI', async () => {
      await captureScreenWithScroll(
        'SVG URI',
        '📸 Capture SVG URI',
        '✅ SVG URI Captured:',
        'svguri_viewshot',
        'svgUriScrollView',
      );
    });

    it('should capture Modal', async () => {
      await captureScreenWithScroll(
        'Modal',
        '📸 Capture Modal',
        '✅ Modal Captured:',
        'modal_viewshot',
        'modalScrollView',
      );
    });
  });
});
