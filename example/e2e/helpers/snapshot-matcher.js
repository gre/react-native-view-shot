/**
 * Pixel snapshot comparison for Detox tests.
 *
 * `expectSnapshot(name, matcher)` takes an element screenshot of `matcher`
 * (the on-screen preview of a capture) and compares it with
 * `e2e/snapshots/reference/<platform>/<name>.png`:
 *
 * - `UPDATE_SNAPSHOTS=true`: the screenshot is written as the reference.
 * - reference missing: the screenshot is written to `output/` and the test fails.
 * - mismatch: `<name>.actual.png` and `<name>.diff.png` are written to
 *   `output/` and the test fails.
 *
 * References are only valid for the simulator/OS that produced them; CI pins
 * the device (see `.detoxrc.js` and the `ios` job in ci.yml).
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

// pixelmatch per-pixel color distance (0..1). Anti-aliased pixels are ignored.
const PIXEL_THRESHOLD = 0.1;
// Fraction of pixels allowed to differ beyond PIXEL_THRESHOLD.
const MAX_DIFF_RATIO = 0.001;

const SNAPSHOTS_DIR = path.join(__dirname, '../snapshots');
const UPDATE = process.env.UPDATE_SNAPSHOTS === 'true';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const readPng = file => PNG.sync.read(fs.readFileSync(file));

/**
 * Compare two PNG files. Returns { ratio, diff } where diff is a PNG or null
 * when the dimensions differ.
 */
function comparePngs(actualPath, referencePath) {
  const actual = readPng(actualPath);
  const reference = readPng(referencePath);
  if (actual.width !== reference.width || actual.height !== reference.height) {
    return {
      ratio: 1,
      diff: null,
      reason: `size ${actual.width}x${actual.height} != reference ${reference.width}x${reference.height}`,
    };
  }
  const { width, height } = actual;
  const diff = new PNG({ width, height });
  const count = pixelmatch(
    actual.data,
    reference.data,
    diff.data,
    width,
    height,
    { threshold: PIXEL_THRESHOLD },
  );
  return { ratio: count / (width * height), diff };
}

async function expectSnapshot(name, matcher) {
  const platform = device.getPlatform();
  const referencePath = path.join(
    SNAPSHOTS_DIR,
    'reference',
    platform,
    `${name}.png`,
  );
  const outputDir = path.join(SNAPSHOTS_DIR, 'output', platform);
  // Detox renders the element's own layer, so it need not be on screen.
  await waitFor(element(matcher)).toExist().withTimeout(10000);
  // Let the preview image decode.
  await sleep(1500);
  let screenshotPath = await element(matcher).takeScreenshot(name);

  if (UPDATE) {
    fs.mkdirSync(path.dirname(referencePath), { recursive: true });
    fs.copyFileSync(screenshotPath, referencePath);
    console.log(`📸 ${name}: reference written to ${referencePath}`);
    return;
  }

  fs.mkdirSync(outputDir, { recursive: true });
  const actualPath = path.join(outputDir, `${name}.actual.png`);
  const diffPath = path.join(outputDir, `${name}.diff.png`);
  fs.rmSync(diffPath, { force: true });
  fs.copyFileSync(screenshotPath, actualPath);

  if (!fs.existsSync(referencePath)) {
    throw new Error(
      `${name}: no reference at ${referencePath}. Actual written to ${actualPath}; ` +
        'review it and run with UPDATE_SNAPSHOTS=true to accept.',
    );
  }

  let result = comparePngs(actualPath, referencePath);
  if (result.ratio > MAX_DIFF_RATIO) {
    // The preview may still have been decoding: take one more screenshot.
    await sleep(2000);
    screenshotPath = await element(matcher).takeScreenshot(name);
    fs.copyFileSync(screenshotPath, actualPath);
    result = comparePngs(actualPath, referencePath);
  }
  const { ratio, diff, reason } = result;
  if (diff && ratio > MAX_DIFF_RATIO) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }
  const pct = (ratio * 100).toFixed(3);
  console.log(`📸 ${name}: ${pct}% pixels differ`);
  if (reason || ratio > MAX_DIFF_RATIO) {
    throw new Error(
      `${name}: snapshot mismatch (${reason || `${pct}% > ${MAX_DIFF_RATIO * 100}%`}). ` +
        `See ${outputDir}.`,
    );
  }
}

module.exports = {
  expectSnapshot,
  comparePngs,
  PIXEL_THRESHOLD,
  MAX_DIFF_RATIO,
};
