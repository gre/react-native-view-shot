/**
 * Pixel-level helpers for E2E assertions on *captured images*.
 *
 * `snapshot-matcher.js` compares PNG byte sizes of `device.takeScreenshot()`
 * output — that answers "does the screen still look the same", which is a
 * different question from "is the image the library produced correct".
 * These helpers answer the second one, by decoding the PNG that `captureRef`
 * wrote and looking at actual pixels.
 *
 * Captures taken with `result: 'tmpfile'` land in the simulator's tmp
 * directory, which is a plain path on the host filesystem, so the test process
 * can read them directly.
 */

const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

/**
 * Decode a PNG from disk.
 *
 * @param {string} filePath - Absolute path, or a `file://` URI as returned by
 *   `captureRef({ result: 'tmpfile' })`.
 * @returns {{width: number, height: number, data: Buffer}} RGBA, 4 bytes/px.
 */
function readPng(filePath) {
  const path = filePath.startsWith('file://')
    ? decodeURIComponent(filePath.slice('file://'.length))
    : filePath;

  if (!fs.existsSync(path)) {
    throw new Error(`No capture file at ${path}`);
  }

  return PNG.sync.read(fs.readFileSync(path));
}

/**
 * Clamp a region to the image bounds so callers can describe regions in
 * logical terms without worrying about the device scale factor.
 */
function clampRegion(png, region) {
  // Clamp the origin from both sides: an out-of-bounds x/y would otherwise
  // read past the buffer and turn every statistic into NaN, with uniqueColors
  // collapsing to 1 — which reads exactly like "flat block", i.e. a false bug
  // signal rather than an error.
  const x = Math.min(Math.max(0, Math.floor(region.x)), png.width - 1);
  const y = Math.min(Math.max(0, Math.floor(region.y)), png.height - 1);
  const w = Math.max(1, Math.min(Math.floor(region.w), png.width - x));
  const h = Math.max(1, Math.min(Math.floor(region.h), png.height - y));
  return { x, y, w, h };
}

/**
 * Describe the content of a rectangular region.
 *
 * `uniqueColors` is the discriminating one for #677: a region whose content
 * has been painted over by an opaque layer collapses to a single color, so
 * `uniqueColors === 1` means "flat block", i.e. the content is gone.
 *
 * Colors are quantized to 4 bits per channel so that anti-aliasing and
 * subpixel text rendering don't inflate the count into meaninglessness — we
 * want "is there anything drawn here at all", not a histogram.
 *
 * @param {{width:number,height:number,data:Buffer}} png
 * @param {{x:number,y:number,w:number,h:number}} region
 */
function regionStats(png, region) {
  const { x, y, w, h } = clampRegion(png, region);
  const seen = new Set();
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let nonWhite = 0;
  let count = 0;

  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      const i = (png.width * py + px) << 2;
      const r = png.data[i];
      const g = png.data[i + 1];
      const b = png.data[i + 2];

      sumR += r;
      sumG += g;
      sumB += b;
      count++;

      // "Not white" with a little slack for PNG rounding and blending.
      if (r < 245 || g < 245 || b < 245) nonWhite++;

      seen.add(((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4));
    }
  }

  return {
    region: { x, y, w, h },
    pixels: count,
    meanR: sumR / count,
    meanG: sumG / count,
    meanB: sumB / count,
    uniqueColors: seen.size,
    nonWhiteRatio: nonWhite / count,
  };
}

/** The middle half of an image — where card content lives, away from borders. */
function centerRegion(png) {
  return {
    x: Math.floor(png.width * 0.25),
    y: Math.floor(png.height * 0.25),
    w: Math.floor(png.width * 0.5),
    h: Math.floor(png.height * 0.5),
  };
}

/**
 * Ratio of differing pixels between two captures (0 = identical, 1 = fully
 * different). Returns 1 when the dimensions disagree, since that is already a
 * complete mismatch.
 *
 * @param {object} a - PNG from `readPng`
 * @param {object} b - PNG from `readPng`
 * @param {{threshold?: number, diffPath?: string}} [options] - `diffPath`
 *   writes a visual diff image, useful when a CI failure needs explaining.
 */
function diffRatio(a, b, options = {}) {
  const { threshold = 0.1, diffPath = null } = options;

  if (a.width !== b.width || a.height !== b.height) {
    return 1;
  }

  const diff = diffPath ? new PNG({ width: a.width, height: a.height }) : null;
  const differing = pixelmatch(
    a.data,
    b.data,
    diff ? diff.data : null,
    a.width,
    a.height,
    { threshold },
  );

  if (diff) {
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
  }

  return differing / (a.width * a.height);
}

module.exports = { readPng, regionStats, centerRegion, diffRatio };
