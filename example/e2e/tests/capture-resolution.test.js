/**
 * Capture resolution / sharpness (#537, #505)
 *
 * Navigates to the Capture resolution screen, which captures a high-detail
 * source (1dp stripes, checkerboard, small text) as a normal view, a tall
 * view (> 1000dp) and a ScrollView with snapshotContentContainer, plus the
 * normal view with explicit width/height in `sizeUnit` "dp", "px" and the
 * platform default unit. The screen decodes each capture and checks its
 * pixel size (layout dp x PixelRatio, or the expected px size) and that the
 * 1dp stripes stay crisp; this test asserts every case reports PASS.
 * Dimension-based, so it does not depend on pixel reference snapshots.
 */

const { goHome } = require('../helpers/test-actions');

// `scrollToElement` (Detox `scroll`) fails on the home ScrollView ("not
// scrollable at the given start point"), so swipe like viewshot-all-screens.
// The entry sits near the end of the home list, hence 20 swipes.
const scrollUntilVisible = async (testID, scrollViewId) => {
  for (let i = 0; i < 20; i++) {
    try {
      await expect(element(by.id(testID))).toBeVisible();
      return;
    } catch {
      await element(by.id(scrollViewId)).swipe('up', 'slow', 0.5);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  await expect(element(by.id(testID))).toBeVisible();
};

const CASES = [
  'normal',
  'tall',
  'scroll',
  'explicit-dp',
  'explicit-px',
  'explicit-default',
];

describe('ViewShot - Capture resolution (#537, #505)', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' },
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(60000);

    await goHome();
    // Home menu uses `nav-${title.toLowerCase().replace(/\s+/g, '-')}`.
    await scrollUntilVisible('nav-capture-resolution', 'homeScrollView');
    // Let the scroll momentum settle before tapping.
    await new Promise(resolve => setTimeout(resolve, 2000));
    await element(by.id('nav-capture-resolution')).tap();

    await waitFor(element(by.id('captureResolutionScrollView')))
      .toBeVisible()
      .withTimeout(10000);

    await element(by.id('capture-button')).tap();

    await waitFor(element(by.id('resolution-summary')))
      .toExist()
      .withTimeout(60000);

    await device.takeScreenshot('capture-resolution');
  });

  for (const id of CASES) {
    it(`captures "${id}" at the expected size, without blur`, async () => {
      try {
        await expect(element(by.id(`resolution-${id}-status`))).toHaveText(
          'PASS',
        );
      } catch (e) {
        // Surface got/expected px and sharpness in the failure output.
        // (No -details element when the capture itself errored.)
        const details = await element(by.id(`resolution-${id}-details`))
          .getAttributes()
          .catch(() => ({ text: '(no details)' }));
        throw new Error(`${id}: ${details.text}\n${e.message}`, { cause: e });
      }
    });
  }
});
