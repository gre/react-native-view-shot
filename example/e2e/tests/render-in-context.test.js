/**
 * #677 — `useRenderInContext` drops the content of bordered views (iOS/Fabric).
 *
 * ⚠️ THIS TEST IS EXPECTED TO FAIL until the fix lands. It is the TDD
 * reproduction: it asserts the behaviour we want, against a library that
 * currently does not provide it. See PLAN-677.md, step 3.
 *
 * What it does: captures the same three cards twice — once through
 * `drawViewHierarchyInRect` (the default, known good) and once through
 * `renderInContext:` — then reads the resulting PNGs off the simulator's tmp
 * directory and compares actual pixels.
 *
 * The assertions deliberately do NOT use reference snapshots. What is being
 * checked is an invariant ("both strategies must render the same static
 * content", "a captured card is not a flat block"), which holds regardless of
 * iOS version, device scale or font rendering.
 */

// `expect` in this scope is Detox's element matcher. Value assertions need
// Jest's, which Detox's docs tell you to require explicitly.
const { expect: jestExpect } = require('expect');
const {
  readPng,
  regionStats,
  centerRegion,
  diffRatio,
} = require('../helpers/pixels');

const MODES = ['draw', 'ric'];
const CARDS = ['plain', 'border', 'border-clipped'];

// Filled by beforeAll, keyed `${mode}-${card}`.
const uris = {};

describe('ViewShot - useRenderInContext (#677)', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { photos: 'YES', camera: 'YES' },
      launchArgs: { detoxEnableSynchronization: 0 },
    });

    await waitFor(element(by.text('🚀 React Native ViewShot')))
      .toBeVisible()
      .withTimeout(60000);

    await navigateToScreen();

    // Capture through both strategies. Each button captures all three cards.
    // The buttons sit below the three cards, so they start off-screen.
    for (const mode of MODES) {
      await scrollIntoView(`ric-capture-${mode}`);
      await element(by.id(`ric-capture-${mode}`)).tap();
      // The last card to be written tells us the whole batch is done.
      await waitFor(element(by.id(`ric-uri-${mode}-border-clipped`)))
        .toExist()
        .withTimeout(30000);
    }

    for (const mode of MODES) {
      for (const card of CARDS) {
        uris[`${mode}-${card}`] = await readUri(`ric-uri-${mode}-${card}`);
      }
    }

    console.log('📄 captured URIs:', JSON.stringify(uris, null, 2));
  });

  /**
   * Read the text of a `<Text>` node. This is how the test learns where the
   * library wrote the PNG — `result: 'tmpfile'` returns a simulator path that
   * is directly readable from the host.
   */
  const readUri = async testID => {
    const attributes = await element(by.id(testID)).getAttributes();
    const text = attributes.elements
      ? attributes.elements[0].text
      : attributes.text;
    if (!text) throw new Error(`No URI text found for ${testID}`);
    return text;
  };

  /**
   * Bring a node of the test screen into view. The screen is taller than the
   * viewport, so anything below the cards needs scrolling before Detox will
   * accept a tap on it.
   */
  const scrollIntoView = async testID => {
    try {
      await waitFor(element(by.id(testID)))
        .toBeVisible()
        .whileElement(by.id('renderInContextTestScrollView'))
        .scroll(250, 'down');
      return;
    } catch {
      // Fall through to manual swipes.
    }

    for (let i = 0; i < 8; i++) {
      try {
        await expect(element(by.id(testID))).toBeVisible();
        return;
      } catch {
        try {
          await element(by.id('renderInContextTestScrollView')).swipe(
            'up',
            'slow',
            0.5,
          );
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch {
          break;
        }
      }
    }
  };

  const navigateToScreen = async () => {
    const navTestId = 'nav-renderincontext';

    for (let i = 0; i < 10; i++) {
      try {
        await expect(element(by.id(navTestId))).toBeVisible();
        break;
      } catch {
        try {
          await element(by.id('homeScrollView')).swipe('up', 'slow', 0.4);
          await new Promise(resolve => setTimeout(resolve, 400));
        } catch {
          break;
        }
      }
    }

    // Let scroll momentum settle before tapping.
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      await element(by.id(navTestId)).tap();
    } catch {
      await element(by.text('RenderInContext')).atIndex(0).tap();
    }

    await waitFor(element(by.id('renderInContextTestScrollView')))
      .toBeVisible()
      .withTimeout(10000);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  /**
   * GUARD RAIL — must pass BOTH before and after the fix.
   *
   * The card with no border stays on RN's CoreAnimation path, so no extra
   * sublayers are appended and `renderInContext:` has nothing to get wrong.
   * If this fails, the tooling is broken (bad URI, unreadable PNG, wrong
   * region) and every other result in this file is meaningless.
   */
  it('renders the border-less card identically through both strategies', () => {
    const draw = readPng(uris['draw-plain']);
    const ric = readPng(uris['ric-plain']);

    const stats = regionStats(ric, centerRegion(ric));
    jestExpect(stats.uniqueColors).toBeGreaterThan(1);
    jestExpect(diffRatio(draw, ric)).toBeLessThan(0.02);
  });

  /**
   * THE BUG (#677).
   *
   * `borderWidth: 1` with an opaque color and no `overflow: hidden` makes
   * `useCoreAnimationBorderRendering` false, so RN appends an opaque
   * `_backgroundColorLayer` held behind the content only by `zPosition`.
   * `renderInContext:` ignores `zPosition` and paints it last — over the text.
   */
  it('renders the bordered card identically through both strategies', () => {
    const draw = readPng(uris['draw-border']);
    const ric = readPng(uris['ric-border']);

    const stats = regionStats(ric, centerRegion(ric));

    // The reported symptom, stated directly: the card came back as a flat
    // block instead of the text it contains.
    jestExpect(stats.uniqueColors).toBeGreaterThan(1);

    // And the stronger invariant: both strategies must agree on static content.
    jestExpect(diffRatio(draw, ric)).toBeLessThan(0.02);
  });

  /**
   * DIAGNOSTIC — tells the two failure modes apart.
   *
   * With `overflow: hidden`, RN takes the `createMaskLayer` branch instead of
   * appending background sublayers. `renderInContext:` ignores `mask` too, but
   * fixing that needs a different change than the zPosition ordering, so which
   * of these two tests fails decides the shape of the fix.
   */
  it('renders the clipped bordered card identically through both strategies', () => {
    const draw = readPng(uris['draw-border-clipped']);
    const ric = readPng(uris['ric-border-clipped']);

    const stats = regionStats(ric, centerRegion(ric));
    jestExpect(stats.uniqueColors).toBeGreaterThan(1);
    jestExpect(diffRatio(draw, ric)).toBeLessThan(0.02);
  });
});
