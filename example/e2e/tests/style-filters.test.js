/**
 * Style filters repro test (#578)
 *
 * Navigates to the Style filters screen, taps capture and compares the
 * preview with the `style_filters` reference. The reference records the
 * current behavior (on iOS, blur is missing from the capture); a fix for
 * #578 is expected to change it.
 */

const { goHome, scrollToElement } = require('../helpers/test-actions');
const { expectSnapshot } = require('../helpers/snapshot-matcher');

describe('ViewShot - Style filters (#578)', () => {
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

  it('captures the filtered card and shows the (unfiltered) preview', async () => {
    await goHome();

    // Home menu uses `nav-${title.toLowerCase().replace(/\s+/g, '-')}`.
    // The screen title is "Style filters".
    await scrollToElement(by.id('nav-style-filters'), 'homeScrollView');
    await element(by.id('nav-style-filters')).tap();

    await waitFor(element(by.id('styleFiltersTestScrollView')))
      .toBeVisible()
      .withTimeout(10000);

    // The card sits below the intro card; scroll until the capture button shows.
    await scrollToElement(
      by.id('capture-button'),
      'styleFiltersTestScrollView',
    );

    // Sanity check: the section wrapper should also be present.
    await expect(element(by.id('styleFilters-section'))).toExist();

    // Tap capture and wait for the preview wrapper to appear.
    await element(by.id('capture-button')).tap();

    await waitFor(element(by.id('styleFilters-preview')))
      .toExist()
      .withTimeout(15000);

    const preview = by.id('capture-preview');
    await expectSnapshot('style_filters', preview);
  });
});
