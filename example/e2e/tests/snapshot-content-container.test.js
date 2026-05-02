/**
 * snapshotContentContainer demo test
 *
 * Navigates to the ScrollView & Lists screen, scrolls down to the
 * `snapshotContentContainer` section, taps the capture button and asserts
 * that the resulting preview becomes visible.
 *
 * Mirrors the style of `viewshot-all-screens.test.js`.
 */

describe('ViewShot - snapshotContentContainer (ScrollView)', () => {
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

  const goBackToHome = async () => {
    try {
      await expect(element(by.text('🚀 React Native ViewShot'))).toBeVisible();
      return;
    } catch {
      // Not on home, need to navigate back
    }

    try {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await element(by.label('Back')).atIndex(0).tap();
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            await expect(
              element(by.text('🚀 React Native ViewShot')),
            ).toBeVisible();
            return;
          } catch {
            // Not home yet
          }
        } catch {
          break;
        }
      }

      if (device.getPlatform() === 'android') {
        await device.pressBack();
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
      await expect(element(by.text('🚀 React Native ViewShot'))).toBeVisible();
    } catch {
      // Continue anyway
    }
  };

  it('captures the full content of a ScrollView with snapshotContentContainer', async () => {
    await goBackToHome();

    // Home menu uses `nav-${title.toLowerCase().replace(/\s+/g, '-')}`
    // The ScrollView screen title is "ScrollView & Lists".
    const navTestId = 'nav-scrollview-&-lists';

    // Scroll the home screen until the nav button is visible
    try {
      await element(by.id('homeScrollView')).scrollTo('top');
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch {
      // Ignore scroll errors
    }

    let foundNav = false;
    for (let i = 0; i < 8; i++) {
      try {
        await expect(element(by.id(navTestId))).toBeVisible();
        foundNav = true;
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
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (foundNav) {
      try {
        await element(by.id(navTestId)).tap();
      } catch {
        await element(by.text('ScrollView & Lists')).atIndex(0).tap();
      }
    } else {
      await element(by.text('ScrollView & Lists')).atIndex(0).tap();
    }

    // Wait for the screen to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    await waitFor(element(by.id('scrollViewTestScrollView')))
      .toBeVisible()
      .withTimeout(10000);

    // Scroll the inner ScrollView until the new section's capture button
    // is visible. The section sits below the older ScrollView/FlatList/
    // SectionList demos, so we expect to scroll a fair amount.
    try {
      await waitFor(element(by.id('snapshotContentContainer-capture')))
        .toBeVisible()
        .whileElement(by.id('scrollViewTestScrollView'))
        .scroll(300, 'down');
    } catch {
      for (let i = 0; i < 10; i++) {
        try {
          await expect(
            element(by.id('snapshotContentContainer-capture')),
          ).toBeVisible();
          break;
        } catch {
          try {
            await element(by.id('scrollViewTestScrollView')).swipe(
              'up',
              'slow',
              0.6,
            );
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch {
            break;
          }
        }
      }
    }

    await waitFor(element(by.id('snapshotContentContainer-capture')))
      .toBeVisible()
      .withTimeout(10000);

    // Sanity check: the section wrapper should also be present.
    await expect(element(by.id('snapshotContentContainer-section'))).toExist();

    // Tap capture and wait for the preview wrapper to appear.
    await element(by.id('snapshotContentContainer-capture')).tap();

    await waitFor(element(by.id('snapshotContentContainer-preview')))
      .toBeVisible()
      .withTimeout(15000);

    // Take a CI artifact screenshot for visual inspection.
    await device.takeScreenshot('snapshot_content_container');
  });
});
