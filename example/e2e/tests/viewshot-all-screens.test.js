/**
 * Comprehensive ViewShot Tests - All Screens
 *
 * Each test navigates to a screen, captures, waits for the success text and,
 * for deterministic screens, compares the on-screen capture preview
 * (`capture-preview`) with `e2e/snapshots/reference/<platform>/<name>.png`.
 *
 * Screens without a snapshot only assert that the capture succeeds:
 * - Full Screen: captureScreen() includes the scroll position and pressed
 *   button state, which the swipes do not reproduce exactly.
 * - Video: the captured frame depends on playback timing.
 * - SVG URI: renders a remote SVG (network).
 * - WebView: not tested (capture button below the fold, remote page).
 */

const { scrollToElement } = require('../helpers/test-actions');
const { expectSnapshot } = require('../helpers/snapshot-matcher');

describe('ViewShot - All Screens', () => {
  // The largest file runs first and absorbs the first app launch of the run
  // (dev bundle load on a freshly booted simulator), which has exceeded the
  // 180 s default on CI.
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' },
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    // With sync disabled, waitFor polls without waiting for app idle
    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(120000);
  }, 300000);

  // The home title scrolls out of view, so detect home by its ScrollView.
  const goBackToHome = async () => {
    const home = element(by.id('homeScrollView'));
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await expect(home).toBeVisible();
        return;
      } catch {
        // Not home yet
      }
      try {
        await element(by.label('Back')).atIndex(0).tap();
      } catch {
        if (device.getPlatform() === 'android') await device.pressBack();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await expect(home).toBeVisible();
  };

  const openScreen = async screenTitle => {
    await goBackToHome();
    const testId = `nav-${screenTitle.toLowerCase().replace(/\s+/g, '-')}`;
    try {
      await element(by.id('homeScrollView')).scrollTo('top');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Ignore scroll errors
    }
    await scrollToElement(by.id(testId), 'homeScrollView');
    await element(by.id(testId)).tap();
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  /**
   * Navigate to a screen, tap capture, require the success text and, when
   * `snapshot` is given, compare the preview with the reference.
   */
  const captureScreen = async (
    screenTitle,
    successText,
    scrollViewId,
    snapshot,
  ) => {
    await openScreen(screenTitle);

    await scrollToElement(by.id('capture-button'), scrollViewId);
    await element(by.id('capture-button')).tap();

    await waitFor(element(by.text(successText)))
      .toExist()
      .withTimeout(15000);

    if (snapshot) {
      await expectSnapshot(snapshot, by.id('capture-preview'));
    } else {
      await device.takeScreenshot(
        screenTitle.toLowerCase().replace(/\s+/g, '_'),
      );
    }
  };

  describe('Basic Tests', () => {
    it('should capture Basic ViewShot', async () => {
      await captureScreen(
        'Basic ViewShot',
        '✅ Capture Success:',
        'basicTestScrollView',
        'basic',
      );
    });

    it('should capture Full Screen', async () => {
      await captureScreen(
        'Full Screen',
        '✅ Full Screen Captured:',
        'fullScreenScrollView',
      );
    });

    it('should capture Transparency', async () => {
      // captureMode="mount": captures on mount, no button.
      await openScreen('Transparency');
      await waitFor(element(by.text('✅ Transparency Working!')))
        .toExist()
        .withTimeout(15000);
      await expectSnapshot('transparency', by.id('capture-preview'));
    });

    it('should capture File System save', async () => {
      await captureScreen(
        'File System',
        '✅ File Saved:',
        'fsScrollView',
        'filesystem',
      );
    });
  });

  describe('Media Tests', () => {
    it('should capture Video screen', async () => {
      await captureScreen(
        'Video Capture',
        '✅ Video Frame Captured:',
        'videoScrollView',
      );
    });

    it('should capture Image screen', async () => {
      await captureScreen(
        'Image Capture',
        '✅ Captured Image:',
        'imageScrollView',
        'image',
      );
    });
  });

  describe('Advanced Tests', () => {
    it('should capture SVG Inline', async () => {
      await captureScreen(
        'SVG Inline',
        '✅ SVG Captured:',
        'svgScrollView',
        'svg',
      );
    });

    it('should capture SVG URI', async () => {
      await captureScreen(
        'SVG URI',
        '✅ SVG URI Captured:',
        'svgUriScrollView',
      );
    });

    it('should capture Modal', async () => {
      await captureScreen(
        'Modal',
        '✅ Modal Captured:',
        'modalScrollView',
        'modal',
      );
    });
  });

  describe('Rendering Correctness', () => {
    it('should capture Rendering test card', async () => {
      await captureScreen(
        'Rendering test card',
        '✅ Rendering Captured:',
        'renderingTestScrollView',
        'rendering',
      );
    });
  });
});
