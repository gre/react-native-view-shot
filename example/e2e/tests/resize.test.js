/**
 * width / height resize test (#730)
 *
 * Navigates to the Resize screen and captures a four-quadrant view with the
 * default strategy and with `useRenderInContext`, at its natural size, smaller
 * and larger. The screen decodes each capture and checks that all four
 * quadrants are present (not cropped or padded); this test asserts every case
 * reports PASS.
 */

const { goHome } = require('../helpers/test-actions');

// `scrollToElement` (Detox `scroll`) fails on the home ScrollView ("not
// scrollable at the given start point"), so swipe like viewshot-all-screens.
const scrollUntilVisible = async (testID, scrollViewId) => {
  for (let i = 0; i < 10; i++) {
    try {
      await expect(element(by.id(testID))).toBeVisible();
      return;
    } catch {
      await element(by.id(scrollViewId)).swipe('up', 'slow', 0.3);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  await expect(element(by.id(testID))).toBeVisible();
};

const CASES = [
  'default-natural',
  'default-smaller',
  'default-larger',
  'ric-natural',
  'ric-smaller',
  'ric-larger',
];

describe('ViewShot - Resize width/height (#730)', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' },
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(60000);
  });

  it('scales the whole view to width/height with every strategy', async () => {
    await goHome();

    // Home menu uses `nav-${title.toLowerCase().replace(/\s+/g, '-')}`.
    await scrollUntilVisible('nav-resize', 'homeScrollView');
    // Let the scroll momentum settle before tapping.
    await new Promise(resolve => setTimeout(resolve, 2000));
    await element(by.id('nav-resize')).tap();

    await waitFor(element(by.id('resizeTestScrollView')))
      .toBeVisible()
      .withTimeout(10000);

    await scrollUntilVisible('capture-button', 'resizeTestScrollView');
    await element(by.id('capture-button')).tap();

    await waitFor(element(by.id('resize-summary')))
      .toExist()
      .withTimeout(15000);

    // Take a CI artifact screenshot for visual inspection.
    await scrollUntilVisible('resize-summary', 'resizeTestScrollView');
    await device.takeScreenshot('resize');

    for (const id of CASES) {
      await expect(element(by.id(`resize-${id}-status`))).toHaveText('PASS');
    }
  });
});
